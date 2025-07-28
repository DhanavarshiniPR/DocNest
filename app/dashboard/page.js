"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';
import Image from 'next/image';


const categories = [
  "My Drive", 
  "Recent",
  "Starred",
  "Trash"
];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType) {
  if (fileType?.includes('image')) return '🖼️';
  if (fileType?.includes('pdf')) return '📄';
  if (fileType?.includes('text')) return '📝';
  if (fileType?.includes('video')) return '🎥';
  if (fileType?.includes('audio')) return '🎵';
  return '📄';
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState('My Drive');
  const [docs, setDocs] = useState({
    'My Drive': [],
    'Shared with me': []
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    } else {
      setUsername(session.user.username);
    }
  }, [session, status, router]);
  
  // Debug username state changes
  useEffect(() => {
    console.log('Username state changed to:', username);
  }, [username]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [currentPath, setCurrentPath] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState('list');
  const [uploading, setUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState(0);
  const [starredItems, setStarredItems] = useState(new Set());
  const [trashItems, setTrashItems] = useState(new Map()); // Changed to Map to store item data
  const [recentItems, setRecentItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataLoadMessage, setDataLoadMessage] = useState("");
  const [contextSelectedId, setContextSelectedId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Debug mobile menu state
  useEffect(() => {
    console.log('Mobile menu state changed to:', mobileMenuOpen);
  }, [mobileMenuOpen]);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.username) return;
      
      setDataLoading(true);
      try {
        console.log('Loading data for user:', session.user.username);
        setUsername(session.user.username);
        
        // Load user's saved data
        const res = await fetch('/api/data/load', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: session.user.username })
        });
        
        if (res.ok) {
          const { data } = await res.json();
          console.log('Loaded user data for', session.user.username, ':', data);
          
          if (data.docs) {
            setDocs(data.docs);
          }
          if (data.starredItems) {
            setStarredItems(new Set(data.starredItems));
          }
          if (data.trashItems) {
            setTrashItems(new Map(data.trashItems));
          }
          if (data.recentItems) {
            setRecentItems(data.recentItems);
          }
          setDataLoaded(true);
        } else {
          console.error('Failed to load user data');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
      setDataLoading(false);
    };
    
    loadUserData();
  }, [session]);


  const saveData = async () => {
    if (!username || !dataLoaded) {
      console.log('Cannot save data - username:', username, 'dataLoaded:', dataLoaded);
      return;
    }
    
    try {
      const dataToSave = {
        docs,
        starredItems: Array.from(starredItems),
        trashItems: Array.from(trashItems.entries()),
        recentItems
      };
      
      console.log('Saving data for user:', username);
      console.log('Docs to save:', dataToSave.docs);
      console.log('Starred items to save:', dataToSave.starredItems);
      console.log('Recent items to save:', dataToSave.recentItems);
      
      const res = await fetch('/api/data/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, data: dataToSave })
      });
      
      if (res.ok) {
        console.log('Data saved successfully for user:', username);
      } else {
        console.error('Failed to save data for user:', username);
      }
    } catch (error) {
      console.error('Error saving data for user:', username, error);
    }
  };

  // Auto-save when data changes
  useEffect(() => {
    if (dataLoaded) {
      saveData();
    }
  }, [docs, starredItems, trashItems, recentItems, dataLoaded]);

  function getCurrentDocs() {
    let arr = docs[selected] || [];
    for (const folder of currentPath) {
      const found = arr.find(d => d.type === 'folder' && d.name === folder);
      if (!found) return [];
      arr = found.children || [];
    }
    return arr;
  }

  function updateCurrentDocs(updater) {
    setDocs(prev => {
      const newDocs = { ...prev };
      if (!newDocs[selected]) newDocs[selected] = [];
      let arr = newDocs[selected];
      for (const folder of currentPath) {
        const idx = arr.findIndex(d => d.type === 'folder' && d.name === folder);
        if (idx === -1) return prev;
        arr = arr[idx].children = arr[idx].children || [];
      }
      updater(arr);
      return newDocs;
    });
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    console.log('Upload triggered', { file: file?.name, uploading });
    
    if (!file) {
      setError("Please select a file.");
      return;
    }
    
    if (uploading) {
      console.log('Upload already in progress, ignoring');
      return;
    }
    
    // Prevent rapid successive uploads (debounce)
    const now = Date.now();
    if (now - lastUploadTime < 1000) { // 1 second debounce
      console.log('Upload too soon after last upload, ignoring');
      return;
    }
    
    setUploading(true);
    setError("");
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log('Starting upload for:', file.name);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (res.ok && data.url) {
        console.log('Upload successful:', data.name);
        
        // Check if file already exists to prevent duplicates
        const currentDocs = getCurrentDocs();
        const fileExists = currentDocs.some(doc => 
          doc.type === 'file' && doc.name === data.name
        );
        
        console.log('File exists check:', { fileName: data.name, exists: fileExists, currentCount: currentDocs.length });
        
        if (!fileExists) {
          console.log('Adding file to list:', data.name);
          const newFileId = makeId();
          updateCurrentDocs(arr => {
            console.log('Before adding:', arr.length);
            // Check again inside the update function to prevent race conditions
            const duplicateCheck = arr.some(doc => 
              doc.type === 'file' && doc.name === data.name
            );
            
            if (!duplicateCheck) {
              const newFile = { 
                id: newFileId, 
                name: data.name, 
                url: data.url, 
                type: 'file',
                size: data.size,
                fileType: data.type,
                uploadDate: new Date().toISOString()
              };
              arr.push(newFile);
              addToRecent(newFile);
              console.log('After adding:', arr.length);
            } else {
              console.log('Duplicate detected during update, skipping');
            }
          });
        } else {
          console.log('File already exists, not adding duplicate');
        }
        
        setFile(null);
        setError("");
        
        // Manually trigger save after successful upload
        setTimeout(() => saveData(), 100);
      } else {
        console.log('Upload failed:', data.error);
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed');
    } finally {
      setUploading(false);
      setLastUploadTime(Date.now());
    }
  };

  const handleRemove = (id) => {
    updateCurrentDocs(arr => {
      const idx = arr.findIndex(doc => doc.id === id);
      if (idx !== -1) arr.splice(idx, 1);
    });
  };

  const handleEdit = (id, name) => {
    setEditId(id);
    setEditName(name);
  };

  const handleEditSave = (id) => {
    updateCurrentDocs(arr => {
      const doc = arr.find(d => d.id === id);
      if (doc) doc.name = editName;
    });
    setEditId(null);
    setEditName("");
  };

  const handleView = (url, doc) => {
    if (doc) {
      addToRecent(doc);
    }
    window.open(url, '_blank');
  };

  const handleNewFolder = () => {
    if (!newFolderName.trim()) return;
    
    // Prevent double creation by checking if folder name is empty after creation
    const folderName = newFolderName.trim();
    setNewFolderName(""); // Clear input immediately to prevent double submission
    
    // Clear any existing selections
    setSelectedItems([]);
    
    updateCurrentDocs(arr => {
      // Check if folder with same name already exists
      const existingFolder = arr.find(doc => doc.type === 'folder' && doc.name === folderName);
      if (!existingFolder) {
        arr.push({ 
          id: makeId(), 
          name: folderName, 
          type: 'folder', 
          children: [],
          createdDate: new Date().toISOString()
        });
      }
    });
    
    // Manually trigger save after creating folder
    setTimeout(() => saveData(), 100);
  };

  const handleEnterFolder = (name) => setCurrentPath([...currentPath, name]);
  const handleBreadcrumb = (idx) => setCurrentPath(currentPath.slice(0, idx + 1));
  const handleRenameFolder = (id, name) => {
    setRenamingId(id);
    setRenameValue(name);
  };

  const handleRenameSave = (id) => {
    updateCurrentDocs(arr => {
      const doc = arr.find(d => d.id === id);
      if (doc) doc.name = renameValue;
    });
    setRenamingId(null);
    setRenameValue("");
  };

  const handleDeleteFolder = (id) => {
    updateCurrentDocs(arr => {
      const idx = arr.findIndex(doc => doc.id === id);
      if (idx !== -1) arr.splice(idx, 1);
    });
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === sortedAndFilteredDocs.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedAndFilteredDocs.map(doc => doc.id));
    }
  };

  const handleBulkDelete = () => {
    updateCurrentDocs(arr => {
      selectedItems.forEach(id => {
        const idx = arr.findIndex(doc => doc.id === id);
        if (idx !== -1) {
          // Move to trash instead of permanent delete
          const item = arr[idx];
          setTrashItems(prev => new Set([...prev, item.id]));
          arr.splice(idx, 1);
        }
      });
    });
    setSelectedItems([]);
  };

  // Star/Unstar functionality
  const handleToggleStar = (id) => {
    setStarredItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    
    // Manually trigger save after starring/unstarring
    setTimeout(() => saveData(), 100);
  };

  // Move to trash functionality
  const handleMoveToTrash = (id) => {
    const currentDocs = getCurrentDocs();
    const itemToTrash = currentDocs.find(doc => doc.id === id);
    
    if (itemToTrash) {
      setTrashItems(prev => {
        const newMap = new Map(prev);
        newMap.set(id, itemToTrash);
        return newMap;
      });
      
      updateCurrentDocs(arr => {
        const idx = arr.findIndex(doc => doc.id === id);
        if (idx !== -1) arr.splice(idx, 1);
      });
      
      // Manually trigger save after moving to trash
      setTimeout(() => saveData(), 100);
    }
  };

  // Restore from trash functionality
  const handleRestoreFromTrash = (id) => {
    const trashItem = trashItems.get(id);
    
    if (trashItem) {
      // Remove from trash
      setTrashItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      
      // Add back to My Drive root
      setDocs(prev => {
        const newDocs = { ...prev };
        if (!newDocs['My Drive']) newDocs['My Drive'] = [];
        newDocs['My Drive'].push(trashItem);
        return newDocs;
      });
      
      // Switch back to My Drive to show the restored item
      setSelected('My Drive');
      setCurrentPath([]);
      
      // Manually trigger save after restoring
      setTimeout(() => saveData(), 100);
    }
  };

  // Permanently delete from trash
  const handlePermanentDelete = (id) => {
    setTrashItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    setStarredItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    // Manually trigger save after permanent delete
    setTimeout(() => saveData(), 100);
  };

  // Add to recent items
  const addToRecent = (item) => {
    setRecentItems(prev => {
      const filtered = prev.filter(recent => recent.id !== item.id);
      return [{ ...item, lastAccessed: new Date().toISOString() }, ...filtered].slice(0, 20);
    });
  };

  // Remove from recent items
  const removeFromRecent = (id) => {
    setRecentItems(prev => prev.filter(item => item.id !== id));
    setTimeout(() => saveData(), 100);
  };

  // Remove from starred items
  const removeFromStarred = (id) => {
    setStarredItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setTimeout(() => saveData(), 100);
  };



  // Get all documents recursively from all folders
  const getAllDocsRecursively = (docsArray = null) => {
    const currentDocs = docsArray || docs['My Drive'] || [];
    let allDocs = [];
    
    currentDocs.forEach(doc => {
      allDocs.push(doc);
      if (doc.type === 'folder' && doc.children) {
        allDocs = allDocs.concat(getAllDocsRecursively(doc.children));
      }
    });
    
    return allDocs;
  };

  // Get filtered documents based on selected category
  const getFilteredDocs = () => {
    const allDocs = getCurrentDocs();
    
    switch (selected) {
      case 'Recent':
        return recentItems.map(item => ({
          ...item,
          isRecent: true
        }));
      case 'Starred':
        // Get all documents from all folders to find starred items
        const allDocsRecursively = getAllDocsRecursively();
        return allDocsRecursively.filter(doc => starredItems.has(doc.id));
      case 'Trash':
        return Array.from(trashItems.values()).map(item => ({
          ...item,
          isTrash: true
        }));
      default:
        return allDocs.filter(doc => !trashItems.has(doc.id));
    }
  };

  const breadcrumbs = [selected, ...currentPath];
  const currentDocs = getFilteredDocs();

  // Remove duplicates based on ID to prevent React key conflicts
  const uniqueDocs = currentDocs.filter((doc, index, self) => 
    index === self.findIndex(d => d.id === doc.id)
  );

  const sortedAndFilteredDocs = uniqueDocs
    .filter(doc => {
      // Safety check for search filter
      if (!doc.name || typeof doc.name !== 'string') return false;
      return doc.name.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-logo">
          <Image src="/DOC NEST LOGO.png" alt="DocNest Logo" width={130} height={52} style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
        
        <div className="dashboard-welcome">
          <div className="dashboard-welcome-text">
            Welcome, {username || 'User'}! {dataLoading && <span className="dashboard-loading">(Loading your files...)</span>}
            {dataLoadMessage && (
              <div className="dashboard-message">
                {dataLoadMessage}
              </div>
            )}
          </div>
        </div>
        
        <div className="dashboard-actions">
          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => {
              console.log('Mobile menu clicked, current state:', mobileMenuOpen);
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            ☰ Menu
          </button>
          
          {(selected === 'My Drive' || selected === 'Shared with me') && (
            <button
              className="dashboard-new-btn"
              onClick={() => setShowNewMenu(!showNewMenu)}
            >
              <span>+</span>
              New
            </button>
          )}
          
          <button
            className="dashboard-logout-btn"
            onClick={async () => {
              await signOut({ callbackUrl: '/' });
            }}
          >
            Logout
          </button>
          
          {showNewMenu && (
            <div className="dashboard-new-menu">
              <button
                className="dashboard-new-menu-item"
                onClick={() => {
                  setShowNewMenu(false);
                  document.getElementById('folder-input')?.focus();
                }}
              >
                📁 New folder
              </button>
              <button
                className="dashboard-new-menu-item"
                onClick={() => {
                  setShowNewMenu(false);
                  document.getElementById('file-input')?.click();
                }}
              >
                📄 File upload
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-app-row">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="dashboard-mobile-overlay"
            onClick={() => {
              console.log('Mobile overlay clicked, closing menu');
              setMobileMenuOpen(false);
            }}
          />
        )}
        
        {/* Sidebar */}
        <div className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Search Bar in Sidebar */}
          <div className="dashboard-sidebar-search">
            <input
              className="dashboard-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search in Drive"
            />
          </div>
          
          <nav className="dashboard-nav">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`dashboard-nav-item ${selected === cat ? 'active' : ''}`}
                onClick={() => { 
                  setSelected(cat); 
                  setCurrentPath([]); 
                  setMobileMenuOpen(false); // Close mobile menu when item is selected
                }}
              >
                {cat === 'My Drive' && '📁'}
                {cat === 'Shared with me' && '👥'}
                {cat === 'Recent' && '🕒'}
                {cat === 'Starred' && '⭐'}
                {cat === 'Trash' && '🗑️'}
                {cat}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          
          {/* Breadcrumbs */}
          <div className="dashboard-breadcrumbs">
            <button 
              className="dashboard-breadcrumb-item"
              onClick={() => setCurrentPath([])}
            >
              {selected}
            </button>
            {currentPath.map((crumb, idx) => (
              <span key={idx}>
                <span className="dashboard-breadcrumb-separator">/</span>
                <button
                  className="dashboard-breadcrumb-item"
                  onClick={() => setCurrentPath(currentPath.slice(0, idx + 1))}
                >
                  {crumb}
                </button>
              </span>
            ))}
          </div>

          {/* Toolbar */}
          <div className="dashboard-toolbar">
            <div className="dashboard-toolbar-left">
              {sortedAndFilteredDocs.length > 0 && (
                <input
                  type="checkbox"
                  className="dashboard-item-checkbox"
                  checked={selectedItems.length === sortedAndFilteredDocs.length && sortedAndFilteredDocs.length > 0}
                  onChange={handleSelectAll}
                />
              )}
              <span className={`dashboard-item-count ${selectedItems.length > 0 ? 'selected' : ''}`}>
                {selectedItems.length > 0 
                  ? `${selectedItems.length} selected` 
                  : sortedAndFilteredDocs.length > 0 
                    ? `${sortedAndFilteredDocs.length} ${sortedAndFilteredDocs.length === 1 ? 'item' : 'items'}` 
                    : 'No items'
                }
              </span>
              
              {selectedItems.length > 0 && (
                <button
                  className="dashboard-delete-btn"
                  onClick={handleBulkDelete}
                >
                  Delete
                </button>
              )}
            </div>

            <div className="dashboard-toolbar-right">
              <button
                className="dashboard-view-toggle"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? '⊞' : '☰'}
              </button>
            </div>
          </div>

          {/* New Folder Input */}
          {(selected === 'My Drive' || selected === 'Shared with me') && (
            <form
              className="dashboard-form"
              onSubmit={e => { e.preventDefault(); handleNewFolder(); }}
            >
              <input
                id="folder-input"
                className="dashboard-input"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="New folder name"
              />
              <button
                type="submit"
                className="dashboard-btn"
              >
                Create Folder
              </button>
            </form>
          )}

          {/* Upload Form */}
          {(selected === 'My Drive' || selected === 'Shared with me') && (
            <form className="dashboard-form" onSubmit={handleUpload}>
              <input
                id="file-input"
                type="file"
                onChange={e => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                <button
                  type="button"
                  className="dashboard-btn secondary"
                  onClick={() => document.getElementById('file-input').click()}
                >
                  Choose File
                </button>
                {file && (
                  <span style={{ 
                    fontSize: '0.9rem', 
                    color: '#111', 
                    fontWeight: 500,
                    wordBreak: 'break-word',
                    flex: '1',
                    minWidth: '150px'
                  }}>
                    {file.name}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="dashboard-btn primary"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                {error && (
                  <span style={{ 
                    color: '#dc3545', 
                    fontSize: '0.9rem', 
                    fontWeight: 500,
                    padding: '8px 12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    flex: '1',
                    minWidth: '200px'
                  }}>
                    {error}
                  </span>
                )}
              </div>
            </form>
          )}

          {error && (
            <div style={{ 
              color: '#dc3545', 
              marginBottom: '24px',
              padding: '16px 20px',
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          {/* File/Folder List */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            overflow: 'auto'
          }}>
            {viewMode === 'list' ? (
              <div style={{ padding: '0' }}>
                {sortedAndFilteredDocs.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    padding: '60px 20px',
                    fontSize: '1rem',
                    fontWeight: 500
                  }}>
                    {search ? 'No files found matching your search.' : 'No files here yet. Upload some files to get started!'}
                  </div>
                ) : (
                  <div>
                    {sortedAndFilteredDocs.map((doc, index) => (
                      <div
                        key={`${selected}-${doc.id}-${index}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px 20px',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                          background: selectedItems.includes(doc.id) ? '#e8f0fe' : 'transparent',
                          borderLeft: selectedItems.includes(doc.id) ? '4px solid #1a73e8' : '4px solid transparent',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleSelectItem(doc.id)}
                        onMouseEnter={(e) => {
                          if (!selectedItems.includes(doc.id)) {
                            e.target.style.background = '#f8f9fa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedItems.includes(doc.id)) {
                            e.target.style.background = 'transparent';
                          }
                        }}
                        onContextMenu={e => {
                          e.preventDefault();
                          setContextSelectedId(doc.id);
                        }}
                      >
                        {(selectedItems.includes(doc.id) || contextSelectedId === doc.id) && (
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(doc.id)}
                            onChange={() => handleSelectItem(doc.id)}
                            onClick={e => e.stopPropagation()}
                            style={{ marginRight: '16px', transform: 'scale(1.2)' }}
                          />
                        )}
                        
                        <span style={{ fontSize: '1.3rem', marginRight: '16px' }}>
                          {doc.type === 'folder' ? '📁' : getFileIcon(doc.fileType)}
                        </span>
                        
                        <div style={{ flex: 1 }}>
                          {editId === doc.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleEditSave(doc.id)}
                                style={{
                                  fontSize: '1rem',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #e0e0e0',
                                  background: '#fff',
                                  color: '#111',
                                  fontWeight: 500,
                                  minWidth: '200px'
                                }}
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSave(doc.id);
                                }}
                                style={{
                                  background: '#111',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditId(null);
                                  setEditName("");
                                }}
                                style={{
                                  background: '#f8f9fa',
                                  color: '#111',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : doc.type === 'folder' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnterFolder(doc.name);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#1a73e8',
                                cursor: 'pointer',
                                fontWeight: 600,
                                textAlign: 'left',
                                fontSize: '1rem'
                              }}
                            >
                              {doc.name}
                            </button>
                          ) : (
                            <span style={{ fontWeight: 600, fontSize: '1rem', color: '#111' }}>{doc.name}</span>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', color: '#666', marginRight: '20px', fontWeight: 500 }}>
                          {doc.type === 'file' && doc.size && formatFileSize(doc.size)}
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', color: '#666', marginRight: '20px', fontWeight: 500 }}>
                          {doc.uploadDate && new Date(doc.uploadDate).toLocaleDateString()}
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          flexWrap: 'wrap',
                          justifyContent: 'flex-end',
                          alignItems: 'center'
                        }}>
                          {/* Star Button */}
                          {selected !== 'Trash' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(doc.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                color: starredItems.has(doc.id) ? '#ffd700' : '#ccc',
                                padding: '8px',
                                borderRadius: '6px',
                                minWidth: '36px',
                                minHeight: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title={starredItems.has(doc.id) ? 'Unstar' : 'Star'}
                            >
                              {starredItems.has(doc.id) ? '⭐' : '☆'}
                            </button>
                          )}

                          {/* View Button */}
                          {doc.type === 'file' && selected !== 'Trash' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(doc.url, doc);
                              }}
                              style={{
                                background: '#f8f9fa',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                color: '#111',
                                minHeight: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              View
                            </button>
                          )}

                          {/* Rename Button */}
                          {editId !== doc.id && selected !== 'Trash' && selected !== 'Recent' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (doc.type === 'folder') {
                                  handleRenameFolder(doc.id, doc.name);
                                } else {
                                  handleEdit(doc.id, doc.name);
                                }
                              }}
                              style={{
                                background: '#f8f9fa',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                color: '#111',
                                minHeight: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              Rename
                            </button>
                          )}

                          {/* Action Buttons based on category */}
                          {selected === 'Trash' ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreFromTrash(doc.id);
                                }}
                                style={{
                                  background: '#28a745',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  minHeight: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                Restore
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePermanentDelete(doc.id);
                                }}
                                style={{
                                  background: '#dc3545',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  minHeight: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                Delete Forever
                              </button>
                            </>
                          ) : selected === 'Recent' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromRecent(doc.id);
                              }}
                              style={{
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                minHeight: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              Remove from Recent
                            </button>
                          ) : selected === 'Starred' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromStarred(doc.id);
                              }}
                              style={{
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                minHeight: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              Remove from Starred
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToTrash(doc.id);
                              }}
                              style={{
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                minHeight: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px'
              }}>
                {sortedAndFilteredDocs.map((doc, index) => (
                  <div
                    key={`${selected}-${doc.id}-${index}`}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: selectedItems.includes(doc.id) ? '#e8f0fe' : '#fff',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    onClick={() => handleSelectItem(doc.id)}
                    onMouseEnter={(e) => {
                      if (!selectedItems.includes(doc.id)) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedItems.includes(doc.id)) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      }
                    }}
                    onContextMenu={e => {
                      e.preventDefault();
                      setContextSelectedId(doc.id);
                    }}
                  >
                    {(selectedItems.includes(doc.id) || contextSelectedId === doc.id) && (
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(doc.id)}
                        onChange={() => handleSelectItem(doc.id)}
                        onClick={e => e.stopPropagation()}
                        style={{ 
                          float: 'left', 
                          transform: 'scale(1.2)',
                          cursor: 'pointer'
                        }}
                      />
                    )}
                    
                    <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
                      {doc.type === 'folder' ? '📁' : getFileIcon(doc.fileType)}
                    </div>
                    
                    {editId === doc.id ? (
                      <div style={{ marginBottom: '12px' }}>
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && handleEditSave(doc.id)}
                          style={{
                            fontSize: '0.9rem',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                            background: '#fff',
                            color: '#111',
                            fontWeight: 500,
                            width: '100%',
                            textAlign: 'center'
                          }}
                          autoFocus
                        />
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSave(doc.id);
                            }}
                            style={{
                              background: '#111',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditId(null);
                              setEditName("");
                            }}
                            style={{
                              background: '#f8f9fa',
                              color: '#111',
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        fontWeight: 600, 
                        marginBottom: '8px',
                        fontSize: '0.95rem',
                        wordBreak: 'break-word',
                        color: '#111'
                      }}>
                        {doc.name}
                      </div>
                    )}
                    
                    {doc.type === 'file' && doc.size && (
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px', fontWeight: 500 }}>
                        {formatFileSize(doc.size)}
                      </div>
                    )}
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px', 
                      justifyContent: 'center', 
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}>
                      {/* Star Button */}
                      {selected !== 'Trash' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(doc.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            color: starredItems.has(doc.id) ? '#ffd700' : '#ccc',
                            padding: '6px',
                            borderRadius: '4px',
                            minWidth: '32px',
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={starredItems.has(doc.id) ? 'Unstar' : 'Star'}
                        >
                          {starredItems.has(doc.id) ? '⭐' : '☆'}
                        </button>
                      )}

                      {/* View Button */}
                      {doc.type === 'file' && selected !== 'Trash' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(doc.url, doc);
                          }}
                          style={{
                            background: '#f8f9fa',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            color: '#111',
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          View
                        </button>
                      )}

                      {/* Rename Button */}
                      {editId !== doc.id && selected !== 'Trash' && selected !== 'Recent' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (doc.type === 'folder') {
                              handleRenameFolder(doc.id, doc.name);
                            } else {
                              handleEdit(doc.id, doc.name);
                            }
                          }}
                          style={{
                            background: '#f8f9fa',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            color: '#111',
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          Rename
                        </button>
                      )}

                      {/* Action Buttons based on category */}
                      {selected === 'Trash' ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreFromTrash(doc.id);
                            }}
                            style={{
                              background: '#28a745',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                              minHeight: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            Restore
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePermanentDelete(doc.id);
                            }}
                            style={{
                              background: '#dc3545',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                              minHeight: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            Delete Forever
                          </button>
                        </>
                      ) : selected === 'Recent' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromRecent(doc.id);
                          }}
                          style={{
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          Remove from Recent
                        </button>
                      ) : selected === 'Starred' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromStarred(doc.id);
                          }}
                          style={{
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          Remove from Starred
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToTrash(doc.id);
                          }}
                          style={{
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 