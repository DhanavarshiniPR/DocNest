import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req) {
  const { username, password } = await req.json();
  // Demo credentials
  if (username === 'admin' && password === 'password123') {
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', serialize('auth', 'true', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    }));
    return response;
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
} 