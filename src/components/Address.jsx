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

const Address = () => {
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
    } else if (!items && !isLoading) {
      toast.error('No products selected. Please add items to your cart first.');
      navigate(isCartCheckout ? '/cart' : '/items');
    }
  }, [state, navigate, items, isLoading, isCartCheckout]);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Calculate order summary
  const orderSummary = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0
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
      total: subtotalValue
    };
  }, [items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Email is invalid';
    }
    if (!form.address1.trim()) errors.address1 = 'Address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state) errors.state = 'State is required';
    if (!form.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(form.pincode)) {
      errors.pincode = 'Invalid pincode';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const processRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderSummary.total * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'Your Store Name',
        description: 'Payment for your order',
        image: '/logo.png',
        order_id: null,
        handler: async function (response) {
          try {
            // Verify payment on your server here if needed
            await handleOrderSubmission(response.razorpay_payment_id);
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: form.fullName || '',
          email: form.email || '',
          contact: form.phone || ''
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleOrderSubmission = async (paymentId) => {
    try {
      const orderData = {
        userId: auth.currentUser?.uid,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          size: item.size,
          image: item.image || item.images?.[0]
        })),
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          pincode: form.pincode
        },
        payment: {
          method: 'online',
          status: 'completed',
          transactionId: paymentId,
          amount: orderSummary.total
        },
        status: 'processing',
        createdAt: new Date().toISOString()
      };

      // Save order to Firebase
      const orderRef = ref(database, 'orders');
      const newOrderRef = push(orderRef);
      await set(newOrderRef, orderData);

      // Send confirmation email
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          to_name: form.fullName,
          to_email: form.email,
          order_id: newOrderRef.key,
          order_total: orderSummary.total,
          order_items: items.map(item => ({
            name: item.name,
            quantity: item.quantity || 1,
            price: item.price,
            total: (item.quantity || 1) * (typeof item.price === 'string' 
              ? parseFloat(item.price.replace(/[^0-9.]/g, '') || '0')
              : (item.price || 0))
          })),
          shipping_address: `${form.address1}${form.address2 ? `, ${form.address2}` : ''}, ${form.city}, ${form.state} - ${form.pincode}`
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );

      // Clear cart if coming from cart
      if (isCartCheckout) {
        // You might want to clear the cart here if you have a cart context
        // clearCart();
      }

      // Redirect to success page
      navigate('/order-success', {
        state: {
          orderId: newOrderRef.key,
          total: orderSummary.total,
          paymentId: paymentId
        }
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order. Please try again.');
      setIsProcessing(false);
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
      <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="mt-6 flex items-center text-sm text-gray-600">
          <div className="flex items-center">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs mr-2">1</span>
            <span className="font-medium">Address</span>
          </div>
          <span className="mx-3 h-0.5 w-6 bg-gray-300"></span>
          <div className="flex items-center">
            <span className={`w-6 h-6 rounded-full ${isProcessing ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'} flex items-center justify-center text-xs mr-2`}>2</span>
            <span className={isProcessing ? 'font-medium' : 'text-gray-500'}>Payment</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
                  <input 
                    type="text" 
                    name="fullName" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'}`} 
                    required 
                  />
                  {fieldErrors.fullName && <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`} 
                    required 
                  />
                  {fieldErrors.phone && <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`} 
                    required 
                  />
                  {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Address Line 1</label>
                  <input 
                    type="text" 
                    name="address1" 
                    value={form.address1} 
                    onChange={handleChange} 
                    className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.address1 ? 'border-red-500' : 'border-gray-300'}`} 
                    required 
                  />
                  {fieldErrors.address1 && <p className="mt-1 text-sm text-red-600">{fieldErrors.address1}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Address Line 2 (Optional)</label>
                  <input 
                    type="text" 
                    name="address2" 
                    value={form.address2} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={form.city} 
                    onChange={handleChange} 
                    className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.city ? 'border-red-500' : 'border-gray-300'}`} 
                    required 
                  />
                  {fieldErrors.city && <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">State</label>
                  <select 
                    name="state" 
                    value={form.state} 
                    onChange={handleChange} 
                    className={`w-full border rounded-lg px-3 py-2 bg-white ${fieldErrors.state ? 'border-red-500' : 'border-gray-300'}`} 
                    required
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {fieldErrors.state && <p className="mt-1 text-sm text-red-600">{fieldErrors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Pincode</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={form.pincode} 
                    onChange={handleChange} 
                    className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.pincode ? 'border-red-500' : 'border-gray-300'}`} 
                    required 
                  />
                  {fieldErrors.pincode && <p className="mt-1 text-sm text-red-600">{fieldErrors.pincode}</p>}
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
                    <>
                      <FiLoader className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit lg:sticky lg:top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            {items.map((item) => {
              const itemPrice = getDisplayPrice(item.price);
              const quantity = item.quantity || 1;
              
              return (
                <div key={`${item.id}-${item.size}`} className="flex items-start space-x-4 mb-4">
                  <img 
                    src={item.image || item.images?.[0]} 
                    alt={item.name} 
                    className="w-20 h-20 rounded-lg object-cover border" 
                    onError={handleImageError} 
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.size && `Size: ${item.size}`}{item.size && ' • '}Qty: {quantity}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">₹{itemPrice * quantity}</p>
                  </div>
                </div>
              );
            })}

            <div className="mt-5 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{orderSummary.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>₹{orderSummary.total}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center text-xs text-gray-500">
              <FiCheckCircle className="mr-2" /> Secure checkout powered by Lathi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
