import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle } from 'react-icons/fi';
import { auth } from '../firebase/firebase';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulated order data - in a real app, this would come from your backend
  useEffect(() => {
    // This is a mock implementation
    const fetchOrders = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockOrders = [
          {
            id: 'ORD-12345',
            date: '2025-08-14',
            status: 'Delivered',
            items: [
              { name: 'White Jaipuri Cotton Printed Shirt', quantity: 1, price: '₹799', image: '/assets/White Kurta.jpg' },
              { name: 'Pink Jaipuri Full Sleeve Shirt', quantity: 2, price: '₹1,598', image: '/assets/Pink-Kurta (1).jpg' }
            ],
            total: '₹2,397',
            shippingAddress: '123 Main St, City, State, 123456',
            paymentMethod: 'Razorpay',
            trackingNumber: 'TRK987654321'
          },
          {
            id: 'ORD-12344',
            date: '2025-08-10',
            status: 'Shipped',
            items: [
              { name: 'Black T-Shirt', quantity: 1, price: '₹699', image: '/assets/Black T-Shirt.jpg' }
            ],
            total: '₹699',
            shippingAddress: '123 Main St, City, State, 123456',
            paymentMethod: 'Razorpay',
            trackingNumber: 'TRK123456789'
          }
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
          >
            <FiArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="mt-2 text-gray-600">View and track your recent orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-gray-500">You haven't placed any orders yet.</p>
            <div className="mt-6">
              <Link
                to="/"
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
                      Order #{order.id}
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
                        <img
                          className="h-16 w-16 rounded object-cover mr-4"
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/80?text=Product';
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                        <p className="text-sm text-gray-900">{item.price}</p>
                        <Link
                          to={`/details/${item.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Shipped to: {order.shippingAddress}
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