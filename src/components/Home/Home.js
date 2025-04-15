import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { connectWallet, isConnected, userAddress } = useAppContext();

  const handleConnectWallet = async () => {
    const success = await connectWallet();
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Secure IPFS Storage</h1>
        <p className="home-description">
          Store your files securely on IPFS with end-to-end encryption. Your files are encrypted before 
          uploading and only you control who can access them through blockchain technology.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>End-to-End Encryption</h3>
            <p>Your files are encrypted before they leave your device</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⛓️</div>
            <h3>Blockchain Security</h3>
            <p>Access control managed through Ethereum smart contracts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📂</div>
            <h3>Decentralized Storage</h3>
            <p>Files stored on IPFS for maximum availability</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔑</div>
            <h3>Share Securely</h3>
            <p>Grant and revoke access to specific wallet addresses</p>
          </div>
        </div>

        <div className="cta-container">
          {!isConnected ? (
            <button className="connect-wallet-btn" onClick={handleConnectWallet}>
              Connect Wallet to Get Started
            </button>
          ) : (
            <div className="already-connected">
              <p>Wallet connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</p>
              <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;