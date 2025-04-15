import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import './FileList.css';

const FileList = ({ files = [], type = 'own', onUpdate }) => {
  const { fetchFileFromIPFS, shareFile, revokeAccess, deleteFile } = useAppContext();
  const [viewingFile, setViewingFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareAddress, setShareAddress] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeCid, setActiveCid] = useState('');
  const [decryptKey, setDecryptKey] = useState('');
  const [needsDecryptKey, setNeedsDecryptKey] = useState(false);

  const handleView = async (cid) => {
    setIsLoading(true);
    setStatusMessage('Fetching file content...');
    
    try {
      // First try with any saved key or no key
      const content = await fetchFileFromIPFS(cid, decryptKey || null);
      setViewingFile(cid);
      setFileContent(content);
      setNeedsDecryptKey(false);
    } catch (error) {
      console.error('Error retrieving file:', error);
      if (error.message.includes('Decryption key') || error.message.includes('Decryption failed')) {
        // Show the decrypt prompt if key is needed
        setViewingFile(cid);
        setFileContent(null); 
        setNeedsDecryptKey(true);
        setStatusMessage('Please enter decryption key');
      } else {
        setStatusMessage(`Error retrieving file: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecryptWithKey = async () => {
    if (!decryptKey || !viewingFile) return;
    
    setIsLoading(true);
    setStatusMessage('Decrypting file content...');
    
    try {
      const content = await fetchFileFromIPFS(viewingFile, decryptKey);
      setFileContent(content);
      setNeedsDecryptKey(false);
      setStatusMessage('');
    } catch (error) {
      console.error('Error decrypting file:', error);
      setStatusMessage(`Decryption failed. Please check your key.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (cid) => {
    setActiveCid(cid);
    setShareAddress('');
    setShowShareModal(true);
  };

  const submitShare = async () => {
    if (!shareAddress.trim()) {
      setStatusMessage('Please enter a valid address');
      return;
    }
    
    setIsLoading(true);
    setStatusMessage(`Sharing file with ${shareAddress}...`);
    
    try {
      await shareFile(activeCid, shareAddress);
      setShowShareModal(false);
      setStatusMessage('File shared successfully');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      setStatusMessage(`Error sharing file: ${error.message}`);
      console.error('Error sharing file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowShareModal(false);
  };

  const handleRevoke = async (cid, address) => {
    setIsLoading(true);
    setStatusMessage(`Revoking access for ${address}...`);
    
    try {
      await revokeAccess(cid, address);
      setStatusMessage('Access revoked successfully');
      setTimeout(() => setStatusMessage(''), 3000);
      // Refresh the file list
      if (onUpdate) onUpdate();
    } catch (error) {
      setStatusMessage(`Error revoking access: ${error.message}`);
      console.error('Error revoking access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (cid) => {
    if (window.confirm('Are you sure you want to delete this file? This cannot be undone.')) {
      setIsLoading(true);
      setStatusMessage('Deleting file...');
      
      try {
        await deleteFile(cid);
        setStatusMessage('File deleted successfully');
        setTimeout(() => setStatusMessage(''), 3000);
        // Refresh the file list
        if (onUpdate) onUpdate();
      } catch (error) {
        setStatusMessage(`Error deleting file: ${error.message}`);
        console.error('Error deleting file:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCloseViewer = () => {
    setViewingFile(null);
    setFileContent(null);
    setDecryptKey('');
    setNeedsDecryptKey(false);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (files.length === 0) {
    return <div className="no-files">No files found</div>;
  }

  return (
    <div className="file-list-container">
      {statusMessage && <div className="status-message">{statusMessage}</div>}
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loader"></div>
        </div>
      )}
      
      <table className="file-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Upload Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr key={index}>
              <td>{file.name || 'Unnamed File'}</td>
              <td>{formatTimestamp(file.timestamp)}</td>
              <td className="actions-cell">
                <button 
                  onClick={() => handleView(file.cid)}
                  className="action-btn view-btn"
                >
                  View
                </button>
                
                {type === 'own' && (
                  <>
                    <button 
                      onClick={() => handleShare(file.cid)}
                      className="action-btn share-btn"
                    >
                      Share
                    </button>
                    <button 
                      onClick={() => handleDelete(file.cid)}
                      className="action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="modal-overlay">
          <div className="file-viewer-modal">
            <div className="modal-header">
              <h3>File Viewer</h3>
              <button onClick={handleCloseViewer} className="close-btn">&times;</button>
            </div>
            <div className="modal-content">
              {needsDecryptKey ? (
                <div className="decrypt-prompt">
                  <p>Enter decryption key to view this file:</p>
                  <input 
                    type="text"
                    value={decryptKey}
                    onChange={(e) => setDecryptKey(e.target.value)}
                    placeholder="Paste your decryption key"
                  />
                  <button 
                    onClick={handleDecryptWithKey} 
                    className="decrypt-btn"
                  >
                    Decrypt & View
                  </button>
                </div>
              ) : fileContent ? (
                <div className="file-content">
                  {typeof fileContent === 'string' && fileContent.startsWith('data:image') ? (
                    <img src={fileContent} alt="File content" className="content-image" />
                  ) : typeof fileContent === 'string' && fileContent.startsWith('data:video') ? (
                    <video controls>
                      <source src={fileContent} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : typeof fileContent === 'string' && fileContent.startsWith('data:audio') ? (
                    <audio controls>
                      <source src={fileContent} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <div className="text-content">
                      <pre>{fileContent}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="loading-content">
                  <p>Loading file content...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="share-modal">
            <div className="modal-header">
              <h3>Share File</h3>
              <button onClick={handleCloseModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-content">
              <p>Enter the Ethereum address to share this file with:</p>
              <input 
                type="text"
                value={shareAddress}
                onChange={(e) => setShareAddress(e.target.value)}
                placeholder="0x..."
              />
              <button onClick={submitShare} className="share-submit-btn">Share</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;