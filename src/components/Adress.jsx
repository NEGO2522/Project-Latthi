import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiCheckCircle, FiTruck, FiHome, FiMail, FiPhone, FiLoader, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { handleImageError } from '../utils/imageUtils';
import { auth, database, ref, push, set } from '../firebase/firebase';

// Razorpay will be loaded dynamically

const Adress = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const item = state?.item;

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const errorTimeoutRef = useRef(null);

  // Calculate the base price number first
  const priceNumber = useMemo(() => {
    if (!item?.price) return 0;
    const num = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }, [item?.price]);

  // Then calculate the total based on priceNumber and quantity
  const total = useMemo(() => {
    const qty = item?.quantity ? Number(item.quantity) : 1;
    return priceNumber * qty;
  }, [priceNumber, item?.quantity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for the current field when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      
      // Clear the main validation error if all fields are valid
      if (Object.keys(fieldErrors).length === 1) {
        setValidationError('');
      }
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!/^[0-9]{10}$/.test(form.phone)) errors.phone = 'Enter a valid 10-digit phone number';
    if (!form.email.trim() || !/.+@.+\..+/.test(form.email)) errors.email = 'Enter a valid email address';
    if (!form.address1.trim()) errors.address1 = 'Address line 1 is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State is required';
    if (!/^[0-9]{6}$/.test(form.pincode)) errors.pincode = 'Enter a valid 6-digit pincode';
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setValidationError(firstError);
      
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      
      // Auto-dismiss error after 5 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setValidationError('');
      }, 5000);
      
      // Scroll to the first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      
      return false;
    }
    
    return true;
  };

  const loadRazorpayScript = () => {
    console.log('Loading Razorpay script...');
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        console.log('Razorpay already loaded');
        return resolve(true);
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        if (window.Razorpay) {
          console.log('Razorpay is available in window object');
          resolve(true);
        } else {
          console.error('Razorpay not found in window object after script load');
          resolve(false);
        }
      };
      
      script.onerror = (error) => {
        console.error('Error loading Razorpay script:', error);
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  // Function to create an order on your backend
  const createRazorpayOrder = async (amount) => {
    try {
      // In a real app, you would make an API call to your backend
      // For demo, we'll create a mock order
      const orderData = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        payment_capture: 1,
        notes: {
          item: item.name,
          quantity: item.quantity || 1,
          customer: form.fullName
        }
      };

      // This is where you would normally make an API call to your backend
      // const response = await fetch('/api/create-razorpay-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderData)
      // });
      // const order = await response.json();
      
      // For demo, we'll return a mock order ID
      return {
        id: `order_${Date.now()}`,
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create payment order');
    }
  };

  const processRazorpayPayment = async () => {
    try {
      console.log('Starting Razorpay payment process...');
      setIsProcessing(true);
      
      // First, ensure the Razorpay script is loaded
      console.log('Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        const errorMsg = 'Failed to load Razorpay payment processor';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Razorpay script loaded, creating order...');
      
      // Create order on your backend
      const order = await createRazorpayOrder(total);
      console.log('Order created:', order);

      const orderData = {
        item,
        total: total / 100, // Convert to rupees
        address: form,
        paymentMethod: 'Online Payment',
        orderId: order.id,
      };

      const options = {
        key: env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Lathi',
        description: `Order for ${item.name}`,
        image: '/assets/Logo.png',
        order_id: order.id,
        handler: async function (response) {
          try {
            // Handle successful payment
            const paymentId = response.razorpay_payment_id;
            const orderId = response.razorpay_order_id;
            const signature = response.razorpay_signature;
            
            console.log('Payment successful:', { paymentId, orderId, signature });
            
            // In a real app, you would verify the payment signature on your backend
            // const verificationResponse = await fetch('/api/verify-payment', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ 
            //     razorpay_payment_id: paymentId,
            //     razorpay_order_id: orderId,
            //     razorpay_signature: signature
            // })
            // });
            // const result = await verificationResponse.json();
            
            // if (!result.verified) {
            //   throw new Error('Payment verification failed');
            // }
            
            toast.success('Payment successful!');
            
            // Save order to Firebase after successful payment
            await saveAddressToDatabase({
              ...orderData,
              paymentId: paymentId,
              razorpayOrderId: orderId,
              razorpaySignature: signature
            });
            
            // Navigate to order success page
            navigate('/order-placed', {
              state: {
                ...orderData,
                paymentId: paymentId,
                razorpayOrderId: orderId,
                razorpaySignature: signature
              }
            });
          } catch (error) {
            console.error('Error processing payment success:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: form.fullName || '',
          email: form.email || '',
          contact: form.phone || ''
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          escape: false,
          backdropclose: false,
          confirm_close: true,
          ondismiss: function() {
            console.log('Payment modal dismissed by user');
            setIsProcessing(false);
          }
        },
        notes: {
          address: `${form.address1}, ${form.city}, ${form.state} - ${form.pincode}`,
          item: item.name,
          quantity: item.quantity || 1
        },
        // Important: This ensures the callback is called only after payment
        handler: function(response) {
          // This will be called after successful payment
          console.log('Payment successful:', response);
          toast.success('Payment successful!');
          
          navigate('/order-placed', {
            state: {
              item: item,
              total: total,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              address: form
            }
          });
        }
      };

      // Create a new Razorpay instance
      console.log('Creating Razorpay instance with options:', options);
      
      try {
        const rzp = new window.Razorpay(options);
        console.log('Razorpay instance created:', rzp);
        
        // Add event handlers
        rzp.on('payment.failed', function(response) {
          console.error('Payment failed with response:', response);
          setIsProcessing(false);
          toast.error('Payment failed. Please try again.');
        });
        
        // Open the payment modal
        console.log('Opening Razorpay payment modal...');
        rzp.open({
          modal: {
            ondismiss: function() {
              console.log('Payment modal dismissed');
              setIsProcessing(false);
              toast.info('Payment window closed');
            }
          }
        });
      } catch (error) {
        console.error('Error creating Razorpay instance:', error);
        throw new Error('Failed to initialize payment. Please try again.');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred during payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const saveAddressToDatabase = async (orderData) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user logged in');
        return null;
      }

      // Create a reference to the user's addresses
      const addressesRef = ref(database, `users/${userId}/addresses`);
      const newAddressRef = push(addressesRef);
      
      // Prepare items data, ensuring no undefined values
      const itemsData = [{
        id: item?.id || 'unknown',
        name: item?.name || 'Unknown Product',
        price: priceNumber,
        quantity: item?.quantity || 1,
        // Include both image and images array for backward compatibility
        image: item?.image || (item?.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzljYThkZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxNmMwIDQuNDE4LTRsNi0zLjU4NlYxMS41ODZMMjEgOHY4ek0zIDh2OGMwIDQuNDE4IDQgNi41ODIgNiA3LjQxNEwyMSAxNnYtOEw5IDUuNTg2QzcuMzY0IDYuNTEyIDMgOS44NzkgMyAxNnoiPjwvcGF0aD48L3N2Zz4='),
        // Include the full images array if available
        images: item?.images || [item?.image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzljYThkZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxNmMwIDQuNDE4LTRsNi0zLjU4NlYxMS41ODZMMjEgOHY4ek0zIDh2OGMwIDQuNDE4IDQgNi41ODIgNiA3LjQxNEwyMSAxNnYtOEw5IDUuNTg2QzcuMzY0IDYuNTEyIDMgOS44NzkgMyAxNnoiPjwvcGF0aD48L3N2Zz4=']
      }];

      // Save the address data
      await set(newAddressRef, {
        ...orderData.address,
        timestamp: Date.now(),
        orderId: orderData.orderId || `order_${Date.now()}`,
        paymentMethod: orderData.paymentMethod,
        total: orderData.total,
        status: orderData.paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid',
        items: itemsData
      });

      return newAddressRef.key; // Return the unique key for the address
    } catch (error) {
      console.error('Error saving address to database:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any existing errors
    setValidationError('');
    
    if (!validate()) {
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        item,
        total,
        address: form,
        paymentMethod: form.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        orderId: `order_${Date.now()}`,
      };

      if (form.paymentMethod === 'cod') {
        // Save address to Firebase for COD
        await saveAddressToDatabase(orderData);
        
        // Navigate to order success page
        navigate('/order-placed', {
          state: orderData,
        });
      } else {
        // For online payment, the address will be saved after successful payment
        await processRazorpayPayment();
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process your order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">No item selected for purchase.</p>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            onClick={() => navigate('/items')}
          >
            Go to Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top subtle banner like Home */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 text-center text-sm text-gray-700">
          Fast, tracked delivery on all orders
        </div>
      </div>

      {/* Header with stepper */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">Provide your delivery address and choose a payment method</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs mr-2">1</span>
              <span className="font-medium">Address</span>
            </div>
            <span className="mx-3 h-0.5 w-6 bg-gray-300 hidden sm:block"></span>
            <div className="flex items-center">
              <span className={`w-6 h-6 rounded-full ${form.paymentMethod === 'online' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'} flex items-center justify-center text-xs mr-2`}>2</span>
              <span className="font-medium">Payment</span>
            </div>
            <span className="mx-3 h-0.5 w-6 bg-gray-300 hidden sm:block"></span>
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs mr-2">3</span>
              <span className="font-medium">Review</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Address + Payment Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <FiMapPin />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div></div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  name="address1"
                  value={form.address1}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="House no., Street, Area"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="address2"
                  value={form.address2}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Landmark, Apartment, etc."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">State</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="000000"
                />
              </div>
              
            </div>

            <div className="flex items-center mt-8 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <FiCreditCard />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Payment Options</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className={`cursor-pointer border rounded-xl p-4 flex items-center space-x-3 transition-all ${form.paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={form.paymentMethod === 'cod'}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="w-9 h-9 rounded-full bg-white border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <FiTruck />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-xs text-gray-600">Pay when you receive the order</p>
                </div>
              </label>

              <label className={`cursor-pointer border rounded-xl p-4 flex items-center space-x-3 transition-all ${form.paymentMethod === 'online' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={form.paymentMethod === 'online'}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="w-9 h-9 rounded-full bg-white border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <FiCreditCard />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Online Payment</p>
                  <p className="text-xs text-gray-600">UPI / Card / Net Banking</p>
                </div>
              </label>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`w-full ${isProcessing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
              >
                {isProcessing ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit lg:sticky lg:top-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="flex items-center space-x-4">
              <img
                src={item.images?.[0]}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover border"
                onError={(e) => handleImageError(e, 'Item')}
              />
              <div>
                <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
                <p className="text-sm text-gray-600">Size: {item.size} • Qty: {item.quantity}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Item Price</span>
                <span>₹{priceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity</span>
                <span>{item.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center text-xs text-gray-500">
              <FiCheckCircle className="mr-2" /> Secure checkout powered by Lathi
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Adress;
