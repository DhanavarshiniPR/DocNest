import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const USERS_FILE = path.join(process.cwd(), 'users.json');

// Fallback storage for production environments
let inMemoryUsers = [];

function readUsers() {
  try {
    if (process.env.NODE_ENV === 'production' && inMemoryUsers.length > 0) {
      return inMemoryUsers;
    }
    
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const users = JSON.parse(data);
      if (process.env.NODE_ENV === 'production') {
        inMemoryUsers = users;
      }
      return users;
    }
  } catch (error) {
    console.error('Error reading users file:', error);
    if (process.env.NODE_ENV === 'production') {
      return inMemoryUsers;
    }
  }
  return [];
}

function writeUsers(users) {
  try {
    if (process.env.NODE_ENV === 'production') {
      inMemoryUsers = users;
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    if (process.env.NODE_ENV === 'production') {
      return true;
    }
    return false;
  }
}

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    console.log('Registration request for username:', username);

    if (!username || !password) {
      console.log('Missing username or password');
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (username.length < 3) {
      console.log('Username too short:', username);
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    if (password.length < 6) {
      console.log('Password too short');
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const users = readUsers();
    console.log('Current users before registration:', users.map(u => u.username));
    
    if (users.find(u => u.username === username)) {
      console.log('Username already exists:', username);
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      password: hash,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    console.log('Added new user:', { username: newUser.username, hasPassword: !!newUser.password });
    
    const writeSuccess = writeUsers(users);
    if (!writeSuccess) {
      console.log('Failed to write users to file');
      return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
    }

    console.log('Registration successful for:', username);
    console.log('Updated users list:', users.map(u => u.username));

    return NextResponse.json({ success: true, username });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 