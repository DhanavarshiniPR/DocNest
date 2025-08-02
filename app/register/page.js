"use client";
import { useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-nextauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Registration successful! Please login with your new account.');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error - please check your connection');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Logo Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Image 
          src="/DOC NEST LOGO.png" 
          alt="DocNest Logo" 
          width={200} 
          height={60}
          style={{ marginBottom: '1rem' }}
        />
        <h1 style={{ color: '#000000', marginBottom: '0.5rem', fontSize: '2rem' }}>Create Account</h1>
        <p style={{ color: '#333333', fontSize: '1.1rem' }}>Join DocNest today</p>
      </div>

      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000000' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000000' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000000' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{
              backgroundColor: loading ? '#ccc' : '#000000',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
          
          {error && (
            <div style={{ color: '#dc3545', textAlign: 'center', marginTop: '1rem' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ color: '#28a745', textAlign: 'center', marginTop: '1rem', fontWeight: 'bold' }}>
              {success}
            </div>
          )}
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          Already have an account? <Link href="/login" style={{ color: '#000000', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#666666' }}>
        © DocNest 2025. All rights reserved.
      </div>
    </div>
  );
} 