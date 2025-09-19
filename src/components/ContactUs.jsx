import React, { useEffect } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaHome, FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="h-6 w-6" />,
      title: 'Our Location',
      content: 'A 24, Ashok Vihar, Chandpol Ki Dhani, Sanganer, Jaipur 302029',
      link: 'https://maps.google.com/?q=A+24+ASHOK+VIHAR+CHANDPOL+KI+DHANI+SANGANER+JAIPUR+302029'
    },
    {
      icon: <FaEnvelope className="h-5 w-5" />,
      title: 'Email',
      content: 'cottonfab0001@gmail.com',
      link: 'mailto:cottonfab0001@gmail.com'
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook />, url: 'https://www.facebook.com/LathiShop' },
    { icon: <FaInstagram />, url: 'https://www.instagram.com/lathishop_?igsh=NDIxd252b2lvdzJv' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-sm sm:text-base group"
          aria-label="Go back"
        >
          <FaHome className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="font-medium">Back to Home</span>
        </motion.button>

        <div className="space-y-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {contactInfo.map((item, index) => (
              <motion.a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5 }}
                className="flex items-start p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg text-indigo-600">
                  {item.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-gray-600">{item.content}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="h-64 md:h-80 bg-gray-200">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src="https://maps.google.com/maps?q=A+24+ASHOK+VIHAR+CHANDPOL+KI+DHANI+SANGANER+JAIPUR+302029&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="rounded-t-lg"
              ></iframe>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900">Our Location</h3>
              <p className="text-gray-600 mt-2">A 24, Ashok Vihar, Chandpol Ki Dhani, Sanganer, Jaipur 302029</p>
              <p className="text-sm text-gray-500 mt-1">Find us on Google Maps</p>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3, scale: 1.1 }}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-600 rounded-full transition-colors duration-200"
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;