"use client";
import React, { useState } from 'react';

const DocumentUpload = ({ onUpload, buttonClass = '', inputClass = '' }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      setFile(null);
      if (onUpload) onUpload();
    } catch (err) {
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24, width: '100%' }}>
      <input type="file" onChange={handleFileChange} className={inputClass} />
      <button type="submit" disabled={uploading} className={buttonClass} style={{ marginLeft: 8 }}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default DocumentUpload; 