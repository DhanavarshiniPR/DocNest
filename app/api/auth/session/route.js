import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session check result:', session);
    
    if (session) {
      return NextResponse.json({ 
        authenticated: true, 
        user: session.user 
      });
    } else {
      return NextResponse.json({ 
        authenticated: false, 
        user: null 
      });
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ 
      authenticated: false, 
      error: error.message 
    });
  }
} 