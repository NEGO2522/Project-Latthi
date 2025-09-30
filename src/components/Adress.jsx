import { useState, useMemo, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, 
  FiCreditCard, 
  FiCheckCircle, 
  FiHome, 
  FiMail, 
  FiPhone, 
  FiLoader, 
  FiShoppingCart,
  FiArrowLeft
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { handleImageError } from '../utils/imageUtils';
import { auth, database, ref, push, set } from '../firebase/firebase';

const Adress = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [items, setItems] = useState(state?.items || (state?.item ? [state.item] : null));
  const [isLoading, setIsLoading] = useState(!state?.item && !state?.items);
  const isCartCheckout = state?.fromCart || false;
  
  // Initialize form state with all required fields
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'online',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (state?.items || state?.item) {
      setItems(state.items || [state.item]);
      setIsLoading(false);
    } else if (!state && !isLoading) {
      // Only show error and navigate if we're not in the initial loading state and no state is provided
      toast.error('No products selected. Please add items to your cart first.');
      navigate('/');
    }
  }, [state, navigate, isLoading]);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Lakshadweep', 'Puducherry'
  ];

  const { subtotal, total, item } = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        item: null
      };
    }
    
    const subtotalValue = items.reduce((total, currentItem) => {
      try {
        const price = typeof currentItem.price === 'string' 
          ? parseFloat(currentItem.price.replace(/[^0-9.]/g, '') || '0')
          : (currentItem.price || 0);
        return total + (price * (currentItem.quantity || 1));
      } catch (error) {
        console.error('Error calculating price:', error);
        return total;
      }
    }, 0);
    
    return {
      subtotal: subtotalValue,
      shipping: 0,
      tax: 0,
      total: subtotalValue,
      item: items[0] // For single item view
    };
  }, [items]);

  const itemPrice = useMemo(() => {
    if (!item?.price) return 0;
    const priceStr = String(item.price).replace(/[^0-9]/g, '');
    const num = parseInt(priceStr, 10);
    return isNaN(num) ? 0 : num;
  }, [item?.price]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!/^[0-9]{10}$/.test(form.phone)) errors.phone = 'Enter a valid 10-digit phone number';
    if (!/.+@.+\..+/.test(form.email)) errors.email = 'Enter a valid email address';
    if (!form.address1.trim()) errors.address1 = 'Address line 1 is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State is required';
    if (!/^[0-9]{6}$/.test(form.pincode)) errors.pincode = 'Enter a valid 6-digit pincode';
    
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
        const firstErrorField = Object.keys(errors)[0];
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
            element.focus();
            toast.error(errors[firstErrorField]);
        }
        return false;
    }
    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processRazorpayPayment = async () => {
    setIsProcessing(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load payment gateway. Please try again.');
      setIsProcessing(false);
      return;
    }

    // Calculate the total amount from items
    const orderTotal = items.reduce((sum, item) => {
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9.]/g, '') || '0')
        : (item.price || 0);
      return sum + (price * (item.quantity || 1));
    }, 0);

    const amountInPaise = Math.round(orderTotal * 100);
    const clientOrderId = `order_${Date.now()}`;

    const orderData = {
        item,
        total: orderTotal,
        address: form,
        paymentMethod: 'Online Payment',
        orderId: clientOrderId,
    };

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.max(amountInPaise, 100), // Ensure minimum amount is 1 INR (100 paise) for testing
      currency: 'INR',
      name: 'Lathi',
      description: `Order for ${items.length} item${items.length > 1 ? 's' : ''}`,
      image: '/assets/Logo.png',
      handler: async function (response) {
        try {
          const orderCompleteData = {
            ...orderData,
            paymentId: response.razorpay_payment_id,
          };
          await saveAddressToDatabase(orderCompleteData);
          await sendOrderConfirmationEmail(form.email, orderCompleteData);
          toast.success('Payment successful!');
          navigate('/order-placed', { state: orderCompleteData });
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
        ondismiss: function() {
          setIsProcessing(false);
          toast.info('Payment window closed');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response) {
        console.error('Payment Failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
    try {
      emailjs.init('ysnBHfSgoyz0mMUgP');
      await emailjs.send('service_ldbz037', 'template_3sqwp3j', {
        to_email: userEmail,
        to_name: orderDetails.address.fullName,
        order_id: orderDetails.orderId,
        order_total: `₹${orderDetails.total}`,
        delivery_address: `${orderDetails.address.address1}, ${orderDetails.address.city}, ${orderDetails.address.state} - ${orderDetails.address.pincode}`,
        item_name: orderDetails.item.name,
        quantity: orderDetails.item.quantity || 1,
        message: 'Thank you for your order! It will be delivered within 3 business days.'
      });
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
    }
  };

  const saveAddressToDatabase = async (orderData) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("No user logged in");
      const ordersRef = ref(database, `users/${userId}/orders`);
      const newOrderRef = push(ordersRef);
      const itemsData = [{
        id: item?.id || 'unknown',
        name: item?.name || 'Unknown Product',
        price: priceNumber,
        quantity: item?.quantity || 1,
        image: item?.image || item?.images?.[0] || '',
      }];

      await set(newOrderRef, {
        ...orderData.address,
        orderId: orderData.orderId,
        paymentId: orderData.paymentId,
        paymentMethod: orderData.paymentMethod,
        total: orderData.total,
        status: 'Paid',
        items: itemsData,
        timestamp: Date.now(),
      });
      return newOrderRef.key;
    } catch (error) {
      console.error('Error saving order to database:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await processRazorpayPayment();
  };

  if (isLoading || !items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-2xl text-indigo-600" />
      </div>
    );
  }

  const currentItem = items[0]; // Get the first item for display
  
  // Calculate price for display
  const getDisplayPrice = (price) => {
    if (!price) return 0;
    const priceStr = String(price).replace(/[^0-9]/g, '');
    const num = parseInt(priceStr, 10);
    return isNaN(num) ? 0 : num;
  };
  
  const displayPrice = getDisplayPrice(currentItem?.price);

  return (
    <div className="min-h-screen bg-white pt-2">
        {/* Mobile Header with Logo */}
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <img 
              src="/assets/Logo.png" 
              alt="Lathi Logo" 
              className="h-8 w-auto"
              onError={handleImageError}
            />
            <span className="ml-2 text-xl font-semibold">Lathi</span>
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-6">
            <div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center text-sm text-gray-600">
                <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs mr-2">1</span>
                    <span className="font-medium">Address</span>
                </div>
                <span className="mx-3 h-0.5 w-6 bg-gray-300"></span>
                <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs mr-2`}>2</span>
                    <span className="font-medium">Payment</span>
                </div>
            </div>
        </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <FiMapPin />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.fullName ? 'border-red-500' : ''}`} required />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">Phone</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.phone ? 'border-red-500' : ''}`} required />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.email ? 'border-red-500' : ''}`} required />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Address Line 1</label>
                    <input type="text" name="address1" value={form.address1} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.address1 ? 'border-red-500' : ''}`} required />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <input type="text" name="address2" value={form.address2} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">City</label>
                    <input type="text" name="city" value={form.city} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.city ? 'border-red-500' : ''}`} required />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">State</label>
                    <select name="state" value={form.state} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 bg-white ${fieldErrors.state ? 'border-red-500' : ''}`} required>
                        <option value="">Select State</option>
                        {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">Pincode</label>
                    <input type="text" name="pincode" value={form.pincode} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.pincode ? 'border-red-500' : ''}`} required />
                </div>
                </div>

                <div className="flex items-center mt-8 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                    <FiCreditCard />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Payment Options</h2>
                </div>

                <div className="grid grid-cols-1 gap-3">
                <label className={`border rounded-xl p-4 flex items-center space-x-3 transition-all border-indigo-500 bg-indigo-50`}>
                    <input type="radio" name="paymentMethod" value="online" checked={true} readOnly className="hidden" />
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
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full ${isProcessing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                >
                    {isProcessing ? (
                    <><FiLoader className="animate-spin" /> Processing...</>
                    ) : (
                    'Place Order'
                    )}
                </button>
                </div>
            </form>
          </div>

          <div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit lg:sticky lg:top-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary ({items?.length || 0} {items?.length === 1 ? 'Item' : 'Items'})</h3>
            
            {/* List of all items */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {items?.map((item, index) => {
                const price = typeof item.price === 'string' 
                  ? parseFloat(item.price.replace(/[^0-9.]/g, '') || '0')
                  : (item.price || 0);
                const quantity = item.quantity || 1;
                
                return (
                  <div key={index} className="flex items-start space-x-4 border-b pb-3">
                    <img 
                      src={item.image || item.images?.[0]} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-lg object-cover border" 
                      onError={handleImageError} 
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
                      <p className="text-sm text-gray-600">Size: {item.size || 'One Size'} • Qty: {quantity}</p>
                      <p className="text-sm font-medium mt-1">₹{price.toFixed(2)} × {quantity} = ₹{(price * quantity).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Total */}
            <div className="mt-5 space-y-2 text-sm text-gray-700 border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal ({items?.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</span>
                <span>₹{items?.reduce((sum, item) => {
                  const price = typeof item.price === 'string' 
                    ? parseFloat(item.price.replace(/[^0-9.]/g, '') || '0')
                    : (item.price || 0);
                  return sum + (price * (item.quantity || 1));
                }, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t mt-2">
                <span>Total Amount</span>
                <span>₹{items?.reduce((sum, item) => {
                  const price = typeof item.price === 'string' 
                    ? parseFloat(item.price.replace(/[^0-9.]/g, '') || '0')
                    : (item.price || 0);
                  return sum + (price * (item.quantity || 1));
                }, 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center text-xs text-gray-500"><FiCheckCircle className="mr-2" /> Secure checkout powered by Lathi</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adress;