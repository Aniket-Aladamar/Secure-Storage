import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { connectWallet, isConnected, userAddress } = useAppContext();
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Function to handle connecting wallet
  const handleConnectWallet = async () => {
    const success = await connectWallet();
    if (success) {
      navigate('/dashboard');
    }
  };

  // Track mouse movement for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const { clientX, clientY } = e;
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // Calculate mouse position relative to center
        const x = (clientX - width / 2) / 25;
        const y = (clientY - height / 2) / 25;
        
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Create animated dots in the background
    const createDots = () => {
      const dotsContainer = document.querySelector('.shiny-dots');
      if (dotsContainer) {
        for (let i = 0; i < 50; i++) {
          const dot = document.createElement('div');
          dot.classList.add('dot');
          
          // Random positions
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          
          dot.style.left = `${posX}%`;
          dot.style.top = `${posY}%`;
          
          // Random delays for animation
          dot.style.animationDelay = `${Math.random() * 5}s`;
          dot.style.opacity = Math.random() * 0.5 + 0.2;
          
          dotsContainer.appendChild(dot);
        }
      }
    };
    
    createDots();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Update 3D elements based on mouse position
  useEffect(() => {
    const updateCubeTransforms = () => {
      const cubes = document.querySelectorAll('.floating-cube');
      const cards = document.querySelectorAll('.feature-card');
      const { x, y } = mousePosition;
      
      cubes.forEach((cube, index) => {
        const rotateY = x * (index % 2 === 0 ? 1 : -1) * 0.8;
        const rotateX = y * (index % 2 === 0 ? -1 : 1) * 0.8;
        
        cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${Math.sin((Date.now() + index * 1000) / 2000) * 20}px)`;
      });

      // Apply subtle parallax effect to feature cards
      cards.forEach((card, index) => {
        const factor = 1 - (index * 0.1);
        card.style.transform = `translateX(${x * factor}px) translateY(${y * factor}px) scale(1)`;
      });
    };

    const animationFrame = requestAnimationFrame(updateCubeTransforms);
    return () => cancelAnimationFrame(animationFrame);
  }, [mousePosition]);

  return (
    <div className="home-container" ref={containerRef}>
      <div className="home-background">
        <div className="grid-lines"></div>
        <div className="shiny-dots"></div>
        
        <div className="portal-ring ring-1" style={{ 
          transform: `translate(${mousePosition.x * -2}px, ${mousePosition.y * -2}px) rotate(${Date.now() / 100 % 360}deg)` 
        }}></div>
        <div className="portal-ring ring-2" style={{ 
          transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px) rotate(-${Date.now() / 80 % 360}deg)` 
        }}></div>
        
        {/* 3D Floating Cubes */}
        <div className="floating-cube cube-1">
          <div className="cube-face cube-front"></div>
          <div className="cube-face cube-back"></div>
          <div className="cube-face cube-right"></div>
          <div className="cube-face cube-left"></div>
          <div className="cube-face cube-top"></div>
          <div className="cube-face cube-bottom"></div>
        </div>
        <div className="floating-cube cube-2">
          <div className="cube-face cube-front"></div>
          <div className="cube-face cube-back"></div>
          <div className="cube-face cube-right"></div>
          <div className="cube-face cube-left"></div>
          <div className="cube-face cube-top"></div>
          <div className="cube-face cube-bottom"></div>
        </div>
        <div className="floating-cube cube-3">
          <div className="cube-face cube-front"></div>
          <div className="cube-face cube-back"></div>
          <div className="cube-face cube-right"></div>
          <div className="cube-face cube-left"></div>
          <div className="cube-face cube-top"></div>
          <div className="cube-face cube-bottom"></div>
        </div>
        <div className="floating-cube cube-4">
          <div className="cube-face cube-front"></div>
          <div className="cube-face cube-back"></div>
          <div className="cube-face cube-right"></div>
          <div className="cube-face cube-left"></div>
          <div className="cube-face cube-top"></div>
          <div className="cube-face cube-bottom"></div>
        </div>
      </div>

      <div className="home-content">
        <div className="home-logo">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#7c8aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="2" x2="9" y2="4"></line>
            <line x1="15" y1="2" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="22"></line>
            <line x1="15" y1="20" x2="15" y2="22"></line>
            <line x1="20" y1="9" x2="22" y2="9"></line>
            <line x1="20" y1="14" x2="22" y2="14"></line>
            <line x1="2" y1="9" x2="4" y2="9"></line>
            <line x1="2" y1="14" x2="4" y2="14"></line>
          </svg>
        </div>
        <h1 className="home-title">Secure IPFS Storage Vault</h1>
        <p className="home-subtitle">
          Store your files securely on IPFS with end-to-end encryption. Your files are encrypted before 
          uploading and only you control who can access them through blockchain technology.
        </p>

        <div 
          className="feature-grid"
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * -0.05}deg)`
          }}
        >
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>End-to-End Encryption</h3>
            <p>Your files are encrypted before they leave your device, ensuring complete privacy and protection.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <h3>Blockchain Security</h3>
            <p>Access control managed through Ethereum smart contracts with immutable record-keeping.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <line x1="12" y1="22" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3>Decentralized Storage</h3>
            <p>Files stored on IPFS for maximum availability and resistance to centralized failures.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </div>
            <h3>Share Securely</h3>
            <p>Grant and revoke access to specific wallet addresses with cryptographic security.</p>
          </div>
        </div>

        <div className="cta-container">
          {!isConnected ? (
            <button className="connect-wallet-btn" onClick={handleConnectWallet}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                <path d="M6 8h.01M6 12h.01M6 16h.01"></path>
                <path d="M15 12h5"></path>
              </svg>
              Connect Wallet to Get Started
            </button>
          ) : (
            <div className="already-connected">
              <div className="wallet-address">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </div>
              <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <path d="M9 21V9"></path>
                </svg>
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