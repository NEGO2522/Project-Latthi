import React from 'react';

const Cancellation_Refund = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cancellation & Refund Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>We understand that sometimes things don't work out. Here is our policy on cancellations and refunds to make the process as smooth as possible for you.</p>

          <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Cancellation Policy</h2>
            <p>You can cancel your order within 24 hours of placing it. To cancel your order, please contact us at <a href="mailto:cottonfab0001@gmail.com" className="text-indigo-600 hover:underline">cottonfab0001@gmail.com</a> with your order number.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Refund Policy</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Once your cancellation is approved, we will initiate a refund to your original method of payment.</li>
              <li>You will receive the credit within a certain amount of days, depending on your card issuer's policies.</li>
              <li>Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</li>
            </ul>
          </div>

          <div className="p-4 border-l-4 border-red-500 bg-red-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Non-Refundable Items</h2>
            <p>Unfortunately, some items cannot be refunded. These include:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Gift cards</li>
                <li>Downloadable software products</li>
                <li>Some health and personal care items</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Exchanges</h2>
            <p>We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <a href="mailto:cottonfab0001@gmail.com" className="text-indigo-600 hover:underline">cottonfab0001@gmail.com</a> and send your item to: A 24, Ashok Vihar, Chandpol Ki Dhani, Sanganer, Jaipur 302029.</p>
          </div>

          <p className="pt-4 border-t border-gray-200">For any further questions, please don't hesitate to contact us.</p>
        </div>
      </div>
    </div>
  );
};

export default Cancellation_Refund;
