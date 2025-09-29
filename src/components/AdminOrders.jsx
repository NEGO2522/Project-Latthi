import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, update, get } from 'firebase/database';
import { database, auth } from '../firebase/firebase';
import { FiPackage, FiUser, FiMapPin, FiDollarSign, FiCreditCard, FiDollarSign as FiCash, FiPhone, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Handle search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
    } else {
      const searchLower = searchTerm.toLowerCase().trim();
      const filtered = orders.filter(order => {
        // Check if the order ID includes the search term (case insensitive)
        const orderIdMatch = order.id && order.id.toLowerCase().includes(searchLower);
        // Also check the display ID (last 6 characters)
        const displayId = order.id ? order.id.slice(-6).toLowerCase() : '';
        const displayIdMatch = displayId.includes(searchLower);
        return orderIdMatch || displayIdMatch;
      });
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const adminEmail = user.email.toLowerCase();
    const isAdmin = adminEmail.endsWith('@admin.com') || adminEmail === 'cottonfab0001@gmail.com';

    if (!isAdmin) {
      navigate('/');
      toast.error('Unauthorized access.');
      return;
    }

    fetchAllOrders();
  }, [navigate]);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
        const [usersSnapshot, ordersSnapshot, allOrdersSnapshot] = await Promise.all([
            get(ref(database, 'users')),
            get(ref(database, 'orders')),
            get(ref(database, 'allOrders')),
        ]);

        const userInfoMap = new Map();
        if (usersSnapshot.exists()) {
            usersSnapshot.forEach(userSnapshot => {
                const userData = userSnapshot.val();
                userInfoMap.set(userSnapshot.key, {
                    email: userData.email,
                    name: userData.name,
                    address: userData.address
                });
            });
        }

        const ordersById = new Map();

        if (allOrdersSnapshot.exists()) {
            Object.entries(allOrdersSnapshot.val()).forEach(([id, order]) => {
                ordersById.set(id, { ...order, id, sourcePath: 'allOrders' });
            });
        }

        if (ordersSnapshot.exists()) {
            Object.entries(ordersSnapshot.val()).forEach(([id, order]) => {
                const existing = ordersById.get(id) || {};
                ordersById.set(id, { ...existing, ...order, id, sourcePath: 'orders' });
            });
        }

        if (usersSnapshot.exists()) {
            usersSnapshot.forEach(userSnapshot => {
                const userId = userSnapshot.key;
                const ordersNode = userSnapshot.child('orders');
                if (ordersNode.exists()) {
                    ordersNode.forEach(orderSnapshot => {
                        const id = orderSnapshot.key;
                        const orderData = orderSnapshot.val();
                        const existing = ordersById.get(id) || {};
                        ordersById.set(id, { ...existing, ...orderData, id, userId, sourcePath: `users/${userId}/orders` });
                    });
                }
            });
        }

        ordersById.forEach((order, id) => {
            // Log the entire order object for debugging
            console.log(`Order ${id} data:`, JSON.stringify(order, null, 2));
            
            // First, try to get email from the order data itself
            // The email might be directly on the order or in the address object
            const orderEmail = order.email || (order.address && order.address.email);
            
            // Then try to get from user info if userId exists
            let userInfoEmail = null;
            if (order.userId) {
                const userInfo = userInfoMap.get(order.userId);
                if (userInfo) {
                    userInfoEmail = userInfo.email;
                    if (userInfo.address) {
                        order.address = { ...userInfo.address, ...(order.address || {}) };
                    }
                } else {
                    console.log(`No user info found for userId: ${order.userId}`);
                }
            } else {
                console.log(`No userId found for order: ${id}`);
            }
            
            // Set the email with priority to order email, then user info email
            order.userEmail = orderEmail || userInfoEmail || 'No email found';
            
            // Debug log
            console.log(`Order ${id} - Email from order: ${orderEmail}, from user info: ${userInfoEmail}, final: ${order.userEmail}`);
            
            ordersById.set(id, order);
        });

        const uniqueOrders = Array.from(ordersById.values());
        uniqueOrders.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
            const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
            return dateB - dateA;
        });

        setOrders(uniqueOrders);
        setFilteredOrders(uniqueOrders);

    } catch (error) {
        console.error("Error fetching all orders:", error);
        toast.error('Failed to fetch orders.');
    } finally {
        setLoading(false);
    }
};
  
  const updateOrderStatus = async (orderId, newStatus, sourcePath) => {
    if (!sourcePath) {
        toast.error('Cannot update order: source path is unknown. Please refresh.');
        return;
    }
    try {
      const orderRef = ref(database, `${sourcePath}/${orderId}`);
      await update(orderRef, { status: newStatus, updatedAt: new Date().toISOString() });
      toast.success(`Order status updated to ${newStatus}`);
      fetchAllOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error.message}`);
    }
  };

  const getOrderDate = (order) => {
    if (order.createdAt) return new Date(order.createdAt).toLocaleString();
    if (order.timestamp) return new Date(order.timestamp).toLocaleString();
    
    const idTimestamp = parseInt((order.id || '').split('_')[1]);
    if (!isNaN(idTimestamp)) return new Date(idTimestamp).toLocaleString();

    const dbOrderIdTimestamp = parseInt((order.dbOrderId || '').split('_')[1]);
    if (!isNaN(dbOrderIdTimestamp)) return new Date(dbOrderIdTimestamp).toLocaleString();

    return 'No date';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };
  
  const getOrderItems = (order) => {
      if (order.items && Array.isArray(order.items)) return order.items;
      if (order.item) return [order.item];
      return [];
  }
  
  const getFormattedAddress = (order) => {
    const source = (order.address && typeof order.address === 'object') ? order.address : order;
    return [source.address1, source.address2, source.city, source.state, source.pincode].filter(Boolean).join(', ');
  };

  const getCustomerDetail = (order, key) => {
    const source = (order.address && typeof order.address === 'object') ? order.address : order;
    return source[key] || order[key] || order.userName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {searchTerm ? 'No matching orders found' : 'No orders found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try a different search term' 
                : 'There are no orders from any user.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const items = getOrderItems(order);
              const orderIdDisplay = (order.id || 'N/A').slice(-6).toUpperCase();
              const fullAddress = getFormattedAddress(order);
              
              // Log order information
              console.log(`Order ${orderIdDisplay} - User Email:`, order.userEmail);
              if (!order.userEmail) {
                console.log(`No user email found for order: ${orderIdDisplay}`);
              }

              return (
                <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Order #{orderIdDisplay}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Customer: {order.userEmail || 'No email available'}
                        </p>
                        {order.userId && (
                          <p className="text-xs text-gray-400 mt-1">
                            User ID: {order.userId}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' 
                          : order.status === 'shipped' ? 'bg-blue-100 text-blue-800'
                          : order.status === 'cancelled' ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                <div className="border-b border-gray-200">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 flex items-center"><FiUser className="mr-2" /> Customer</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-1">
                        <div className="font-medium">{getCustomerDetail(order, 'fullName') || 'N/A'}</div>
                        
                        <div className="text-gray-600 flex items-center">
                          <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {order.userEmail || 'N/A'}
                        </div>
                        
                        <div className="text-gray-600 flex items-center">
                          <FiPhone className="h-4 w-4 mr-1.5 text-gray-400" />
                          {order.phone || getCustomerDetail(order, 'phone') || getCustomerDetail(order, 'mobileNumber') || 'N/A'}
                        </div>
                        
                        <div className="pt-1">
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                            User ID: {order.userId || 'N/A'}
                          </span>
                        </div>
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        {order.paymentMethod === 'Cash on Delivery' ? (
                          <FiCash className="mr-2" />
                        ) : (
                          <FiCreditCard className="mr-2" />
                        )}
                        Payment Method
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.paymentMethod || 'Not specified'}
                        </span>
                        {order.paymentId && (
                          <div className="mt-1 text-xs text-gray-500">
                            Payment ID: {order.paymentId}
                          </div>
                        )}
                      </dd>
                    </div>
                     <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 flex items-center"><FiMapPin className="mr-2" /> Shipping Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {fullAddress || 'No address provided'}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                       <dt className="text-sm font-medium text-gray-900 flex items-center"><FiDollarSign className="mr-2" /> Order Total</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(order.total)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Order Items</h4>
                    {items.length > 0 ? items.map((item, index) => (
                      <div key={index} className="flex items-start py-4 border-b border-gray-100">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                         <img src={item.images && item.images[0] ? item.images[0] : (item.image || 'https://via.placeholder.com/150')} alt={item.name || 'Product Image'} className="h-full w-full object-cover"/>
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{item.name || 'N/A'}</h5>
                          <p className="text-sm text-gray-500">Size: {Array.isArray(item.sizes) ? item.sizes.join(', ') : (item.sizes || 'N/A')}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                         <div className="ml-4 text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    )) : <p className='text-sm text-gray-500'>No items found for this order.</p>}
                </div>

                <div className="px-4 py-4 sm:px-6 bg-gray-50">
                   <h4 className="text-sm font-medium text-gray-900 mb-3">Update Status</h4>
                   <div className="flex flex-wrap gap-2">
                      {['processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button key={status} onClick={() => updateOrderStatus(order.id, status, order.sourcePath)} disabled={order.status === status}
                          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            order.status === status 
                            ? 'bg-indigo-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}`}>
                            {status}
                        </button>
                      ))}
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

export default AdminOrders;
