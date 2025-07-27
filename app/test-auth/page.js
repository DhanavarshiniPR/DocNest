"use client";
import { useEffect, useState } from 'react';

export default function TestAuth() {
  const [authStatus, setAuthStatus] = useState('Loading...');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setAuthStatus(`Authenticated as: ${data.username}`);
        } else {
          setAuthStatus('Not authenticated');
        }
      } catch (error) {
        setAuthStatus('Error checking auth');
      }
    };

    checkAuth();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Authentication Test</h1>
      <p>Status: {authStatus}</p>
      <button 
        onClick={async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          window.location.reload();
        }}
        style={{ 
          background: '#dc2626', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
      <br /><br />
      <a href="/dashboard" style={{ color: '#3b82f6' }}>Try to access Dashboard</a>
    </div>
  );
} 