import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readUsers, writeUsers, addUser, debugUsers } from '../../../lib/auth-utils';

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

    const users = debugUsers();
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
    
    const addSuccess = addUser(newUser);
    if (!addSuccess) {
      console.log('Failed to add user to file');
      return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
    }

    console.log('Registration successful for:', username);
    console.log('Added new user:', { username: newUser.username, hasPassword: !!newUser.password });
    
    // Verify the user was added
    const updatedUsers = debugUsers();
    console.log('Updated users list:', updatedUsers.map(u => u.username));

    return NextResponse.json({ success: true, username });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 