import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const USERS_FILE = path.join(process.cwd(), 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Fallback storage for production environments
let inMemoryUsers = [];

function readUsers() {
  try {
    // In production, try to use in-memory storage first
    if (process.env.NODE_ENV === 'production' && inMemoryUsers.length > 0) {
      return inMemoryUsers;
    }
    
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const users = JSON.parse(data);
      // Cache in memory for production
      if (process.env.NODE_ENV === 'production') {
        inMemoryUsers = users;
      }
      return users;
    }
  } catch (error) {
    console.error('Error reading users file:', error);
    // In production, return in-memory users as fallback
    if (process.env.NODE_ENV === 'production') {
      return inMemoryUsers;
    }
  }
  return [];
}

function writeUsers(users) {
  try {
    // Update in-memory storage for production
    if (process.env.NODE_ENV === 'production') {
      inMemoryUsers = users;
    }
    
    // Try to write to file system (may fail in production)
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    // In production, consider in-memory storage as success
    if (process.env.NODE_ENV === 'production') {
      console.log('Using in-memory storage for production');
      return true;
    }
    return false;
  }
}

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const users = readUsers();
    
    if (users.find(u => u.username === username)) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    users.push({ username, password: hash });
    
    // Check if write was successful
    const writeSuccess = writeUsers(users);
    if (!writeSuccess) {
      return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    console.log('Created JWT token for username:', username);
    console.log('Token payload:', { username });
    
    const response = NextResponse.json({ success: true, username });
    
    // Improved cookie settings for production
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || 
                   req.headers.get('x-forwarded-ssl') === 'on' ||
                   req.url.startsWith('https://');
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProduction && isHttps, // Only secure in production with HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    console.log('Set cookie with token. Production:', isProduction, 'HTTPS:', isHttps);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 