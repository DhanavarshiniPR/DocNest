"use client";
import { useState, useEffect } from "react";
import styles from '../page.module.css';

export default function TestAuth() {
  const [authStatus, setAuthStatus] = useState('Loading...');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setAuthStatus('Checking authentication...');
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      
      if (res.ok) {
        setAuthStatus('Authenticated');
        setUserData(data);
        setError(null);
      } else {
        setAuthStatus('Not authenticated');
        setError(data.error);
        setUserData(null);
      }
    } catch (err) {
      setAuthStatus('Error checking auth');
      setError(err.message);
      setUserData(null);
    }
  };

  const testLogin = async () => {
    try {
      setAuthStatus('Testing login...');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: 'test123' })
      });
      const data = await res.json();
      
      if (res.ok) {
        setAuthStatus('Login successful');
        setTimeout(checkAuth, 1000); // Check auth after login
      } else {
        setAuthStatus('Login failed');
        setError(data.error);
      }
    } catch (err) {
      setAuthStatus('Login error');
      setError(err.message);
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles['auth-card']}>
        <h2>Authentication Test</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <strong>Status:</strong> {authStatus}
        </div>
        
        {userData && (
          <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
            <strong>User Data:</strong>
            <pre>{JSON.stringify(userData, null, 2)}</pre>
          </div>
        )}
        
        {error && (
          <div style={{ marginBottom: '20px', padding: '10px', background: '#ffebee', borderRadius: '5px', color: '#c62828' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={checkAuth} className={styles['auth-btn']}>
            Check Auth
          </button>
          <button onClick={testLogin} className={styles['auth-btn']}>
            Test Login
          </button>
        </div>
      </div>
    </div>
  );
} 