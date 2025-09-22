import React from 'react';

const Cancellation_Refund = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cancellation & Refund Policy with <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold" style={{ fontFamily: "'Great Vibes', cursive" }}>Lathi</span></h1>
        
        <div className="space-y-6 text-gray-700">

          <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cancellation Policy</h2>
            <p>In case there is an order cancellation, please do so before it is shipped. Once the product is shipped it can not be cancelled using our website.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Return Policy</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Returns and exchanges are applicable only to select products. Detailed return eligibility and conditions are provided on the respective product pages. For most products, the standard return window is 3 days.</li>
              <li>The return policy for any product is subject to change without prior notice.</li>
              <li>In case we do not have pick up service available at your location, you would have to self-ship the product to our office Address.</li>
              <li>Return/Exchange charges may apply on case to case basis.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">NOTE FOR RETURN</h3>
            <ul className="list-disc list-inside space-y-2 font-bold">
                <li>The items should be unused and unwashed for hygiene reasons.</li>
                <li>The product should have the original packaging and tags in place. Items without the original tags will not be accepted.</li>
                <li>Customized products cannot be returned or exchanged</li>
                <li>Return/Exchange requests that are not raised within the return period (Refer product page) the product would not be accepted.</li>
            </ul>
          </div>
          
          <p className="pt-4 border-t border-gray-200">For any further questions, please don't hesitate to contact us at <a href="mailto:cottonfab0001@gmail.com" className="text-indigo-600 hover:text-indigo-800">cottonfab0001@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default Cancellation_Refund;
