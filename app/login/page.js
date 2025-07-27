"use client";
import { useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
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