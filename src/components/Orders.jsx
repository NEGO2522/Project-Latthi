import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database, auth } from '../firebase/firebase';
import { FiPackage } from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const ordersRef = ref(database, `users/${user.uid}/orders`);
    setLoading(true);

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const ordersData = [];
      if (snapshot.exists()) {
        snapshot.forEach((orderSnapshot) => {
          ordersData.push({ id: orderSnapshot.key, ...orderSnapshot.val() });
        });
        ordersData.sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching user orders:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleOrderClick = (orderId) => {
    navigate(`/delivery/${orderId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const getOrderItems = (order) => {
      if (order.items && Array.isArray(order.items)) return order.items;
      if (order.item) return [order.item];
      return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = getOrderItems(order);
              const orderDate = order.createdAt || order.timestamp;

              return (
                <div key={order.id} onClick={() => handleOrderClick(order.id)} className="bg-white shadow overflow-hidden sm:rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Order #{(order.dbOrderId || order.id).slice(-6).toUpperCase()}</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {orderDate ? new Date(orderDate).toLocaleString() : 'Date not available'}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' 
                        : order.status === 'shipped' ? 'bg-blue-100 text-blue-800'
                        : order.status === 'cancelled' ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>{order.status || 'pending'}</span>
                    </div>
                  </div>

                  <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Order Items</h4>
                    {items.map((item, index) => (
                      <div key={index} className="flex items-start py-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                          <img src={(item.images && item.images[0]) || item.image || 'https://via.placeholder.com/150'} alt={item.name || 'Product Image'} className="h-full w-full object-cover"/>
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    ))}
                     <div className="pt-5 text-right">
                        <p className="text-sm font-medium text-gray-900">Total: {formatCurrency(order.total)}</p>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
