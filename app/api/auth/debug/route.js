import { NextResponse } from 'next/server';

export async function GET(req) {
  const envInfo = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
    GITHUB_ID: process.env.GITHUB_ID ? 'Set' : 'Not set',
    GITHUB_SECRET: process.env.GITHUB_SECRET ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    message: 'NextAuth Debug Info',
    environment: envInfo,
    timestamp: new Date().toISOString(),
  });
} 