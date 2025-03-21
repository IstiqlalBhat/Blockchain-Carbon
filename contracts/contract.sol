// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FuelReceiptStorage {
    struct Receipt {
        string receiptNumber;
        string date;
        string time;
        string fuelType;
        uint256 quantityGallons; // Scaled by 1000 to handle decimals
        string locationName;
        string locationAddress;
        uint256 carbonEmissions; // In grams CO2
    }

    mapping(uint256 => Receipt) public receipts;
    uint256 public receiptCount;

    event ReceiptStored(
        uint256 receiptId,
        string receiptNumber,
        string date,
        string time,
        string fuelType,
        uint256 quantityGallons,
        string locationName,
        string locationAddress,
        uint256 carbonEmissions
    );

    // Emission factors scaled by 1000 to handle decimals (since Solidity doesn't support floating points)
    uint256 private constant DIESEL_EMISSION_FACTOR = 2519; // grams CO2 per gallon
    uint256 private constant PETROL_EMISSION_FACTOR = 2110; // grams CO2 per gallon

    function storeReceipt(
        string memory _receiptNumber,
        string memory _date,
        string memory _time,
        string memory _fuelType,
        uint256 _quantityGallons,
        string memory _locationName,
        string memory _locationAddress
    ) public {
        uint256 carbonEmissions = calculateEmissions(_fuelType, _quantityGallons);

        receipts[receiptCount] = Receipt({
            receiptNumber: _receiptNumber,
            date: _date,
            time: _time,
            fuelType: _fuelType,
            quantityGallons: _quantityGallons,
            locationName: _locationName,
            locationAddress: _locationAddress,
            carbonEmissions: carbonEmissions
        });

        emit ReceiptStored(
            receiptCount,
            _receiptNumber,
            _date,
            _time,
            _fuelType,
            _quantityGallons,
            _locationName,
            _locationAddress,
            carbonEmissions
        );

        receiptCount++;
    }

    function calculateEmissions(string memory _fuelType, uint256 _quantityGallons) internal pure returns (uint256) {
        uint256 emissionFactor;

        if (compareStrings(_fuelType, "diesel")) {
            emissionFactor = DIESEL_EMISSION_FACTOR;
        } else if (compareStrings(_fuelType, "petrol")) {
            emissionFactor = PETROL_EMISSION_FACTOR;
        } else {
            revert("Invalid fuel type");
        }

        // Since both emission factor and quantity are scaled by 1000, we adjust the result accordingly
        return (emissionFactor * _quantityGallons) / 1000; // Result in grams CO2
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(bytes(a)) == keccak256(bytes(b)));
    }

    function getReceipt(uint256 _receiptId) public view returns (
        string memory receiptNumber,
        string memory date,
        string memory time,
        string memory fuelType,
        uint256 quantityGallons,
        string memory locationName,
        string memory locationAddress,
        uint256 carbonEmissions
    ) {
        Receipt storage receipt = receipts[_receiptId];
        return (
            receipt.receiptNumber,
            receipt.date,
            receipt.time,
            receipt.fuelType,
            receipt.quantityGallons,
            receipt.locationName,
            receipt.locationAddress,
            receipt.carbonEmissions
        );
    }
}
