import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
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
      // If no item is passed, redirect or handle appropriately
      navigate('/'); // Example: redirect to home if no item
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    if (!itemToPurchase) {
        toast.error("No item selected for purchase.");
        setSubmitting(false);
        return;
    }

    if (!user) {
      toast.error('You must be logged in to place an order.');
      navigate('/login');
      setSubmitting(false);
      return;
    }
    
    const orderId = `LATHI_${Date.now()}`;
    
    const orderDetails = {
        orderId: orderId,
        item: itemToPurchase,
        address: formData,
        total: itemToPurchase.price * (itemToPurchase.quantity || 1),
        status: 'pending',
        createdAt: new Date().toISOString(),
        user: {
            id: user.uid,
            email: user.email,
        },
    };
    
    try {
        await set(ref(database, `users/${user.uid}/orders/${orderId}`), orderDetails);
        await set(ref(database, `allOrders/${orderId}`), orderDetails);

        // Send confirmation email
        await sendOrderConfirmationEmail(user.email, orderDetails);
        
        // If item was added from cart, you might want to remove it
        // This part depends on your cart logic
        // For now, we'll just clear the entire cart as an example
        if (location.state.fromCart) {
            clearCart();
        }

        toast.success('Order placed successfully!');
        navigate('/order-placed', { state: { orderId } });
    } catch (error) {
        console.error("Order submission error: ", error);
        toast.error('Failed to place order. Please try again.');
    } finally {
        setSubmitting(false);
    }
  };
  
  const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
    try {
      emailjs.init('ysnBHfSgoyz0mMUgP'); // Replace with your EmailJS user ID
      await emailjs.send('service_ldbz037', 'template_3sqwp3j', { // Replace with your Service & Template ID
        customer_email: userEmail,
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

  if (!itemToPurchase) {
      return <div>Loading...</div>; // Or some other placeholder
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
            {submitting ? 'Placing Order...' : `Pay ₹${itemToPurchase.price * (itemToPurchase.quantity || 1)}`}
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
