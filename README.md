# Project Name: Carbon Receipt Tracking

This repository demonstrates a workflow for parsing construction-phase and transportation-phase energy/fuel receipts, extracting relevant data using OpenAI's API, and then storing that data on the Ethereum blockchain via a smart contract. Additionally, it includes a basic frontend scaffold (in the `BC-Carbon\project` folder) that you can run locally.

---
## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Smart Contract Deployment (Remix)](#smart-contract-deployment-remix)
4. [Local Blockchain Setup with Ganache](#local-blockchain-setup-with-ganache)
5. [Configuring and Running the Python Script (Eureka.py)](#configuring-and-running-the-python-script-eurekapy)
6. [Frontend Setup (BC-Carbon\project)](#frontend-setup-bc-carbonproject)
7. [File/Folder Structure](#filefolder-structure)
8. [Contributing](#contributing)
9. [License](#license)

---

## Overview

This project automates the following process:

1. **Image Parsing**: Images of fuel/power receipts are encoded as base64 and sent to an OpenAI model (e.g., GPT) to extract structured JSON data.
2. **Blockchain Storage**: The JSON data is then written to an Ethereum smart contract (using [Web3.py](https://web3py.readthedocs.io/)).
3. **Frontend Display**: The data can be viewed in a simple web application (using React / Next.js) in the `BC-Carbon\project` folder.

**Key Components:**
- **Eureka.py**: The Python script that handles:
  - Reading image files.
  - Sending them to the OpenAI endpoint for extraction.
  - Writing the extracted data to the deployed smart contract.
- **Contract.sol**: The Solidity smart contract for storing receipt data (receipt number, date/time, energy/fuel type, quantity, etc.) and calculating carbon emissions (for diesel or petrol only, in this version).
- **BC-Carbon\project**: A basic frontend project where you can show or manipulate the on-chain data.

---

## Prerequisites

1. **Node.js & npm**: To run the frontend (and potentially for Ganache CLI if you choose that path).
2. **Ganache** (from [Truffle suite](https://trufflesuite.com/ganache/)):
   - A local Ethereum blockchain simulator.
3. **Python 3.7+**: For running `Eureka.py`.
4. **pip**: For installing Python dependencies (`requests`, `web3`, etc.).
5. **Remix IDE** (web-based or local installation): For deploying the smart contract easily.
6. **An OpenAI API Key**: Required for sending the prompt to GPT.

---

## Smart Contract Deployment (Remix)

1. **Open Remix IDE** (https://remix.ethereum.org/).
2. **Create a new file** (e.g., `Contract.sol`) in Remix and paste the contents of `Contract.sol` from this repo into it.
3. **Select the Solidity Compiler** (left-hand side plugin in Remix):
   - Choose the correct compiler version (e.g., 0.8.x).
   - Click **Compile Contract.sol**.
4. **Deploy the Contract**:
   - Switch to the **Deploy & Run Transactions** tab (in Remix).
   - In the **Environment** dropdown, select **Injected Web3** if you’re connecting to Ganache locally, or **Remix VM** if you want to test quickly in an in-browser blockchain. 
     - If using **Ganache**, make sure Ganache is running, and that your MetaMask or Web3 wallet is connected to the correct network (localhost:7545).
   - Click **Deploy**.
5. **Note the Deployed Contract Address**: After successful deployment, Remix will show the contract under "Deployed Contracts". Copy the address shown there; you will need it in `Eureka.py` to replace `CTADRESS`.

---

## Local Blockchain Setup with Ganache

1. **Install Ganache** (if not already):
   - Download from [Truffle’s Ganache page](https://trufflesuite.com/ganache/).
2. **Run Ganache**:
   - You can use the **GUI version** or **CLI** version (`ganache-cli`).
   - Make sure it’s listening on `http://127.0.0.1:7545`.
3. **Note the Accounts and Private Keys**:
   - Ganache will show a list of accounts and private keys. In your `Eureka.py`, you will use one of these private keys for signing transactions.

---

## Configuring and Running the Python Script (Eureka.py)

1. **Install Python Dependencies**:
   ```bash
   pip install requests web3
   ```
2. **Edit `Eureka.py`**:
   - Replace:
     - `api_key = "OpenAI API Key"` with your actual OpenAI API Key.
     - `ganache_url = "http://127.0.0.1:7545"` if it’s different in your setup.
     - `contract_address = "CTADRESS"` with the contract address from Remix.
     - `private_key='PRIVATE_KEY'` with the private key of a funded Ganache account (e.g., from Ganache UI/CLI).
3. **Check the Image Folder Path**:
   - Default is `image_folder = "C:/CodeJaai/NEWCARBON/Images"`. If your receipts are stored elsewhere, update the path.
4. **Run the script**:
   ```bash
   python Eureka.py
   ```
   - The script will:
     1. Read each image in the specified folder.
     2. Encode it in base64.
     3. Send it to GPT for JSON extraction.
     4. Attempt to store the resulting data on-chain using the deployed contract.

5. **Transaction Confirmation**:
   - If everything is correct, you’ll see console logs like:
     ```
     Data from {image_name} stored in blockchain. TX Hash: 0x...
     ```
   - If there’s a JSON decoding error or an invalid response from GPT, the script will print an error message and skip that image.

---

## Frontend Setup (BC-Carbon\project)

Inside the folder `C:\CodeJaai\NEWCARBON\BC-Carbon\project`, you’ll find a basic React/Next.js application for viewing or interacting with the on-chain data.

1. **Install Dependencies**:
   ```bash
   cd C:\CodeJaai\NEWCARBON\BC-Carbon\project
   npm install
   ```
2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
3. **Open in Browser**:
   - Navigate to `http://localhost:3000` in your web browser.
4. **Configure Web3** (if necessary):
   - The project may require configuration for connecting to Ganache (localhost:7545). 
   - Check any relevant `.env` files or config to ensure the frontend is pointing to your local blockchain.

---

## File/Folder Structure

Below is a simplified structure of the repository:

```
.
├── BC-Carbon
│   └── project
│       ├── package.json
│       ├── ... (React/Next.js files)
│       └── ...
├── Contract.sol
├── Eureka.py
├── contract_abi.json
└── Images
    ├── receipt1.jpg
    ├── receipt2.png
    └── ...
```

- **BC-Carbon\project**: Contains the frontend code (React/Next.js).
- **Contract.sol**: Solidity smart contract for storing receipt data.
- **Eureka.py**: Python script that extracts data from images using OpenAI and stores it on-chain.
- **contract_abi.json**: ABI file that the Python script uses to interact with the deployed contract.
- **Images**: Folder containing the receipt image files.

---

## Contributing

Contributions are welcome! If you find any bugs, have suggestions, or want to add new features:
1. Fork the repository.
2. Create a new branch for your feature/fix.
3. Submit a pull request detailing the changes.

---

## License

This project is licensed under the [MIT License](LICENSE). 

Feel free to customize, extend, and improve this workflow! If you have questions or need help, please open an issue. Happy building!
