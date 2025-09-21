import React from 'react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>

        <div className="space-y-6 text-gray-700">
          <p>Welcome to our website. These terms and conditions outline the rules and regulations for the use of our website and services. By accessing or using our site, you agree to be bound by these terms.</p>

          <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Use of Website</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>You must be at least 18 years of age to use this website.</li>
              <li>You agree to use the website only for lawful purposes and in a way that does not infringe the rights of others.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Product Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>We strive to ensure all product descriptions, prices, and availability are accurate. However, errors may occur and we reserve the right to correct them without prior notice.</li>
              <li>All images are for illustrative purposes only. The actual product may vary slightly.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Pricing and Payment</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>All prices are listed in INR (₹) and are inclusive of applicable taxes unless stated otherwise.</li>
              <li>We accept payments through secure payment gateways including Razorpay and others.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Shipping and Delivery</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Orders are processed and shipped as per our <Link to="/shipping" className="text-indigo-600 hover:underline">Shipping Policy</Link>.</li>
              <li>Delivery timelines may vary based on location and unforeseen circumstances.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Cancellations and Refunds</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Cancellation and refund requests are governed by our <Link to="/cancellation_refund" className="text-indigo-600 hover:underline">Cancellation & Refund Policy</Link>.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Intellectual Property</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>All content on this website, including text, graphics, logos, images, and software, is the property of the company and protected by applicable copyright laws.</li>
              <li>You may not reproduce, distribute, or commercially exploit any content without prior written permission.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>We are not liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Changes to Terms</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>We reserve the right to update or modify these terms at any time without prior notice.</li>
              <li>Your continued use of the site constitutes your acceptance of the revised terms.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Jaipur, Rajasthan.</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms & Conditions, please contact us at{' '}
              <a href="mailto:cottonfab0001@gmail.com" className="text-indigo-600 hover:underline">cottonfab0001@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
