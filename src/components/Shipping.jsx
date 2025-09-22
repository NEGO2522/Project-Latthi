import React from 'react';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Shipping Policy with <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold" style={{ fontFamily: "'Great Vibes', cursive" }}>Lathi</span></h1>
        
        <div className="space-y-8 text-gray-700">

          <div className="p-6 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Our Shipping Promise</h2>
            <p>We ship all over India and try to get the best rates for our customers.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Information</h2>
            <ul className="list-disc list-inside space-y-3 pl-4">
              <li>
                <span className="font-semibold">Order Processing:</span> Orders placed Monday through Saturday IST will be processed on the same or following business day.
              </li>
              <li>
                <span className="font-semibold">Dispatch Time:</span> Products will be shipped within two business days of order placement if the product(s) is (are) in inventory in our warehouse.
              </li>
              <li>
                <span className="font-semibold">Delivery Estimates:</span> If you want to inquire about the delivery time of a product, do not hesitate to contact us prior to placing your order.
              </li>
              <li>
                <span className="font-semibold">Shipping Costs:</span> Our shipping charges varies as per the order value and delivery location. Shipping charges for your order will be calculated and displayed at checkout.
              </li>
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
          
          <div className="pt-6 border-t border-gray-200 text-center">
            <p className="text-lg">Have any questions?</p>
            <p>If you have any further questions, please don't hesitate to contact us at <a href="mailto:cottonfab0001@gmail.com" className="text-indigo-600 hover:text-indigo-800 font-semibold">cottonfab0001@gmail.com</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
