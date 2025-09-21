import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. By accessing the site, you agree to the collection and use of information in accordance with this policy.</p>

          <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, and payment details.</li>
                <li><strong>Non-Personal Information:</strong> Browser type, IP address, pages visited, time spent, and other analytics data.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
                <li>To process and fulfill your orders.</li>
                <li>To improve our website and services.</li>
                <li>To communicate with you about your orders or inquiries.</li>
                <li>To send promotional emails or updates (only if you opt-in).</li>
                <li>To prevent fraudulent transactions and enhance security.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Sharing Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
                <li>We do <strong>not</strong> sell or rent your personal information to third parties.</li>
                <li>We may share your information with trusted third-party service providers (e.g., payment gateways, delivery partners) solely for order processing.</li>
                <li>We may disclose your information if required by law or to protect our legal rights.</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Payment Information</h2>
            <p>
                All online payments are processed securely through third-party payment gateways like Razorpay. We do not store your credit/debit card information on our servers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Cookies</h2>
            <p>
                We use cookies to improve your browsing experience. You can choose to disable cookies through your browser settings, but some parts of the site may not function properly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Data Security</h2>
            <p>
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Your Rights</h2>
            <ul className="list-disc list-inside space-y-1">
                <li>You can request access to your personal data.</li>
                <li>You may update or delete your data by contacting us.</li>
                <li>You can opt out of receiving promotional communications at any time.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Changes to This Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date.
            </p>
          </div>


          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
              <a href="mailto:cottonfab0001@gmail.com" className="text-indigo-600 hover:underline">cottonfab0001@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
