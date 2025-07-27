"use client";
import { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import styles from '../page.module.css';

export default function DocumentSection() {
  const [refresh, setRefresh] = useState(0);
  return (
    <div className={styles.background}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Business Document Upload</h1>
        <DocumentUpload onUpload={() => setRefresh(r => r + 1)} buttonClass={styles.button} inputClass={styles.input} />
        <DocumentList key={refresh} listClass={styles.list} itemClass={styles.listItem} linkClass={styles.link} />
      </div>
    </div>
  );
} 