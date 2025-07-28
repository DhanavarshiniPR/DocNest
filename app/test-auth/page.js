"use client";
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function TestAuth() {
  const { data: session, status } = useSession();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setTestResult('Testing registration...');
    
    try {
      // Test registration
      const regRes = await fetch('/api/auth/register-nextauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: `testuser_${Date.now()}`, 
          password: 'testpass123' 
        })
      });
      
      const regData = await regRes.json();
      
      if (regRes.ok) {
        setTestResult(`Registration successful: ${regData.username}`);
        
        // Test login immediately after registration
        setTimeout(async () => {
          setTestResult('Testing login after registration...');
          
          const loginResult = await signIn('credentials', {
            username: regData.username,
            password: 'testpass123',
            redirect: false,
          });
          
          if (loginResult?.error) {
            setTestResult(`Login failed: ${loginResult.error}`);
          } else {
            setTestResult('Login successful after registration!');
          }
        }, 1000);
      } else {
        setTestResult(`Registration failed: ${regData.error}`);
      }
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testExistingUser = async () => {
    setLoading(true);
    setTestResult('Testing existing user login...');
    
    try {
      const result = await signIn('credentials', {
        username: 'Varshini',
        password: 'password123', // You'll need to know the actual password
        redirect: false,
      });
      
      if (result?.error) {
        setTestResult(`Login failed: ${result.error}`);
      } else {
        setTestResult('Login successful with existing user!');
      }
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Session Status</h2>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Authenticated:</strong> {session ? 'Yes' : 'No'}</p>
        {session && (
          <div>
            <p><strong>Username:</strong> {session.user?.username}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Actions</h2>
        <button 
          onClick={testRegistration} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Test Registration + Login
        </button>
        
        <button 
          onClick={testExistingUser} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Test Existing User
        </button>
        
        <button 
          onClick={() => signOut()} 
          style={{ padding: '10px' }}
        >
          Sign Out
        </button>
      </div>

      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px' 
        }}>
          <h3>Test Result:</h3>
          <p>{testResult}</p>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h2>Navigation</h2>
        <a href="/login" style={{ marginRight: '10px' }}>Go to Login</a>
        <a href="/register" style={{ marginRight: '10px' }}>Go to Register</a>
        <a href="/dashboard">Go to Dashboard</a>
      </div>
    </div>
  );
} 