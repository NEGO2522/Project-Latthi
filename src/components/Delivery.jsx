import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database, auth } from '../firebase/firebase';
import { FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Delivery = () => {
  const { orderId } = useParams(); // <-- THIS IS THE FIX: Reads orderId from URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      toast.error('No order ID provided.');
      setLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    // Path to the user's specific order
    const orderRef = ref(database, `users/${user.uid}/orders/${orderId}`);
    setLoading(true);

    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        setOrder({ id: snapshot.key, ...snapshot.val() });
      } else {
        toast.error('Order not found.');
        setOrder(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching order details:", error);
      toast.error(`Failed to fetch order details: ${error.message}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId, navigate]);

  const getStatusStep = (status) => {
    switch (status) {
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const statusStep = getStatusStep(order?.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4">Loading tracking details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Order Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">The requested order could not be located.</p>
            <button onClick={() => navigate('/orders')} className="mt-6 bg-indigo-600 text-white py-2 px-4 rounded-md">Back to Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-600 mb-6">Order #{(order.dbOrderId || order.id).slice(-6).toUpperCase()}</p>

          {statusStep === -1 ? (
             <div className="text-center p-6 bg-red-50 rounded-lg">
                 <FiCheckCircle className="mx-auto h-12 w-12 text-red-500"/>
                 <h2 className="text-xl font-semibold text-red-800 mt-4">Order Cancelled</h2>
             </div>
          ) : (
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>

              {/* Steps */}
              <div className="flex flex-col space-y-8">
                  {/* Step 1: Processing */}
                  <div className="flex items-center">
                      <div className={`z-10 flex items-center justify-center h-8 w-8 rounded-full ${statusStep >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                          <FiPackage className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                          <h3 className={`font-semibold ${statusStep >= 1 ? 'text-indigo-600' : 'text-gray-600'}`}>Processing</h3>
                          <p className="text-sm text-gray-500">Your order is being processed.</p>
                      </div>
                  </div>

                  {/* Step 2: Shipped */}
                  <div className="flex items-center">
                      <div className={`z-10 flex items-center justify-center h-8 w-8 rounded-full ${statusStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                          <FiTruck className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                          <h3 className={`font-semibold ${statusStep >= 2 ? 'text-indigo-600' : 'text-gray-600'}`}>Shipped</h3>
                          <p className="text-sm text-gray-500">Your order is on its way.</p>
                      </div>
                  </div>

                  {/* Step 3: Delivered */}
                  <div className="flex items-center">
                      <div className={`z-10 flex items-center justify-center h-8 w-8 rounded-full ${statusStep >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}>
                          <FiCheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                          <h3 className={`font-semibold ${statusStep >= 3 ? 'text-green-600' : 'text-gray-600'}`}>Delivered</h3>
                          <p className="text-sm text-gray-500">Your order has been delivered.</p>
                      </div>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Delivery;
