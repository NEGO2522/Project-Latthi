import React from 'react';
import { FiX } from 'react-icons/fi';

const SizeChart = ({ onClose }) => {
  // Size chart data for different categories
  const sizeCharts = {
    'Kurtis & Tops': {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      measurements: [
        { name: 'Bust (in inches)', values: [32, 34, 36, 38, 40, 42] },
        { name: 'Waist (in inches)', values: [26, 28, 30, 32, 34, 36] },
        { name: 'Hips (in inches)', values: [36, 38, 40, 42, 44, 46] },
        { name: 'Length (in inches)', values: [38, 39, 40, 41, 42, 43] },
      ]
    },
    'Bottoms': {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      measurements: [
        { name: 'Waist (in inches)', values: [26, 28, 30, 32, 34, 36] },
        { name: 'Hips (in inches)', values: [36, 38, 40, 42, 44, 46] },
        { name: 'Length (in inches)', values: [38, 39, 40, 41, 42, 43] },
      ]
    },
    'Dresses': {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      measurements: [
        { name: 'Bust (in inches)', values: [32, 34, 36, 38, 40, 42] },
        { name: 'Waist (in inches)', values: [26, 28, 30, 32, 34, 36] },
        { name: 'Hips (in inches)', values: [36, 38, 40, 42, 44, 46] },
        { name: 'Length (in inches)', values: [45, 46, 47, 48, 49, 50] },
      ]
    },
  };

  const [activeCategory, setActiveCategory] = React.useState('Kurtis & Tops');
  const chart = sizeCharts[activeCategory];

  return (
    <div className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Size Guide</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close size chart"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Category</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(sizeCharts).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3 bg-gray-50 text-left text-sm font-medium text-gray-600">Size</th>
                  {chart.sizes.map(size => (
                    <th key={size} className="border p-3 bg-gray-50 text-center text-sm font-medium text-gray-600">
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.measurements.map((row, rowIndex) => (
                  <tr key={row.name} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border p-3 text-sm font-medium text-gray-700">{row.name}</td>
                    {row.values.map((value, colIndex) => (
                      <td key={colIndex} className="border p-3 text-center text-sm text-gray-600">
                        {value}"
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">How to Measure</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Bust:</strong> Measure around the fullest part of your bust, keeping the tape measure horizontal.</li>
              <li>• <strong>Waist:</strong> Measure around the narrowest part of your natural waistline.</li>
              <li>• <strong>Hips:</strong> Measure around the fullest part of your hips, about 8 inches below your waist.</li>
              <li>• <strong>Length:</strong> For tops, measure from the highest point of the shoulder to the bottom hem.</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChart;