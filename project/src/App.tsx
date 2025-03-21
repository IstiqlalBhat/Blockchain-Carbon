import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { FuelIcon, ListIcon } from 'lucide-react';
import ReceiptList from './components/ReceiptList';

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  const checkMetaMaskConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setIsMetaMaskConnected(accounts.length > 0);

        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          setIsMetaMaskConnected(accounts.length > 0);
        });
      } catch (error) {
        console.error('Error checking MetaMask connection:', error);
      }
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsMetaMaskConnected(true);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  if (!isMetaMaskConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <FuelIcon className="w-16 h-16 text-blue-600 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Fuel Receipt DApp</h1>
          <p className="text-gray-600">
            Connect your MetaMask wallet to start managing your fuel receipts on the blockchain.
          </p>
          <button
            onClick={connectMetaMask}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full"
          >
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FuelIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Transportation Phase</h1>
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            <ListIcon className="w-5 h-5" />
            View Receipts
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <ReceiptList />
        </div>
      </div>
    </div>
  );
}

export default App;
