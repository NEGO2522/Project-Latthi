import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, off, update } from 'firebase/database';
import { database, auth } from '../firebase/firebase';
import { FiArrowLeft, FiPackage, FiTruck, FiUser, FiMapPin, FiPhone, FiMail, FiDollarSign, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all orders from all users
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        
        // Check if user is admin
        const user = auth.currentUser;
        const adminEmail = user?.email?.toLowerCase();
        const isAdminUser = adminEmail?.endsWith('@admin.com') || adminEmail === 'cottonfab0001@gmail.com';
        
        if (!user || !isAdminUser) {
          navigate('/');
          toast.error('Unauthorized access');
          return;
        }

        const ordersRef = ref(database, 'users');
        
        const unsubscribe = onValue(ordersRef, (snapshot) => {
          const allOrders = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((userSnapshot) => {
              const userId = userSnapshot.key;
              const userData = userSnapshot.val();
              
              // Check if user has addresses with orders
              if (userData.addresses) {
                Object.entries(userData.addresses).forEach(([addressId, addressData]) => {
                  if (addressData.items && Array.isArray(addressData.items) && addressData.items.length > 0) {
                    // Get user details from the user's data
                    const userEmail = userData.email || 'No email';
                    const userDisplayName = userData.displayName || userData.name || 'Customer';
                    const userPhone = addressData.phone || userData.phoneNumber || 'No phone';
                    
                    allOrders.push({
                      id: addressId,
                      userId: userId,
                      userEmail: userEmail,
                      userName: addressData.name || userDisplayName, // Use shipping name if available, otherwise use user's display name
                      userPhone: userPhone,
                      userData: { // Store additional user data
                        displayName: userDisplayName,
                        email: userEmail,
                        phoneNumber: userPhone
                      },
                      address: addressData,
                      items: addressData.items || [],
                      total: addressData.total || 0,
                      status: addressData.status || 'pending',
                      paymentMethod: addressData.paymentMethod || 'Cash on Delivery',
                      timestamp: addressData.timestamp || Date.now(),
                      date: addressData.timestamp ? new Date(addressData.timestamp) : new Date(),
                      // Add more metadata if needed
                      metadata: {
                        ...(addressData.metadata || {}),
                        createdAt: addressData.createdAt || new Date().toISOString()
                      }
                    });
                  }
                });
              }
            });
          }
          
          // Sort by timestamp (newest first)
          allOrders.sort((a, b) => b.timestamp - a.timestamp);
          setOrders(allOrders);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching orders:', error);
          toast.error('Failed to load orders');
          setLoading(false);
        });

        return () => off(ordersRef, 'value', unsubscribe);
      } catch (error) {
        console.error('Error in fetchAllOrders:', error);
        toast.error('An error occurred while loading orders');
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [navigate]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Find the order to get the user ID
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        toast.error('Order not found');
        return;
      }

      // Create a reference to the order in the database
      const orderRef = ref(database, `users/${order.userId}/addresses/${orderId}`);
      
      // Update status in Firebase with a timestamp
      const updates = {
        status: newStatus,
        updatedAt: Date.now()
      };

      // If order is delivered or cancelled, add a timestamp for that specific status
      if (newStatus === 'delivered') {
        updates.deliveredAt = Date.now();
      } else if (newStatus === 'cancelled') {
        updates.cancelledAt = Date.now();
      }

      await update(orderRef, updates);
      
      // Update local state
      setOrders(orders.map(o => 
        o.id === orderId 
          ? { 
              ...o, 
              status: newStatus,
              updatedAt: Date.now(),
              ...(newStatus === 'delivered' && { deliveredAt: Date.now() }),
              ...(newStatus === 'cancelled' && { cancelledAt: Date.now() })
            } 
          : o
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error.message}`);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
          <p className="mt-2 text-gray-600">View and manage customer orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-gray-500">There are no orders to display.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        Placed on {order.date.toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <FiDollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" />
                        {formatCurrency(order.total)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="border-b border-gray-200">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiUser className="mr-2 h-5 w-5 text-gray-400" />
                        Customer
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="font-medium">{order.userName || 'Customer'}</div>
                        {order.userEmail && (
                          <div className="text-gray-600 flex items-center mt-1">
                            <FiMail className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{order.userEmail}</span>
                          </div>
                        )}
                        {order.userPhone && (
                          <div className="text-gray-600 flex items-center mt-1">
                            <FiPhone className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span>{order.userPhone}</span>
                          </div>
                        )}
                        {order.userId && (
                          <div className="text-xs text-gray-400 mt-1">
                            User ID: <span className="font-mono">{order.userId.substring(0, 8)}...</span>
                          </div>
                        )}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 flex items-start">
                        <FiMapPin className="mr-2 h-5 w-5 text-gray-400 mt-0.5" />
                        Shipping Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div>{order.address.name}</div>
                        <div>{order.address.addressLine1}</div>
                        {order.address.addressLine2 && <div>{order.address.addressLine2}</div>}
                        <div>{order.address.city}, {order.address.state} {order.address.postalCode}</div>
                        <div className="mt-1 text-gray-500">{order.address.phone}</div>
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Payment Method
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.paymentMethod}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="px-4 py-5 sm:p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Order Items</h4>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-start py-4 border-b border-gray-100 last:border-0">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={
                              // Handle different possible image formats and paths
                              item.images?.[0]?.startsWith('http') 
                                ? item.images[0] 
                                : item.images?.[0]?.startsWith('/') 
                                  ? item.images[0] 
                                  : item.image?.startsWith('http') 
                                    ? item.image 
                                    : item.image?.startsWith('/') 
                                      ? item.image 
                                      : item.images?.[0] 
                                        ? `/${item.images[0]}` 
                                        : item.image 
                                          ? `/${item.image}` 
                                          : '/placeholder.svg'
                            }
                            alt={item.name || 'Product image'}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-500">Size: {item.size || 'One Size'}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.price * (item.quantity || 1))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="text-sm text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} in total
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <div className="text-base font-medium text-gray-900">
                        Total: {formatCurrency(order.total)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Update Order Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateOrderStatus(order.id, status)}
                          className={`inline-flex items-center px-3 py-1.5 border rounded-md text-xs font-medium ${
                            order.status === status
                              ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
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
