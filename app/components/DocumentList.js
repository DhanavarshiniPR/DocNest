"use client";
import React, { useEffect, useState } from 'react';

const DocumentList = ({ listClass = '', itemClass = '', linkClass = '' }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data.files || []);
      setLoading(false);
    };
    fetchDocuments();
  }, []);

  if (loading) return <div>Loading documents...</div>;
  if (!documents.length) return <div>No documents uploaded yet.</div>;

  return (
    <ul className={listClass}>
      {documents.map((doc) => (
        <li key={doc} className={itemClass}>
          <a href={`/uploads/${doc}`} target="_blank" rel="noopener noreferrer" className={linkClass}>{doc}</a>
        </li>
      ))}
    </ul>
  );
};

export default DocumentList; 