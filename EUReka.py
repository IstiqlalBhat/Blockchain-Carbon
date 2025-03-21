import base64
import requests
import os
import time
import json
from web3 import Web3

# API Key and Ganache settings
api_key = "OpenAI API Key"
ganache_url = "http://127.0.0.1:7545"
web3 = Web3(Web3.HTTPProvider(ganache_url))

# We won't do local carbon emission calculations anymore (the contract does that).
# But if you want any conversions, you can still define them here.
GALLON_TO_LITER = 3.78541

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Load contract ABI
with open('contract_abi.json', 'r') as abi_file:
    contract_abi = json.load(abi_file)

# Connect to Ganache and initialize contract
if not web3.is_connected():
    print("Failed to connect to Ganache")
    exit()

contract_address = "CTADRESS"
contract = web3.eth.contract(address=contract_address, abi=contract_abi)
web3.eth.default_account = web3.eth.accounts[0]

# Process images
image_folder = "C:/CodeJaai/NEWCARBON/Images"
for image_name in os.listdir(image_folder):
    image_path = os.path.join(image_folder, image_name)
    if not os.path.isfile(image_path) or not image_path.endswith(('.png', '.jpg', '.jpeg')):
        continue

    base64_image = encode_image(image_path)
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    # ---- NEW PROMPT ----
    # We now request a JSON object containing:
    #   "receipt_number", "date", "time", "phase", "energy_type", "quantity", location{ name, address }
    # For fuel receipts (A4), "energy_type" should be "diesel" or "petrol", and "quantity" is in gallons.
    # For power receipts (A5), "energy_type" = "electric", and "quantity" is in kWh.
    # We rely on the AI to parse the receipt type and fill phase properly ("A4" or "A5").
    prompt_text = """Extract the following information from the construction-phase (A5) or transportation-phase (A4) receipts. 
Output ONLY a valid JSON object with no triple backticks or code fences:

{
  "receipt_number": "[INVOICE or receipt ID]",
  "date": "[YYYY-MM-DD]",
  "time": "[HH:MM:SS]",
  "phase": "[A4 or A5]",
  "energy_type": "[diesel, petrol, or electric]",
  "quantity": [decimal number],
  "location": {
    "name": "[station/utility/company name]",
    "address": "[full address]"
  }
}

Rules:
1. If it's a transportation (fuel station) receipt, phase must be "A4", energy_type must be "diesel" or "petrol", and quantity is in gallons.
2. If it's a construction-phase receipt, phase must be "A5". The energy_type can be "diesel", "petrol", or "electric". 
   - If diesel or petrol for A5, quantity is still in gallons.
   - If electric for A5, quantity is in kilowatt-hours (kWh).
    Return only a valid JSON object with no triple backticks or code fences.
    """

    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_text},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ],
        "max_tokens": 500
    }

    time.sleep(5)  # Avoid rate limiting

    # Request the extracted information
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    if response.status_code != 200:
        print(f"API request failed for {image_name}: {response.status_code} - {response.text}")
        continue

    data = response.json()
    content_value = data['choices'][0]['message']['content']
    
    # DEBUG: Print the raw response from the model
    print("DEBUG response:", content_value)

    try:
        json_content = json.loads(content_value)
        receipt_number = json_content.get('receipt_number', '')
        date = json_content.get('date', '')
        time_val = json_content.get('time', '')
        phase = json_content.get('phase', '').upper()  # "A4" or "A5"
        energy_type = json_content.get('energy_type', '').lower()  # "diesel", "petrol", or "electric"
        quantity = json_content.get('quantity', 0.0)
        location_name = json_content.get('location', {}).get('name', '')
        location_address = json_content.get('location', {}).get('address', '')

        # Validate inputs
        if phase not in ["A4", "A5"]:
            print(f"Invalid phase '{phase}' for {image_name}")
            continue
        if energy_type not in ["diesel", "petrol", "electric"]:
            print(f"Invalid energy type '{energy_type}' in {image_name}")
            continue

        # Convert the quantity to the contract's "scaled by 1000" format
        # For A4, 'quantity' is in gallons => scaled gallons
        # For A5, 'quantity' is in kWh => scaled kWh
        scaled_quantity = int(quantity * 1000)

        # Prepare transaction for our new storeReceipt function
        tx = contract.functions.storeReceipt(
            receipt_number,
            date,
            time_val,
            phase,           # "A4" or "A5"
            energy_type,     # "diesel", "petrol", "electric"
            scaled_quantity, # scaled by 1000
            location_name,
            location_address
        ).build_transaction({
            'from': web3.eth.default_account,
            'nonce': web3.eth.get_transaction_count(web3.eth.default_account),
            'gas': 3000000,
            'gasPrice': web3.to_wei('20', 'gwei')
        })

        # Sign and send transaction
        signed_tx = web3.eth.account.sign_transaction(tx, private_key='PRIVATE_KEY')
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Wait for transaction receipt
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Data from {image_name} stored in blockchain. TX Hash: {tx_hash.hex()}")

    except json.JSONDecodeError:
        print(f"Failed to decode JSON from {image_name}")
        # Show the raw problematic response so you can debug further
        print(f"Raw response was: {content_value}")
        continue
