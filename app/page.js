"use client";
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.background}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Image src="/DOC NEST LOGO.png" alt="DocNest Logo" width={160} height={48} />
        </div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navButton}>Login</Link>
          <Link href="/register" className={styles.navButton}>Register</Link>
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.reload();
            }}
            className={styles.navButton}
            style={{ background: '#dc2626', color: 'white' }}
          >
            Clear Session
          </button>
        </div>
      </nav>
      
      <div className={styles.hero}>
        <Image 
          src="/HOME DM.png" 
          alt="Document management illustration" 
          width={1920} 
          height={400} 
          style={{ width: '100%', height: 'auto', display: 'block' }} 
          priority 
        />
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Secure Document Management</h1>
          <p className={styles.heroSubtitle}>
            Store, organize, and manage your business documents with ease. 
            Access your files anywhere, anytime with our secure cloud platform.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/register" className={styles.heroButtonPrimary}>
              Get Started Free
            </Link>
            <Link href="/login" className={styles.heroButtonSecondary}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
     
      <footer className={styles.footer}>
        © DocNest 2025. All rights reserved.
      </footer>
    </div>
  );
}
