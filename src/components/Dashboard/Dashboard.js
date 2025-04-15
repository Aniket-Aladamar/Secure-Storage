import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import FileUpload from '../FileUpload/FileUpload';
import FileList from '../FileList/FileList';
import './Dashboard.css';

const Dashboard = () => {
  const { isConnected, userAddress, retrieveFiles, generateEncryptionKey, encryptionKey } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myFiles');
  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
      return;
    }
    
    fetchFiles();
  }, [isConnected, navigate]);

  const fetchFiles = async () => {
    setIsLoading(true);
    setStatusMessage('Fetching your files...');
    
    try {
      const result = await retrieveFiles();
      
      if (result) {
        // Handle the file data in the updated format
        setFiles(result.userFiles || []);
        setSharedFiles(result.sharedFiles || []);
      }
      
      setStatusMessage('');
    } catch (error) {
      console.error('Error fetching files:', error);
      setStatusMessage('Failed to fetch files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUpload = () => {
    // After a new upload, refresh the file list
    fetchFiles();
  };

  const handleGenerateKey = () => {
    generateEncryptionKey();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Secure IPFS Storage</h1>
        <div className="user-info">
          <p>Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sidebar">
          <div className="menu-item" onClick={() => setActiveTab('myFiles')}>
            <span className={activeTab === 'myFiles' ? 'active' : ''}>My Files</span>
          </div>
          <div className="menu-item" onClick={() => setActiveTab('shared')}>
            <span className={activeTab === 'shared' ? 'active' : ''}>Shared With Me</span>
          </div>
          <div className="menu-item" onClick={() => setActiveTab('upload')}>
            <span className={activeTab === 'upload' ? 'active' : ''}>Upload File</span>
          </div>
          <div className="encryption-key-container">
            <h3>Encryption Key</h3>
            <div className="key-display">
              {encryptionKey || 'No key generated'}
            </div>
            <button onClick={handleGenerateKey}>Generate Key</button>
            <p className="key-info">Save this key to decrypt your files later</p>
          </div>
        </div>
        
        <div className="main-content">
          {isLoading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>{statusMessage}</p>
            </div>
          ) : (
            <>
              {activeTab === 'myFiles' && (
                <div className="files-container">
                  <h2>My Files</h2>
                  <FileList 
                    files={files} 
                    type="own" 
                    onUpdate={fetchFiles}
                  />
                </div>
              )}
              
              {activeTab === 'shared' && (
                <div className="files-container">
                  <h2>Shared With Me</h2>
                  <FileList 
                    files={sharedFiles} 
                    type="shared" 
                    onUpdate={fetchFiles}
                  />
                </div>
              )}
              
              {activeTab === 'upload' && (
                <div className="upload-container">
                  <h2>Upload New File</h2>
                  <FileUpload onUploadComplete={handleNewUpload} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;