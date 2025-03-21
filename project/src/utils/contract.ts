import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = '0x22322523620dCa925Cb24890cf184a5224822890';

export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "receiptId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "receiptNumber",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "date",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "time",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "fuelType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "quantityGallons",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "locationName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "locationAddress",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "carbonEmissions",
        "type": "uint256"
      }
    ],
    "name": "ReceiptStored",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_receiptNumber",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_date",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_time",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_fuelType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_quantityGallons",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_locationName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_locationAddress",
        "type": "string"
      }
    ],
    "name": "storeReceipt",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_receiptId",
        "type": "uint256"
      }
    ],
    "name": "getReceipt",
    "outputs": [
      {
        "internalType": "string",
        "name": "receiptNumber",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "date",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "time",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fuelType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "quantityGallons",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "locationName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "locationAddress",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "carbonEmissions",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "receiptCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const getContract = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};