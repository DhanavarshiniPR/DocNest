"use client";
import styles from '../page.module.css';

export default function ClearSessionButton() {
  const handleClearSession = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <button 
      onClick={handleClearSession}
      className={styles.navButton}
      style={{ background: '#dc2626', color: 'white' }}
    >
      Clear Session
    </button>
  );
} 