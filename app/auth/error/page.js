"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../page.module.css';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'Default':
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.logo}>
        <img src="/DOC NEST LOGO.png" alt="DocNest Logo" style={{ width: '160px', height: '48px' }} />
      </div>
      
      <div className={styles['auth-title']}>Authentication Error</div>
      <div className={styles['auth-card']}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>Authentication Failed</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            {getErrorMessage(error)}
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#888' }}>
              Error Code: {error || 'Unknown'}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/login" className={styles['auth-btn']} style={{ textDecoration: 'none', textAlign: 'center' }}>
              Try Again
            </Link>
            <Link href="/register" className={styles['auth-link']} style={{ textDecoration: 'none', textAlign: 'center' }}>
              Create New Account
            </Link>
            <Link href="/" className={styles['auth-link']} style={{ textDecoration: 'none', textAlign: 'center' }}>
              Go to Home
            </Link>
          </div>
        </div>
      </div>
      
      <div className={styles.footer}>
        © DocNest 2025. All rights reserved.
      </div>
    </div>
  );
} 