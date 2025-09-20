import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaTruck, 
  FaBoxOpen, 
  FaHome, 
  FaArrowRight, 
  FaShieldAlt,
  FaPhoneAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const Delivery = () => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState('processing');
  const [progress, setProgress] = useState(33);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Simulate delivery progress (for demo purposes)
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.floor(Math.random() * 15) + 5, 100);
        
        // Update status based on progress
        if (newProgress >= 90 && currentStatus !== 'delivered') {
          setCurrentStatus('delivered');
        } else if (newProgress >= 60 && currentStatus === 'shipped') {
          setCurrentStatus('in-transit');
        } else if (newProgress >= 30 && currentStatus === 'processing') {
          setCurrentStatus('shipped');
        }
        
        return newProgress;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [currentStatus]);

  const deliverySteps = [
    {
      id: 'processing',
      title: 'Order Confirmed',
      description: 'We have received your order',
      icon: <FaCheckCircle className="h-5 w-5" />,
      active: ['processing', 'shipped', 'in-transit', 'delivered'].includes(currentStatus),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'shipped',
      title: 'Order Processed',
      description: 'Your order is being prepared for shipping',
      icon: <FaTruck className="h-5 w-5" />,
      active: ['shipped', 'in-transit', 'delivered'].includes(currentStatus),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      id: 'in-transit',
      title: 'Out for Delivery',
      description: 'Your order is on its way to you',
      icon: <FaTruck className="h-5 w-5" />,
      active: ['in-transit', 'delivered'].includes(currentStatus),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Your order has been delivered',
      icon: <FaBoxOpen className="h-5 w-5" />,
      active: currentStatus === 'delivered',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }
  ];

  // Calculate estimated delivery time (3 days from now for demo)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
  
  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your delivery details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-sm sm:text-base group"
          aria-label="Go back"
        >
          <FaHome className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="font-medium">Back to Home</span>
        </motion.button>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100"
        >
          <div className="p-6 sm:p-8">
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #LTH-{Math.floor(10000 + Math.random() * 90000)}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Placed on {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {currentStatus === 'delivered' ? 'Delivered' : 'In Transit'}
                </span>
              </div>
            </motion.div>
            
            {/* Progress Bar */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Delivery Progress</span>
                <span className="font-semibold">{progress}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                ></motion.div>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-right">
                Estimated delivery: <span className="font-medium">{formatDate(estimatedDelivery)}</span>
              </p>
            </motion.div>

            {/* Delivery Timeline */}
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <AnimatePresence>
                {deliverySteps.map((step, index) => (
                  <motion.div 
                    key={step.id} 
                    className="relative pl-12 pb-8"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div 
                      className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                        step.active 
                          ? `${step.bgColor} ${step.iconColor} ring-4 ring-opacity-30 ${step.iconColor.replace('text-', 'ring-')}` 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="relative
                      before:absolute before:-left-7 before:top-5 before:w-2 before:h-2 before:rounded-full before:bg-white before:z-10 before:border-2 before:border-indigo-500
                    ">
                      <h3 className={`text-lg font-semibold ${
                        step.active ? step.color : 'text-gray-400'
                      }`}>
                        {step.title}
                        {step.active && currentStatus === step.id && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                            In Progress
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {step.active && step.id === 'delivered' && progress === 100 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start"
                        >
                          <FaCheckCircle className="flex-shrink-0 mt-0.5 mr-2 text-green-500" />
                          <span>Your order has been successfully delivered. Thank you for shopping with us!</span>
                        </motion.div>
                      )}
                    </div>
                    {index < deliverySteps.length - 1 && (
                      <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${
                        deliverySteps[index + 1].active ? 'bg-gradient-to-b from-indigo-200 to-indigo-100' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
          
          {/* Order Summary */}
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number</span>
                <span className="font-medium">#LTH-{Math.floor(10000 + Math.random() * 90000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium">Credit Card</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex justify-between font-semibold">
                  <span>Estimated Delivery</span>
                  <span className="text-indigo-600">{formatDate(estimatedDelivery)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Delivery Location</h2>
              <div className="flex items-center text-sm text-indigo-600">
                <FaShieldAlt className="mr-1" />
                <span>Secure Delivery</span>
              </div>
            </div>
            
            <div className="h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200">
              <iframe
                title="Delivery Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src="https://maps.google.com/maps?q=A+24+ASHOK+VIHAR+CHANDPOL+KI+DHANI+SANGANER+JAIPUR+302029&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="opacity-90 hover:opacity-100 transition-opacity duration-300"
              ></iframe>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <FaMapMarkerAlt className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Location</p>
                  <p className="text-sm font-medium">In Transit</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                  <FaCheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Next Stop</p>
                  <p className="text-sm font-medium">Delivery Hub</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  <FaHome className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Delivery Address</p>
                  <p className="text-sm font-medium">Your Location</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <FaInfoCircle className="text-indigo-500 mr-2" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Delivery Address</h3>
                  <p className="text-gray-600 mt-1">123 Main Street, Apartment 4B</p>
                  <p className="text-gray-600">New York, NY 10001</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <FaPhoneAlt className="mr-1.5 w-3.5 h-3.5" />
                    <span>(123) 456-7890</span>
                  </div>
                  <button className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    Change Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Delivery;