"use client";
import Link from 'next/link';

export default function TestRegister() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Register Page Test</h1>
      <p>This page tests if the register route is accessible.</p>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Navigation Links:</h2>
        <ul>
          <li><Link href="/register" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Register Page</Link></li>
          <li><Link href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Login Page</Link></li>
          <li><Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Home Page</Link></li>
        </ul>
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Direct Links:</h2>
        <ul>
          <li><a href="/register" style={{ color: 'green', textDecoration: 'underline' }}>Direct Register Link</a></li>
          <li><a href="/login" style={{ color: 'green', textDecoration: 'underline' }}>Direct Login Link</a></li>
        </ul>
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Current URL Info:</h2>
        <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server side'}</p>
      </div>
    </div>
  );
} 