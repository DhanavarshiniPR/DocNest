import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    
    console.log('Auth check - Token present:', !!token);
    console.log('Auth check - Request headers:', Object.fromEntries(req.headers.entries()));
    
    if (!token) {
      console.log('No token found in cookies');
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token in /api/auth/me:', decoded);
    
    return NextResponse.json({ 
      success: true, 
      username: decoded.username 
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
} 