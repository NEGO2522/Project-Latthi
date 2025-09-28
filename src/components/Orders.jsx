import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle } from 'react-icons/fi';
import { auth, database, ref, onValue, query, orderByChild, equalTo } from '../firebase/firebase';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's orders from Realtime Database
  useEffect(() => {
    const fetchOrders = () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const ordersRef = ref(database, 'orders');
        const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(user.uid));

        
        // Set up a realtime listener for the user's orders
        const unsubscribe = onValue(userOrdersQuery, (snapshot) => {
          const ordersData = [];
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const orderData = childSnapshot.val();
              ordersData.push({
                id: childSnapshot.key,
                ...orderData,
                // Convert timestamp to Date object
                date: orderData.timestamp ? new Date(orderData.timestamp) : new Date(),
                // Ensure items is always an array
                items: Array.isArray(orderData.items) ? orderData.items : [],
                // Format total if it's an object with a 'total' property
                total: typeof orderData.total === 'object' && orderData.total !== null
                  ? `₹${orderData.total.total.toLocaleString()}`
                  : typeof orderData.total === 'number'
                    ? `₹${orderData.total.toLocaleString()}`
                    : orderData.total || '₹0',
                // Map Realtime Database fields to match the component's expectations
                status: orderData.status || 'processing',
                paymentMethod: orderData.paymentMethod || 'Cash on Delivery'
              });
            });
          }
          
          // Sort by timestamp (newest first)
          ordersData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setOrders(ordersData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching orders:', error);
          setLoading(false);
        });

        return () => {
          // Unsubscribe from the realtime listener when component unmounts
          unsubscribe();
        };
      } catch (error) {
        console.error('Error in fetchOrders:', error);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchOrders();
      } else {
        setOrders([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'shipped':
        return <FiTruck className="text-blue-500" />;
      case 'processing':
        return <FiClock className="text-yellow-500" />;
      case 'cancelled':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  const getOrderTitle = (order) => {
    if (order.items && order.items.length > 0) {
      const firstItemName = order.items[0].name;
      const additionalItemsCount = order.items.length - 1;

      if (additionalItemsCount > 0) {
        return `${firstItemName} and ${additionalItemsCount} more`;
      }
      return firstItemName;
    }
    return `Order #${order.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If user is not logged in
  if (!auth.currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Please sign in to view your orders</h3>
          <div className="mt-4">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-gray-500">You haven't placed any orders yet.</p>
            <div className="mt-6">
              <Link
                to="/items"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {getOrderTitle(order)}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Placed on {new Date(order.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">{getStatusIcon(order.status)}</span>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="border-b border-gray-200">
                  {order.items.map((item, index) => (
                    <div key={index} className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center">
                      <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center mr-4">
                        <FiPackage className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                      <div className="mt-2 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                        <p className="text-sm text-gray-900">{item.price}</p>
                        {item.id && (
                          <Link
                            to={`/details/${item.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View Product
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Shipped to: {order.address?.fullName && (
                        <span>{order.address.fullName}, </span>
                      )}
                      {order.address?.address1 && (
                        <span>{order.address.address1}, </span>
                      )}
                      {order.address?.city && (
                        <span>{order.address.city}, </span>
                      )}
                      {order.address?.state && (
                        <span>{order.address.state} - {order.address.pincode}</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Payment method: {order.paymentMethod}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-sm text-gray-500">
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">{order.total}</p>
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

export default Orders;
