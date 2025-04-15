import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import './FileUpload.css';

const FileUpload = ({ onUploadComplete }) => {
  const { uploadFile, encryptionKey } = useAppContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setStatusMessage(`Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage('Please select a file first');
      return;
    }

    if (!encryptionKey) {
      setStatusMessage('Please generate an encryption key first');
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

  return (
    <div className="file-upload-container">
      <div className="upload-instruction">
        <p>Select a file to encrypt and upload to IPFS with smart contract tracking.</p>
      </div>
      
      <div className="encryption-note">
        <p>
          <strong>Important:</strong> Your file will be encrypted with the encryption key 
          displayed in the sidebar. Make sure to save this key to decrypt your file later.
        </p>
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
          {selectedFile ? selectedFile.name : 'Choose File'}
        </label>
      </div>
      
      {selectedFile && (
        <div className="file-details">
          <p>Name: {selectedFile.name}</p>
          <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          <p>Type: {selectedFile.type}</p>
        </div>
      )}
      
      <button 
        onClick={handleUpload} 
        disabled={isLoading || !selectedFile || !encryptionKey}
        className="upload-button"
      >
        {isLoading ? 'Uploading...' : 'Encrypt & Upload'}
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