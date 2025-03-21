// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FuelReceiptStorage {
    struct Receipt {
        string receiptNumber;
        string date;
        string time;
        string phase;           // e.g. "A4" for Transportation, "A5" for Construction/Power
        string energyType;      // "diesel", "petrol", or "electric"
        uint256 quantity;       // Gallons or kWh, scaled by 1000
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
        string phase,
        string energyType,
        uint256 quantity,
        string locationName,
        string locationAddress,
        uint256 carbonEmissions
    );

    // Emission factors (scaled by 1000)
    // Diesel & petrol = grams CO2 per gallon
    // Electricity = grams CO2 per kWh (0.146 kg CO2/kWh -> 146 g CO2/kWh)
    uint256 private constant DIESEL_EMISSION_FACTOR = 2519;
    uint256 private constant PETROL_EMISSION_FACTOR = 2110;
    uint256 private constant ELECTRIC_EMISSION_FACTOR = 146;

    /**
     * @notice Store a receipt, computing carbon emissions automatically.
     * @dev For phases: "A4" might indicate transport fuel (diesel/petrol),
     *      "A5" might indicate electricity usage for construction. This
     *      function can handle either fuel or electricity receipts.
     *
     * @param _receiptNumber   Unique reference or invoice number
     * @param _date            YYYY-MM-DD or similar
     * @param _time            HH:MM:SS or similar
     * @param _phase           "A4" or "A5" (or custom strings)
     * @param _energyType      "diesel", "petrol", or "electric"
     * @param _quantity        If A4/fuel: gallons * 1000; if A5/electric: kWh * 1000
     * @param _locationName    Name of the gas station, power company, etc.
     * @param _locationAddress Street address or location text
     */
    function storeReceipt(
        string memory _receiptNumber,
        string memory _date,
        string memory _time,
        string memory _phase,
        string memory _energyType,
        uint256 _quantity,
        string memory _locationName,
        string memory _locationAddress
    )
        public
    {
        // Calculate carbon emissions in grams
        uint256 carbonEmissions = calculateEmissions(_energyType, _quantity);

        receipts[receiptCount] = Receipt({
            receiptNumber: _receiptNumber,
            date: _date,
            time: _time,
            phase: _phase,
            energyType: _energyType,
            quantity: _quantity,
            locationName: _locationName,
            locationAddress: _locationAddress,
            carbonEmissions: carbonEmissions
        });

        emit ReceiptStored(
            receiptCount,
            _receiptNumber,
            _date,
            _time,
            _phase,
            _energyType,
            _quantity,
            _locationName,
            _locationAddress,
            carbonEmissions
        );

        receiptCount++;
    }

    /**
     * @notice Compute carbon emissions for a given type of energy usage.
     * @dev We use string comparison to decide which factor to apply.
     *      All factors and quantities are scaled by 1000 for integer math.
     *
     * @param _energyType  "diesel", "petrol", or "electric"
     * @param _quantity    scaled gallons (for diesel/petrol) or scaled kWh (for electric)
     * @return emissions   in grams CO2
     */
    function calculateEmissions(string memory _energyType, uint256 _quantity)
        internal
        pure
        returns (uint256)
    {
        uint256 emissionFactor;

        if (compareStrings(_energyType, "diesel")) {
            emissionFactor = DIESEL_EMISSION_FACTOR;        // g CO2 per gallon
        } else if (compareStrings(_energyType, "petrol")) {
            emissionFactor = PETROL_EMISSION_FACTOR;        // g CO2 per gallon
        } else if (compareStrings(_energyType, "electric")) {
            emissionFactor = ELECTRIC_EMISSION_FACTOR;      // g CO2 per kWh
        } else {
            revert("Invalid energy type");
        }

        // Emissions = factor * quantity / 1000
        // Because both emissionFactor and _quantity are scaled by 1000
        return (emissionFactor * _quantity) / 1000;
    }

    /**
     * @dev Compare two strings in Solidity using keccak256 hashing.
     */
    function compareStrings(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return (keccak256(bytes(a)) == keccak256(bytes(b)));
    }

    /**
     * @notice Get a stored receipt by ID.
     */
    function getReceipt(uint256 _receiptId)
        public
        view
        returns (
            string memory receiptNumber,
            string memory date,
            string memory time,
            string memory phase,
            string memory energyType,
            uint256 quantity,
            string memory locationName,
            string memory locationAddress,
            uint256 carbonEmissions
        )
    {
        Receipt storage r = receipts[_receiptId];
        return (
            r.receiptNumber,
            r.date,
            r.time,
            r.phase,
            r.energyType,
            r.quantity,
            r.locationName,
            r.locationAddress,
            r.carbonEmissions
        );
    }
}
