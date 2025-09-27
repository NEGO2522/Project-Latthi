import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, off, update } from 'firebase/database';
import { database, auth } from '../firebase/firebase';
import { FiArrowLeft, FiPackage, FiUser, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      toast.error('You must be logged in to view this page.');
      return;
    }

    const adminEmail = user.email.toLowerCase();
    const isAdmin = adminEmail.endsWith('@admin.com') || adminEmail === 'cottonfab0001@gmail.com';

    if (!isAdmin) {
      navigate('/');
      toast.error('Unauthorized access.');
      return;
    }

    const ordersRef = ref(database, 'allOrders');
    setLoading(true);

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const allOrders = Object.entries(ordersData).map(([orderId, orderData]) => ({
          ...orderData,
          id: orderId,
        }));
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(allOrders);
      } else {
        setOrders([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase read error:", error);
      toast.error("Failed to fetch orders.");
      setLoading(false);
    });

    return () => off(ordersRef, 'value', unsubscribe);

  }, [navigate]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = ref(database, `allOrders/${orderId}`);
      await update(orderRef, { status: newStatus, updatedAt: new Date().toISOString() });
      
      const order = orders.find(o => o.id === orderId);
      if (order && order.user && order.user.id) {
        const userOrderRef = ref(database, `users/${order.user.id}/orders/${orderId}`);
        await update(userOrderRef, { status: newStatus, updatedAt: new Date().toISOString() });
      }
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error.message}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                 <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </h3>
                     <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' 
                      : order.status === 'shipped' ? 'bg-blue-100 text-blue-800'
                      : order.status === 'cancelled' ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-b border-gray-200">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiUser className="mr-2" /> Customer
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.address.fullName}<br/>
                        {order.user.email}<br/>
                        {order.address.mobileNumber}
                      </dd>
                    </div>
                     <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiMapPin className="mr-2" /> Shipping Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.address.address1}, {order.address.city}, {order.address.state}, {order.address.pincode}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                       <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiDollarSign className="mr-2" /> Order Total
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formatCurrency(order.total)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-4">
                        <div className="flex items-start py-4">
                          <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                           <img src={order.item.images[0]} alt={order.item.name} className="h-full w-full object-cover"/>
                          </div>
                          <div className="ml-4 flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{order.item.name}</h5>
                            <p className="text-sm text-gray-500">Size: {Array.isArray(order.item.sizes) ? order.item.sizes.join(', ') : order.item.sizes}</p>
                            <p className="text-sm text-gray-500">Qty: {order.item.quantity || 1}</p>
                          </div>
                           <div className="ml-4 text-right">
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(order.item.price)}</p>
                          </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 sm:px-6 bg-gray-50">
                   <h4 className="text-sm font-medium text-gray-900 mb-3">Update Status</h4>
                   <div className="flex flex-wrap gap-2">
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button key={status} onClick={() => updateOrderStatus(order.id, status)} disabled={order.status === status}
                          className={`btn-sm ${order.status === status ? 'btn-primary' : 'btn-secondary'}`}>
                          {status}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
