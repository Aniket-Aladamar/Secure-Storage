import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './FileUpload.css';

const FileUpload = ({ onUploadComplete }) => {
  const { uploadFile, encryptionKey, generateEncryptionKey, setCustomEncryptionKey } = useAppContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeTab, setActiveTab] = useState('generate');
  const [customKey, setCustomKey] = useState('');
  const [currentKey, setCurrentKey] = useState(encryptionKey || '');

  // Update the current key when the app context key changes
  useEffect(() => {
    setCurrentKey(encryptionKey || '');
  }, [encryptionKey]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setStatusMessage(`Selected: ${file.name} (${formatFileSize(file.size)})`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const handleGenerateKey = () => {
    generateEncryptionKey();
    setStatusMessage('New encryption key generated!');
  };

  const handleSetCustomKey = () => {
    if (!customKey.trim()) {
      setStatusMessage('Please enter a custom key first');
      return;
    }
    
    try {
      // Now using the original key directly without transformation
      setCustomEncryptionKey(customKey);
      setStatusMessage('Custom encryption key set successfully');
      setCurrentKey(customKey);
    } catch (error) {
      setStatusMessage(`Error setting key: ${error.message}`);
    }
  };

  const handleCopyKey = () => {
    if (!currentKey) {
      setStatusMessage('No key to copy');
      return;
    }
    
    navigator.clipboard.writeText(currentKey)
      .then(() => {
        setStatusMessage('Encryption key copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy key: ', err);
        setStatusMessage('Failed to copy key to clipboard');
      });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage('Please select a file first');
      return;
    }

    if (!currentKey) {
      setStatusMessage('Please generate or enter an encryption key first');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 95 ? 95 : newProgress;
      });
    }, 500);

    try {
      setStatusMessage('Encrypting and uploading file...');
      await uploadFile(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setStatusMessage('File uploaded and stored successfully!');
      
      // Reset the form
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
      
      // Notify parent component
      if (onUploadComplete) {
        setTimeout(() => {
          onUploadComplete();
        }, 1000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatusMessage(`Error: ${error.message}`);
      clearInterval(progressInterval);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileTypeIcon = (fileType) => {
    if (!fileType) return "document";
    
    if (fileType.startsWith('image/')) return "image";
    if (fileType.startsWith('video/')) return "video";
    if (fileType.startsWith('audio/')) return "audio";
    if (fileType.startsWith('text/')) return "text";
    if (fileType.includes('pdf')) return "pdf";
    
    return "document";
  };

  const renderFileTypeIcon = (type) => {
    switch(type) {
      case "image":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        );
      case "video":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
        );
      case "audio":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        );
      case "pdf":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15h6"></path>
            <path d="M9 11h6"></path>
          </svg>
        );
      case "text":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        );
    }
  };

  return (
    <div className="file-upload-container">
      <div className="upload-instruction">
        <p>Securely upload your files to IPFS with end-to-end encryption and blockchain tracking.</p>
      </div>
      
      <div className="encryption-section">
        <div className="encryption-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c8aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h3>Encryption Key</h3>
        </div>
        
        <div className="encryption-tabs">
          <div 
            className={`encryption-tab ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate Key
          </div>
          <div 
            className={`encryption-tab ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            Use Custom Key
          </div>
        </div>
        
        <div className="encryption-content">
          <div className="key-display">
            {currentKey || 'No encryption key set'}
          </div>
          
          {activeTab === 'generate' ? (
            <div className="key-actions">
              <button onClick={handleGenerateKey} className="key-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                Generate New Key
              </button>
              <button onClick={handleCopyKey} className="key-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Key
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Enter your custom encryption key"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="custom-key-input"
              />
              <button onClick={handleSetCustomKey} className="key-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Set Custom Key
              </button>
            </div>
          )}
          
          <p className="key-info">
            Save this key to decrypt your files later. Without it, your files cannot be recovered.
          </p>
        </div>
        
        <div className="encryption-note">
          <p>
            <strong>Security Note:</strong> Your files are encrypted on your device before upload. 
            No one, not even we, can access your files without the encryption key.
          </p>
        </div>
      </div>
      
      <div className="file-input-container">
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          className="file-input"
          disabled={isLoading}
        />
        <label htmlFor="file-input" className="file-input-label">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c8aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          {selectedFile ? selectedFile.name : 'Choose a file to upload'}
          <span>Click to browse or drop file here</span>
        </label>
      </div>
      
      {selectedFile && (
        <div className="file-details">
          <p>
            {renderFileTypeIcon(getFileTypeIcon(selectedFile.type))}
            Name: {selectedFile.name}
          </p>
          <p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Type: {selectedFile.type || 'Unknown'}
          </p>
          <p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Size: {formatFileSize(selectedFile.size)}
          </p>
        </div>
      )}
      
      <button 
        onClick={handleUpload} 
        disabled={isLoading || !selectedFile || !currentKey}
        className="upload-button"
      >
        {isLoading ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Encrypt & Upload to IPFS
          </>
        )}
      </button>
      
      {isLoading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">{Math.round(uploadProgress)}%</div>
        </div>
      )}
      
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default FileUpload;