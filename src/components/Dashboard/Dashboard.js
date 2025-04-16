import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import FileUpload from '../FileUpload/FileUpload';
import FileList from '../FileList/FileList';
import './Dashboard.css';

const Dashboard = () => {
  const { isConnected, userAddress, retrieveFiles } = useAppContext();
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <line x1="22" y1="10" x2="2" y2="10"></line>
            <path d="M16 2v4"></path>
            <path d="M8 2v4"></path>
            <circle cx="12" cy="16" r="3"></circle>
          </svg>
          Decentralized Storage Vault
        </h1>
        <div className="user-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sidebar">
          <div className="menu-item" onClick={() => setActiveTab('myFiles')}>
            <span className={activeTab === 'myFiles' ? 'active' : ''}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              My Files
            </span>
          </div>
          <div className="menu-item" onClick={() => setActiveTab('shared')}>
            <span className={activeTab === 'shared' ? 'active' : ''}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Shared With Me
            </span>
          </div>
          <div className="menu-item" onClick={() => setActiveTab('upload')}>
            <span className={activeTab === 'upload' ? 'active' : ''}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload File
            </span>
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
                  <h2>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    My Files
                  </h2>
                  <FileList 
                    files={files} 
                    type="own" 
                    onUpdate={fetchFiles}
                  />
                </div>
              )}
              
              {activeTab === 'shared' && (
                <div className="files-container">
                  <h2>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Shared With Me
                  </h2>
                  <FileList 
                    files={sharedFiles} 
                    type="shared" 
                    onUpdate={fetchFiles}
                  />
                </div>
              )}
              
              {activeTab === 'upload' && (
                <div className="upload-container">
                  <h2>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload New File
                  </h2>
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