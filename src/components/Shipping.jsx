import React from 'react';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Shipping Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>We are committed to delivering your order accurately, in good condition, and always on time.</p>

          <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Shipping Time</h2>
            <p>Orders are dispatched within 3-5 working days. Unless otherwise specifically mentioned in the product details.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Shipping Charges</h2>
            <p>Shipping and handling charges are given at the time of check out and consumers will know about this before making payments.</p>
          </div>

          <div className="p-4 border-l-4 border-red-500 bg-red-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Delivery Time</h2>
            <p>The product will be delivered to you in 5-7 working days.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
