import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { database, auth } from '../firebase/firebase';
import { FiPackage, FiTruck, FiCheckCircle, FiDollarSign, FiArrowRight, FiClock, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Delivery = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);
  const [refundReason, setRefundReason] = useState('');
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

    const userOrderRef = ref(database, `users/${user.uid}/orders/${orderId}`);
    const allOrdersRef = ref(database, `allOrders/${orderId}`);
    setLoading(true);

    const handleOrderUpdate = (snapshot, source) => {
      if (snapshot.exists()) {
        const orderData = { id: snapshot.key, ...snapshot.val() };

        setOrder(prevOrder => {
          // Show a toast when refund status changes
          if (source === 'allOrders' &&
              orderData.refundRequest?.status &&
              prevOrder?.refundRequest?.status !== orderData.refundRequest.status) {
            toast.info(`Refund status updated: ${orderData.refundRequest.status}`, {
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true
            });
          }

          return {
            ...prevOrder,
            ...orderData,
            // Preserve existing refundRequest if not present in the update
            refundRequest: orderData.refundRequest || (prevOrder?.refundRequest || null)
          };
        });

      } else if (source === 'userOrder') {
        // Only show not found if it's the user's order that's missing
        toast.error('Order not found.');
        setOrder(null);
      }
      setLoading(false);
    };

    const handleError = (error) => {
      console.error("Error fetching order details:", error);
      toast.error(`Failed to fetch order details: ${error.message}`);
      setLoading(false);
    };

    const unsubscribeUserOrder = onValue(userOrderRef, 
      (snapshot) => handleOrderUpdate(snapshot, 'userOrder'),
      handleError
    );

    const unsubscribeAllOrders = onValue(allOrdersRef, 
      (snapshot) => handleOrderUpdate(snapshot, 'allOrders'),
      handleError
    );

    return () => {
      unsubscribeUserOrder();
      unsubscribeAllOrders();
    };
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

  const handleRefundRequest = async () => {
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund request');
      return;
    }

    setIsRequestingRefund(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in to request a refund');
        return;
      }

      const updates = {};
      updates[`users/${user.uid}/orders/${orderId}/refundRequest`] = {
        requestedAt: new Date().toISOString(),
        reason: refundReason,
        status: 'pending',
        orderId: orderId,
        amount: order.total || 0
      };

      updates[`allOrders/${orderId}/refundRequest`] = {
        requestedAt: new Date().toISOString(),
        reason: refundReason,
        status: 'pending',
        userId: user.uid,
        amount: order.total || 0
      };

      await update(ref(database), updates);
      
      setOrder(prev => ({
        ...prev,
        refundRequest: {
          requestedAt: new Date().toISOString(),
          reason: refundReason,
          status: 'pending'
        }
      }));
      
      toast.success('Refund request submitted successfully');
      setRefundReason('');
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast.error('Failed to submit refund request. Please try again.');
    } finally {
      setIsRequestingRefund(false);
    }
  };

  const canRequestRefund = () => {
    if (!order) return false;
    
    if (order.refundRequest) return false;
    
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const daysSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
    return (order.status === 'delivered' || order.status === 'cancelled') && daysSinceOrder <= 30;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Order Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested order could not be located.</p>
          <button 
            onClick={() => navigate('/orders')} 
            className="mt-6 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Tracking</h1>
            <p className="text-gray-600">Order #{(order.dbOrderId || order.id).slice(-6).toUpperCase()}</p>
            
            {order.refundRequest && (
              <div className="mt-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Refund Status</h3>
                <div className={`p-4 rounded-lg ${
                  order.refundRequest.status === 'approved' 
                    ? 'bg-green-50 border-l-4 border-green-500' 
                    : order.refundRequest.status === 'rejected'
                    ? 'bg-red-50 border-l-4 border-red-500'
                    : 'bg-yellow-50 border-l-4 border-yellow-500'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {order.refundRequest.status === 'approved' ? (
                        <FiCheckCircle className="h-6 w-6 text-green-500" />
                      ) : order.refundRequest.status === 'rejected' ? (
                        <FiX className="h-6 w-6 text-red-500" />
                      ) : (
                        <FiClock className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Refund {order.refundRequest.status}
                        {order.refundRequest.updatedAt && (
                          <span className="text-xs text-gray-500 ml-2">
                            (Updated: {new Date(order.refundRequest.updatedAt).toLocaleDateString()})
                          </span>
                        )}
                      </h4>
                      <div className="mt-1 text-sm text-gray-600">
                        {order.refundRequest.status === 'approved' ? (
                          <p>Your refund of ₹{order.refundRequest.amount || order.total || '0'} has been approved and will be processed shortly.</p>
                        ) : order.refundRequest.status === 'rejected' ? (
                          <p>Your refund request has been rejected. {order.refundRequest.adminNote || 'Please contact support for more details.'}</p>
                        ) : (
                          <p>Your refund request is being reviewed. We'll notify you once a decision is made.</p>
                        )}
                      </div>
                      {order.refundRequest.reason && (
                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs font-medium text-gray-500">Your reason:</p>
                          <p className="text-sm text-gray-700">{order.refundRequest.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>

            <div className="space-y-8">
              <div className="flex items-center">
                <div className={`z-10 flex items-center justify-center h-8 w-8 rounded-full ${statusStep >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <FiPackage className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-semibold ${statusStep >= 1 ? 'text-indigo-600' : 'text-gray-600'}`}>Processing</h3>
                  <p className="text-sm text-gray-500">Your order is being processed.</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className={`z-10 flex items-center justify-center h-8 w-8 rounded-full ${statusStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <FiTruck className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-semibold ${statusStep >= 2 ? 'text-indigo-600' : 'text-gray-600'}`}>Shipped</h3>
                  <p className="text-sm text-gray-500">Your order is on its way.</p>
                </div>
              </div>

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
          
          {canRequestRefund() && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => document.getElementById('refundModal').classList.remove('hidden')}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="mr-2">₹</span>
                Request Refund
              </button>
            </div>
          )}
        </div>
      </div>

      <div id="refundModal" className="fixed inset-0 z-50 hidden overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4 text-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => document.getElementById('refundModal').classList.add('hidden')}></div>
          
          <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Refund</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for your refund request:</p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-6"
              placeholder="Enter reason for refund..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={4}
            ></textarea>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => document.getElementById('refundModal').classList.add('hidden')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleRefundRequest();
                  document.getElementById('refundModal').classList.add('hidden');
                }}
                disabled={isRequestingRefund}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isRequestingRefund ? 'Submitting...' : 'Submit Request'}
                {!isRequestingRefund && <FiArrowRight className="ml-2" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mt-8 p-6 bg-indigo-50 rounded-lg border border-indigo-100 md:max-w-2xl">
        <div className="flex items-start">
          <FiClock className="text-indigo-600 mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delivery Information</h3>
            <p className="text-gray-700">
              Your order will be delivered within 7 working days from the date of order confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
