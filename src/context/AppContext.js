import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import { abi } from '../abi';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Pinata JWT token
  const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1NzBlOTU1My0wOTM0LTRjODEtYTM5ZS0wZDE4MmM2YWQ4ZmMiLCJlbWFpbCI6ImFuaWtldDMzNjY0NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMzViODY0ZDc3NWUwODdjZGI5ZGMiLCJzY29wZWRLZXlTZWNyZXQiOiJjMDYxMmE2YjY0YTU1YWRmNWVmMzViMzMyYjU3MmU1ZDJkNGU3ZmJkMzllM2Q5N2Y5N2FmYWYzYjZkNTA2MDNiIiwiZXhwIjoxNzY0NzQxMjI3fQ.DTptCZRgU4LhayDR054aPTAp1xsHXerf5xfM9SAu2io";

  // Smart contract details
  const contractAddress = "0xA7bd79fa610a7adF93bbcafb3ffE141C2b8f19ed";
  
  // State
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [savedEncryptionKeys, setSavedEncryptionKeys] = useState({});
  
  // Load saved encryption keys from localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('encryptionKeys');
    if (savedKeys) {
      setSavedEncryptionKeys(JSON.parse(savedKeys));
    }

    // Check if wallet is connected from previous session
    checkWalletConnection();
  }, []);

  // Save encryption keys to localStorage when they change
  useEffect(() => {
    if (Object.keys(savedEncryptionKeys).length > 0) {
      localStorage.setItem('encryptionKeys', JSON.stringify(savedEncryptionKeys));
    }
  }, [savedEncryptionKeys]);

  // Check if wallet is already connected
  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await setupEthereumConnection();
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  // Connect to wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to use this application");
      return false;
    }

    try {
      await setupEthereumConnection();
      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return false;
    }
  };

  // Setup Ethereum connection
  const setupEthereumConnection = async () => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      await ethersProvider.send("eth_requestAccounts", []);
      const ethersSigner = ethersProvider.getSigner();
      const ethersContract = new ethers.Contract(contractAddress, abi, ethersSigner);
      
      // Get the user's MetaMask address
      const address = await ethersSigner.getAddress();
      
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(ethersContract);
      setUserAddress(address);
      setIsConnected(true);

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return true;
    } catch (error) {
      console.error("Error setting up Ethereum connection:", error);
      return false;
    }
  };

  // Handle account changes in MetaMask
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethersSigner = ethersProvider.getSigner();
      const address = await ethersSigner.getAddress();
      
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(new ethers.Contract(contractAddress, abi, ethersSigner));
      setUserAddress(address);
      setIsConnected(true);
    } else {
      setUserAddress('');
      setIsConnected(false);
    }
  };

  // Generate a random encryption key
  const generateEncryptionKey = () => {
    const randomKey = CryptoJS.lib.WordArray.random(16).toString();
    setEncryptionKey(randomKey);
    return randomKey;
  };

  // Encrypt a file
  const encryptFile = async (file, key = encryptionKey) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          // Get the file content as array buffer for better handling of binary data
          const fileContent = event.target.result;
          
          // Encrypt the file content using AES
          const encrypted = CryptoJS.AES.encrypt(fileContent, key).toString();
          
          // Create a new Blob with encrypted content
          const encryptedBlob = new Blob([encrypted], { type: 'text/plain' });
          const encryptedFile = new File([encryptedBlob], file.name, { 
            type: 'text/plain',
            lastModified: new Date().getTime()
          });
          
          resolve({
            encryptedFile,
            originalType: file.type,
            originalName: file.name
          });
        } catch (error) {
          console.error('Encryption error:', error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(file);  // Using DataURL to handle all file types
    });
  };

  // Decrypt file content
  const decryptContent = (encryptedContent, key) => {
    try {
      // Decrypt the content using AES
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, key).toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error("Decryption failed. Please check your decryption key.");
      }
      return decrypted;
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Decryption failed. Please check your encryption key.");
    }
  };

  // Encrypt CID with user's wallet address
  const encryptCID = (cid) => {
    if (!userAddress) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }
    // Use the wallet address as the encryption key
    return CryptoJS.AES.encrypt(cid, userAddress).toString();
  };

  // Decrypt CID with user's wallet address
  const decryptCID = (encryptedCid) => {
    try {
      if (!userAddress) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }
      // Use the wallet address as the decryption key
      const decrypted = CryptoJS.AES.decrypt(encryptedCid, userAddress).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error("CID Decryption failed:", error);
      throw new Error("CID Decryption failed. Are you using the correct wallet address?");
    }
  };

  // Upload a file to Pinata and store its CID in the smart contract
  const uploadFile = async (file) => {
    if (!isConnected) {
      throw new Error("Please connect your wallet first.");
    }

    if (!encryptionKey) {
      throw new Error("Please generate an encryption key first.");
    }

    try {
      // Encrypt the file before uploading
      const { encryptedFile, originalType, originalName } = await encryptFile(file, encryptionKey);
      
      // Prepare form data for Pinata API
      const formData = new FormData();
      formData.append("file", encryptedFile);
      
      // Add metadata about the original file for later decryption
      const metadata = JSON.stringify({
        name: originalName,
        keyvalues: {
          originalType: originalType,
          originalName: originalName,
          encrypted: "true"
        }
      });
      formData.append('pinataMetadata', metadata);

      // Add pinata options
      const pinataOptions = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', pinataOptions);

      // Make a request to Pinata API to upload the file
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Pinata API error:", response.status, errorText);
        throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Pinata response:", responseData);

      if (!responseData.IpfsHash) {
        throw new Error(`Error uploading file to Pinata. Response: ${JSON.stringify(responseData)}`);
      }

      const cid = responseData.IpfsHash;

      // Save the encryption key for this CID
      setSavedEncryptionKeys(prevKeys => ({
        ...prevKeys,
        [cid]: {
          key: encryptionKey,
          originalType: originalType,
          originalName: originalName
        }
      }));

      // Encrypt the CID with wallet address before storing in smart contract
      const encryptedCID = encryptCID(cid);
      
      // Store the encrypted CID in the smart contract
      const tx = await contract.store(encryptedCID, originalName);
      
      await tx.wait();

      // Save mapping between encrypted CID and original CID
      localStorage.setItem(`encrypted_${encryptedCID}`, cid);

      return cid;
    } catch (error) {
      console.error("Error encrypting, uploading file, or storing CID:", error);
      throw error;
    }
  };

  // Retrieve files from smart contract
  const retrieveFiles = async () => {
    if (!isConnected) {
      throw new Error("Please connect your wallet first.");
    }
    
    try {
      // Use the retrieve function which now returns arrays
      const result = await contract.functions.retrieve();
      const [cids, timestamps, names, peopleWithAccessArrays] = result;
      
      const ownedFiles = [];
      for (let i = 0; i < cids.length; i++) {
        ownedFiles.push({
          cid: cids[i],
          name: names[i],
          // Keep timestamps as strings to avoid overflow
          timestamp: timestamps[i].toString(),
          peopleWithAccess: peopleWithAccessArrays[i]
        });
      }
      
      // Check for shared files which now returns arrays in a different format
      const sharedResult = await contract.functions.retrieveSharedFiles();
      const [sharedCids, sharedTimestamps, sharedNames, sharedOwners] = sharedResult;
      
      const sharedFilesList = [];
      for (let i = 0; i < sharedCids.length; i++) {
        sharedFilesList.push({
          cid: sharedCids[i],
          name: sharedNames[i],
          // Keep timestamps as strings to avoid overflow
          timestamp: sharedTimestamps[i].toString(),
          owner: sharedOwners[i]
        });
      }
      
      return {
        userFiles: ownedFiles,
        sharedFiles: sharedFilesList
      };
    } catch (error) {
      console.error("Error retrieving files:", error);
      throw error;
    }
  };

  // Fetch a file from IPFS based on CID and decrypt it
  const fetchFileFromIPFS = async (cid, providedKey = null) => {
    try {
      // First, check if the CID is encrypted (starts with U2Fsd or similar pattern used by CryptoJS)
      let actualCid = cid;
      const isEncryptedCid = cid.startsWith('U2Fsd'); // Common prefix for CryptoJS encrypted content
      
      if (isEncryptedCid) {
        try {
          // Try to decrypt the CID with user's wallet address
          actualCid = decryptCID(cid);
          console.log('Decrypted CID:', actualCid);
        } catch (decryptError) {
          console.error('Failed to decrypt CID:', decryptError);
          // Continue with the original CID if decryption fails
        }
      }
      
      // Try both IPFS gateways to improve reliability
      const gateways = [
        `https://ipfs.io/ipfs/${actualCid}`,
        `https://gateway.pinata.cloud/ipfs/${actualCid}`,
        `https://cloudflare-ipfs.com/ipfs/${actualCid}`
      ];
      
      let response;
      let errorMessage = '';
      
      // Try each gateway until one succeeds
      for (const url of gateways) {
        try {
          console.log('Trying gateway:', url);
          response = await fetch(url);
          if (response.ok) {
            console.log('Successfully fetched from:', url);
            break;
          }
        } catch (err) {
          errorMessage += `${url}: ${err.message}. `;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch from IPFS gateways. ${errorMessage}`);
      }

      // Get encrypted content
      const encryptedContent = await response.text();
      if (!encryptedContent) {
        throw new Error("Retrieved empty content from IPFS");
      }
      
      // Get decryption key from provided key, saved keys, or current encryption key
      let decryptKey = providedKey;
      if (!decryptKey && savedEncryptionKeys[actualCid]) {
        decryptKey = savedEncryptionKeys[actualCid].key;
      } else if (!decryptKey && encryptionKey) {
        decryptKey = encryptionKey;
      }

      if (!decryptKey) {
        throw new Error("Decryption key not found. Please provide a decryption key.");
      }
      
      try {
        // Decrypt the file content
        const decryptedContent = decryptContent(encryptedContent, decryptKey);
        
        // If this is the first successful decryption with this key, save it for future use
        if (providedKey && !savedEncryptionKeys[actualCid]) {
          // Extract file info from the decrypted content to save with the key
          let fileInfo = {
            key: providedKey,
            originalType: 'application/octet-stream',
            originalName: actualCid
          };
          
          // Try to detect file type from the decrypted content
          if (decryptedContent.startsWith('data:')) {
            const mimeMatch = decryptedContent.match(/data:([^;]+);/);
            if (mimeMatch && mimeMatch[1]) {
              fileInfo.originalType = mimeMatch[1];
            }
          }
          
          setSavedEncryptionKeys(prev => ({...prev, [actualCid]: fileInfo}));
        }
        
        return decryptedContent;
      } catch (decryptError) {
        console.error("Decryption error:", decryptError);
        throw new Error("Decryption failed. Please check your decryption key.");
      }
    } catch (error) {
      console.error("Error fetching file from IPFS:", error);
      throw error;
    }
  };

  // Share a file with another user
  const shareFile = async (cid, recipientAddress) => {
    if (!isConnected) {
      throw new Error("Please connect your wallet first.");
    }

    if (!ethers.utils.isAddress(recipientAddress)) {
      throw new Error("Please enter a valid Ethereum address.");
    }

    try {
      // Check if CID is encrypted (starts with common CryptoJS pattern)
      let originalCid = cid;
      if (cid.startsWith('U2Fsd')) {
        try {
          // Decrypt CID with sender's address
          originalCid = decryptCID(cid);
          console.log('Decrypted CID:', originalCid);
        } catch (decryptError) {
          console.error('Failed to decrypt CID:', decryptError);
          throw new Error("Failed to decrypt the CID for sharing");
        }
      }
      
      // Re-encrypt the original CID with recipient's address
      const recipientEncryptedCid = CryptoJS.AES.encrypt(originalCid, recipientAddress).toString();
      
      // Share the re-encrypted CID with recipient via smart contract
      // Now using the new parameter for encryptedCid
      const tx = await contract.updateAccess(cid, recipientAddress, recipientEncryptedCid);
      await tx.wait();
      
      // Save mapping between encrypted CID and original CID for reference
      localStorage.setItem(`encrypted_${recipientEncryptedCid}`, originalCid);
      
      return tx.hash;
    } catch (error) {
      console.error("Error sharing file:", error);
      throw error;
    }
  };

  // Revoke access to a file
  const revokeAccess = async (cid, recipientAddress) => {
    if (!isConnected) {
      throw new Error("Please connect your wallet first.");
    }

    if (!ethers.utils.isAddress(recipientAddress)) {
      throw new Error("Please enter a valid Ethereum address.");
    }

    try {
      const tx = await contract.removeAccess(cid, recipientAddress);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error revoking access:", error);
      throw error;
    }
  };

  // Delete a file
  const deleteFile = async (cid) => {
    if (!isConnected) {
      throw new Error("Please connect your wallet first.");
    }

    try {
      const tx = await contract.deleteCID(cid);
      await tx.wait();
      
      // Remove encryption key for this CID if it exists
      setSavedEncryptionKeys(prevKeys => {
        const newKeys = { ...prevKeys };
        delete newKeys[cid];
        return newKeys;
      });

      return tx.hash;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      isConnected,
      userAddress,
      connectWallet,
      encryptionKey,
      generateEncryptionKey,
      uploadFile,
      retrieveFiles,
      fetchFileFromIPFS,
      shareFile,
      revokeAccess,
      deleteFile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;