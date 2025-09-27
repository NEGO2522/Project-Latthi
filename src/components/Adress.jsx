import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { database } from '../firebase/firebase';
import { useCart } from '../hooks/useCart';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';

const Adress = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [itemToPurchase, setItemToPurchase] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    state: '',
    city: '',
    address1: '',
    address2: ''
  });

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (location.state && location.state.item) {
      setItemToPurchase(location.state.item);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkout = async (amount) => {
    try {
      const response = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt: `order_rcptid_${Date.now()}` })
      });
      const order = await response.json();

      const options = {
        key: 'rzp_test_YourRazorpayKeyId', // Replace with your Key ID
        amount: order.amount,
        currency: order.currency,
        name: "LATHI",
        description: "E-commerce transaction",
        image: "/assets/Logo.png",
        order_id: order.id,
        handler: async (response) => {
          const paymentId = response.razorpay_payment_id;
          const orderId = response.razorpay_order_id;
          const signature = response.razorpay_signature;

          await handleSuccessfulPayment(paymentId, orderId, signature);
        },
        prefill: {
            name: formData.fullName,
            email: user?.email || '',
            contact: formData.mobileNumber
        },
        notes: {
            address: `${formData.address1}, ${formData.city}`
        },
        theme: {
            color: "#4F46E5"
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay checkout error: ", error);
      toast.error("Payment gateway failed to load.");
      setSubmitting(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (!itemToPurchase) {
        toast.error("No item selected for purchase.");
        setSubmitting(false);
        return;
    }
    const totalAmount = itemToPurchase.price * (itemToPurchase.quantity || 1);
    checkout(totalAmount);
  };

  const handleSuccessfulPayment = async (paymentId, orderId, signature) => {
    if (!user) {
      toast.error('You must be logged in to place an order.');
      navigate('/login');
      return;
    }
    const dbOrderId = `LATHI_${Date.now()}`;
    const orderDetails = {
        dbOrderId: dbOrderId,
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
        item: itemToPurchase,
        address: formData,
        total: itemToPurchase.price * (itemToPurchase.quantity || 1),
        status: 'paid',
        createdAt: new Date().toISOString(),
        user: {
            id: user.uid,
            email: user.email,
        },
    };
    
    try {
        await set(ref(database, `users/${user.uid}/orders/${dbOrderId}`), orderDetails);
        await set(ref(database, `allOrders/${dbOrderId}`), orderDetails);
        await sendOrderConfirmationEmail(user.email, orderDetails);
        
        if (location.state.fromCart) {
            clearCart();
        }

        toast.success('Payment successful and order placed!');
        navigate('/order-placed', { state: { orderId: dbOrderId } });

    } catch (error) {
        console.error("Order submission error after payment: ", error);
        toast.error('Failed to save your order. Please contact support.');
    }
  };
  
  const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
    try {
      emailjs.init('ysnBHfSgoyz0mMUgP'); // Replace with your EmailJS user ID
      await emailjs.send('service_ldbz037', 'template_3sqwp3j', { // Replace with your Service & Template ID
        customer_email: userEmail,
        to_name: orderDetails.address.fullName,
        order_id: orderDetails.dbOrderId,
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

  if (!itemToPurchase) {
      return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Delivery Address</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-3 border rounded-md" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Mobile Number" className="w-full p-3 border rounded-md" required />
            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" className="w-full p-3 border rounded-md" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full p-3 border rounded-md" required />
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full p-3 border rounded-md" required />
          </div>
          <input type="text" name="address1" value={formData.address1} onChange={handleChange} placeholder="Address Line 1" className="w-full p-3 border rounded-md" required />
          <input type="text" name="address2" value={formData.address2} onChange={handleChange} placeholder="Address Line 2 (Optional)" className="w-full p-3 border rounded-md" />
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400" disabled={submitting}>
            {submitting ? 'Processing Payment...' : `Pay ₹${itemToPurchase.price * (itemToPurchase.quantity || 1)}`}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/cart" className="text-indigo-600 hover:underline">Back to Cart</Link>
        </div>
      </div>
    </div>
  );
};

export default Adress;
