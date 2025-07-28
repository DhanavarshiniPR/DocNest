"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import styles from '../page.module.css';

export default function Login() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log('Attempting login for:', username);
      
      // First, let's check if the user exists by making a test request
      const testRes = await fetch('/api/auth/register-nextauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: 'test' })
      });
      
      if (testRes.status === 409) {
        console.log('User exists, proceeding with login');
      } else {
        console.log('User might not exist or other issue');
      }
      
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      console.log('Login result:', result);

      if (result?.error) {
        console.error('Login error details:', result.error);
        setError('Invalid username or password');
      } else if (result?.ok) {
        console.log('Login successful, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('Login result unclear, checking session...');
        // Check if we have a session
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        console.log('Session data:', sessionData);
        
        if (sessionData.user) {
          console.log('Session found, redirecting to dashboard');
          router.push('/dashboard');
        } else {
          console.log('No session found, login might have failed');
          setError('Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error');
    }
    setLoading(false);
  };

  const handleGitHubLogin = async () => {
    setGithubLoading(true);
    setError("");
    try {
      console.log('Attempting GitHub login');
      const result = await signIn('github', {
        callbackUrl: '/dashboard',
        redirect: false,
      });

      console.log('GitHub login result:', result);

      if (result?.error) {
        setError('GitHub login failed');
      } else if (result?.url) {
        router.push(result.url);
      } else {
        // If no error but also no URL, try redirecting to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('GitHub login error:', err);
      setError('GitHub login error');
    }
    setGithubLoading(false);
  };

  return (
    <div className={styles.background}>
      <div className={styles.logo}>
        <Image src="/DOC NEST LOGO.png" alt="DocNest Logo" width={160} height={48} />
      </div>
      
      <div className={styles['auth-title']}>Sign in to DocNest</div>
      <div className={styles['auth-card']}>
        <form onSubmit={handleSubmit} className={styles['auth-form']} autoComplete="off">
          <label className={styles['auth-label']}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className={styles['auth-input']}
            required
          />
          <label className={styles['auth-label']}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={styles['auth-input']}
            required
          />
          <button type="submit" disabled={loading} className={styles['auth-btn']}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <div className={styles['auth-error']}>{error}</div>}
        </form>
        
        <div className={styles['auth-divider']}>
          <span>or</span>
        </div>
        
        <button 
          onClick={handleGitHubLogin} 
          disabled={githubLoading} 
          className={styles['auth-github-btn']}
        >
          {githubLoading ? (
            "Connecting to GitHub..."
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </>
          )}
        </button>
        
        <div className={styles['auth-link-container']}>
          New to DocNest? <Link href="/register" className={styles['auth-link']}>Register</Link>
        </div>
      </div>
      
      <div className={styles.footer}>
        © DocNest 2025. All rights reserved.
      </div>
    </div>
  );
} 