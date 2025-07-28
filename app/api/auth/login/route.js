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

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
} 