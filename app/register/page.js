"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import styles from '../page.module.css';

export default function Register() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Step 1: Register the user
      const res = await fetch('/api/auth/register-nextauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        console.log('Registration successful:', data);
        
        // Step 2: Auto-login after register using NextAuth
        // Add a small delay to ensure the user data is properly saved
        setTimeout(async () => {
          try {
            console.log('Attempting auto-login for:', username);
            const result = await signIn('credentials', {
              username,
              password,
              redirect: false,
            });
            
            console.log('Auto-login result:', result);
            
            if (result?.error) {
              console.error('Auto-login failed:', result.error);
              setError('Registration succeeded but login failed. Please try logging in manually.');
            } else if (result?.ok) {
              console.log('Auto-login successful, redirecting to dashboard');
              router.push('/dashboard');
            } else {
              console.log('Auto-login result unclear, redirecting anyway');
              router.push('/dashboard');
            }
          } catch (loginError) {
            console.error('Auto-login error:', loginError);
            setError('Registration succeeded but login failed. Please try logging in manually.');
          }
        }, 1000); // Increased delay to 1 second
      } else {
        console.error('Registration failed:', data);
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error - please check your connection');
    }
    setLoading(false);
  };

  return (
    <div className={styles.background}>
      <div className={styles.logo}>
        <Image src="/DOC NEST LOGO.png" alt="DocNest Logo" width={160} height={48} />
      </div>
      
      <div className={styles['auth-title']}>Create your DocNest account</div>
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
          <label className={styles['auth-label']}>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className={styles['auth-input']}
            required
          />
          <button type="submit" disabled={loading} className={styles['auth-btn']}>
            {loading ? "Registering..." : "Register"}
          </button>
          {error && <div className={styles['auth-error']}>{error}</div>}
        </form>
        <div className={styles['auth-link-container']}>
          Already have an account? <Link href="/login" className={styles['auth-link']}>Login</Link>
        </div>
        {error && error.includes('login failed') && (
          <div className={styles['auth-link-container']} style={{ marginTop: '10px' }}>
            <Link href="/login" className={styles['auth-link']}>
              Click here to login manually
            </Link>
          </div>
        )}
      </div>
      
      <div className={styles.footer}>
        © DocNest 2025. All rights reserved.
      </div>
    </div>
  );
} 