import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaTruck, 
  FaBoxOpen, 
  FaHome, 
  FaShieldAlt,
  FaPhoneAlt,
  FaInfoCircle,
  FaClock,
  FaCheck,
  FaBox
} from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ref, onValue, off } from 'firebase/database';
import { database, auth } from '../firebase/firebase';
import { toast } from 'react-toastify';

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
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Get order ID from URL or location state
  const orderId = new URLSearchParams(location.search).get('id') || 
                 (location.state && location.state.orderId);

  // Calculate progress based on status
  const calculateProgress = (status) => {
    switch (status) {
      case 'pending':
        return 25;
      case 'processing':
        return 50;
      case 'shipped':
        return 75;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  // Fetch order details from Firebase
  useEffect(() => {
    if (!orderId) {
      toast.error('No order ID provided');
      navigate('/orders');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const orderRef = ref(database, `users/${user.uid}/addresses/${orderId}`);
    
    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const orderData = snapshot.val();
        setOrder({
          id: orderId,
          ...orderData,
          date: orderData.timestamp ? new Date(orderData.timestamp) : new Date()
        });
        setProgress(calculateProgress(orderData.status || 'pending'));
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      setIsLoading(false);
    });

    return () => off(orderRef, 'value', unsubscribe);
  }, [orderId, navigate]);

  const deliverySteps = [
    {
      id: 'pending',
      title: 'Order Placed',
      description: 'We have received your order',
      icon: <FaCheckCircle className="h-5 w-5" />,
      active: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      statuses: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    {
      id: 'processing',
      title: 'Processing',
      description: 'Your order is being prepared',
      icon: <FaClock className="h-5 w-5" />,
      active: ['processing', 'shipped', 'delivered'].includes(order?.status || ''),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      statuses: ['processing', 'shipped', 'delivered']
    },
    {
      id: 'shipped',
      title: 'Shipped',
      description: 'Your order is on the way',
      icon: <FaTruck className="h-5 w-5" />,
      active: ['shipped', 'delivered'].includes(order?.status || ''),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      statuses: ['shipped', 'delivered']
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Your order has been delivered',
      icon: <FaCheck className="h-5 w-5" />,
      active: order?.status === 'delivered',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      statuses: ['delivered']
    },
    {
      id: 'cancelled',
      title: 'Cancelled',
      description: 'Your order has been cancelled',
      icon: <FaInfoCircle className="h-5 w-5" />,
      active: order?.status === 'cancelled',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      statuses: ['cancelled']
    }
  ].filter(step => 
    step.statuses.includes(order?.status || '') || 
    (order?.status === 'cancelled' && step.id === 'cancelled')
  );

  // Calculate estimated delivery date (3-7 days from order date)
  const estimatedDelivery = order?.date ? new Date(order.date) : new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (order?.status === 'delivered' ? 0 : 3 + Math.floor(Math.random() * 5)));

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
          <p className="mt-2 text-gray-600">We couldn't find the order you're looking for.</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View All Orders
          </button>
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
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Placed on {formatDate(order.date)}
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'delivered' 
                    ? 'bg-green-100 text-green-800' 
                    : order.status === 'shipped' 
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    order.status === 'delivered'
                      ? 'bg-green-500'
                      : order.status === 'cancelled'
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                ></motion.div>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-right">
                {order.status === 'delivered' ? (
                  <>
                    Delivered on: <span className="font-medium">{formatDate(order.deliveredAt || order.updatedAt || order.date)}</span>
                  </>
                ) : order.status === 'cancelled' ? (
                  <>
                    Cancelled on: <span className="font-medium">{formatDate(order.cancelledAt || order.updatedAt || new Date())}</span>
                  </>
                ) : (
                  <>
                    Estimated delivery: <span className="font-medium">{formatDate(estimatedDelivery)}</span>
                  </>
                )}
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
                      className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${
                        order.status === 'cancelled' && step.id !== 'cancelled' 
                          ? 'bg-gray-100 text-gray-400' 
                          : step.active 
                            ? `${step.bgColor} ${step.iconColor}` 
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="mt-2">
                      <h3 className={`text-base font-medium ${
                        order.status === 'cancelled' && step.id !== 'cancelled'
                          ? 'text-gray-400'
                          : step.active
                            ? step.color
                            : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        order.status === 'cancelled' && step.id !== 'cancelled'
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                      {step.id === 'shipped' && order.trackingNumber && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Tracking Number:</p>
                          <p className="text-blue-600">{order.trackingNumber}</p>
                          {order.trackingUrl && (
                            <a 
                              href={order.trackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline mt-1 inline-block"
                            >
                              Track Package
                            </a>
                          )}
                        </div>
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
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number</span>
                <span className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date</span>
                <span className="font-medium">{formatDate(order.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium">{order.paymentMethod || 'Cash on Delivery'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">{formatCurrency(order.total)}</span>
              </div>
            </div>
            
            {order.items && order.items.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="font-medium">{order.address?.name || 'N/A'}</p>
                <p className="text-gray-600">{order.address?.addressLine1 || ''}</p>
                {order.address?.addressLine2 && <p className="text-gray-600">{order.address.addressLine2}</p>}
                <p className="text-gray-600">
                  {[order.address?.city, order.address?.state, order.address?.postalCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p className="text-gray-600 mt-2">
                  <FaPhoneAlt className="inline mr-2 text-sm" />
                  {order.address?.phone || 'N/A'}
                </p>
              </div>
            </div>
            
            {order.status === 'cancelled' && order.cancellationReason && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                <h4 className="font-medium text-red-800">Cancellation Reason</h4>
                <p className="text-red-700 mt-1">{order.cancellationReason}</p>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+919999999999"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaPhoneAlt className="mr-2 text-indigo-600" />
                  Call Support
                </a>
                <a
                  href="mailto:support@latthi.com"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaInfoCircle className="mr-2 text-indigo-600" />
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Delivery;
