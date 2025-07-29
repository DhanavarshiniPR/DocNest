"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export default function Login() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if already authenticated - but only if we have a valid session
  useEffect(() => {
    console.log('Login page useEffect - status:', status, 'session:', session);
    if (status === 'loading') {
      console.log('Session still loading, waiting...');
      return;
    }
    if (status === 'authenticated' && session && session.user) {
      console.log('User is authenticated, redirecting to dashboard');
      router.push('/dashboard');
    } else {
      console.log('User is not authenticated, staying on login page');
    }
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid username or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
    setLoading(false);
  };

  // Show loading state while session is being determined
  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
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
        <h1 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '2rem' }}>Welcome Back</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Sign in to your DocNest account</p>
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
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
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{
              backgroundColor: loading ? '#ccc' : '#007bff',
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
          {error && (
            <div style={{ color: '#dc3545', textAlign: 'center', marginTop: '1rem' }}>
              {error}
            </div>
          )}
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          Don't have an account? <Link href="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
        © DocNest 2025. All rights reserved.
      </div>
    </div>
  );
} 