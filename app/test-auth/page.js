"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestAuth() {
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setAuthStatus('Authenticated');
        setUsername(data.username);
      } else {
        setAuthStatus('Not authenticated');
        setUsername('');
      }
    } catch (error) {
      setAuthStatus('Error checking auth');
      console.error('Auth check error:', error);
    }
  };

  const clearSession = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthStatus('Session cleared');
      setUsername('');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Current Status:</h2>
        <p><strong>Auth Status:</strong> {authStatus}</p>
        {username && <p><strong>Username:</strong> {username}</p>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Actions:</h2>
        <button 
          onClick={checkAuthStatus}
          style={{ 
            marginRight: '10px', 
            padding: '10px 15px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Check Auth Status
        </button>
        
        <button 
          onClick={clearSession}
          style={{ 
            marginRight: '10px', 
            padding: '10px 15px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Session
        </button>
        
        <button 
          onClick={goToDashboard}
          style={{ 
            marginRight: '10px', 
            padding: '10px 15px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Dashboard
        </button>
        
        <button 
          onClick={goToLogin}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#ffc107', 
            color: 'black', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Instructions:</h2>
        <ol>
          <li>Click &quot;Clear Session&quot; to remove any existing authentication</li>
          <li>Click &quot;Go to Login&quot; to test the login page</li>
          <li>Try to access the dashboard directly - it should redirect to login</li>
          <li>After logging in, you should be able to access the dashboard</li>
        </ol>
      </div>
    </div>
  );
} 