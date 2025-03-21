import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/contract';
import { FileIcon, DropletsIcon, MapPinIcon, LeafIcon } from 'lucide-react';

interface Receipt {
  receiptNumber: string;
  date: string;
  time: string;
  fuelType: string;
  quantityLitres: number;
  locationName: string;
  locationAddress: string;
  carbonEmissions: number;
}

export default function ReceiptList() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('litres');

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const contract = await getContract();
      const count = await contract.receiptCount();
      const receiptPromises = [];

      for (let i = 0; i < count; i++) {
        receiptPromises.push(contract.getReceipt(i));
      }

      const receiptsData = await Promise.all(receiptPromises);
      const formattedReceipts = receiptsData.map((receipt) => ({
        receiptNumber: receipt[0],
        date: receipt[1],
        time: receipt[2],
        fuelType: receipt[3],
        quantityLitres: Number(receipt[4]) / 1000,
        locationName: receipt[5],
        locationAddress: receipt[6],
        carbonEmissions: Number(receipt[7]),
      }));

      setReceipts(formattedReceipts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading receipts:', error);
      setLoading(false);
    }
  };

  const toggleUnit = () => {
    setUnit((prevUnit) => (prevUnit === 'litres' ? 'gallons' : 'litres'));
  };

  const formatQuantity = (quantityInLitres: number) => {
    if (unit === 'litres') {
      return `${quantityInLitres.toFixed(3)} litres`;
    } else {
      const quantityInGallons = quantityInLitres / 3.78541;
      return `${quantityInGallons.toFixed(3)} gallons`;
    }
  };

  const totalCarbonEmissions = receipts.reduce(
    (sum, receipt) => sum + receipt.carbonEmissions,
    0
  );
  const formatCarbonEmissions = (emissions: number) => {
    return emissions >= 1000
      ? `${(emissions / 1000).toFixed(2)} kg`
      : `${emissions.toLocaleString()} g`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle Switch */}
      <div className="flex items-center justify-end">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={unit === 'gallons'}
            onChange={toggleUnit}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600"></div>
          <div
            className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
              unit === 'gallons' ? 'translate-x-5' : ''
            }`}
          ></div>
          <span className="ml-3 text-sm font-medium text-gray-900">
            {unit === 'litres' ? 'Litres' : 'Gallons'}
          </span>
        </label>
      </div>

      {receipts.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <LeafIcon className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Total Carbon Emissions
              </h2>
              <p className="text-2xl font-bold text-green-600">
                {formatCarbonEmissions(totalCarbonEmissions)}
                <span className="text-sm font-normal text-gray-600 ml-2">
                  CO₂
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {receipts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No receipts found. Start by adding a new receipt.
        </div>
      ) : (
        receipts.map((receipt, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">
                    Receipt #{receipt.receiptNumber}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  {receipt.date} at {receipt.time}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <DropletsIcon className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    {formatQuantity(receipt.quantityLitres)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 capitalize">
                  {receipt.fuelType}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium">{receipt.locationName}</p>
                  <p className="text-sm text-gray-600">
                    {receipt.locationAddress}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Carbon Emissions:{' '}
                {formatCarbonEmissions(receipt.carbonEmissions)} CO₂
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
