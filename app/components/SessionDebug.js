"use client";
import { useSession } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#000000',
      color: '#ffffff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      wordBreak: 'break-all'
    }}>
      <div><strong>Status:</strong> {status}</div>
      <div><strong>Session:</strong> {session ? 'Yes' : 'No'}</div>
      <div><strong>User:</strong> {session?.user ? 'Yes' : 'No'}</div>
      <div><strong>Username:</strong> {session?.user?.username || 'None'}</div>
      <div><strong>Email:</strong> {session?.user?.email || 'None'}</div>
    </div>
  );
} 