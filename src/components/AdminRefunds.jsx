import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheck, FiX, FiUser, FiPackage, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminRefunds = () => {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refundsRef = ref(database, 'allOrders');
    
    const unsubscribe = onValue(refundsRef, (snapshot) => {
      const data = snapshot.val();
      const refundsList = [];
      
      if (data) {
        Object.entries(data).forEach(([orderId, order]) => {
          if (order.refundRequest) {
            refundsList.push({
              id: orderId,
              customerName: order.shippingInfo?.name || '',
              ...order.refundRequest,
              orderDetails: {
                total: order.total,
                items: order.items || [],
                status: order.status,
                createdAt: order.createdAt,
                paymentMethod: order.paymentMethod || 'Unknown',
                shippingAddress: order.shippingInfo?.address || 'No address provided'
              },
              userId: order.userId || '',
              orderDate: order.createdAt || new Date().toISOString()
            });
          }
        });
      }
      
      // Sort by request date (newest first)
      refundsList.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
      setRefunds(refundsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching refunds:", error);
      toast.error('Failed to load refund requests');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (refundId, newStatus) => {
    try {
      // Get the refund data first
      const refund = refunds.find(r => r.id === refundId);
      if (!refund) {
        throw new Error('Refund request not found');
      }

      // Get current timestamp for the update
      const timestamp = new Date().toISOString();
      
      // Create an update object to update the status
      const updates = {};
      
      // Update in allOrders
      updates[`allOrders/${refundId}/refundRequest/status`] = newStatus;
      updates[`allOrders/${refundId}/refundRequest/updatedAt`] = timestamp;
      
      // Update in user's orders if userId is available
      if (refund.userId) {
        const userOrderPath = `users/${refund.userId}/orders/${refundId}`;
        updates[`${userOrderPath}/refundRequest/status`] = newStatus;
        updates[`${userOrderPath}/refundRequest/updatedAt`] = timestamp;
        
        // Add a notification for the user
        const notificationId = `notification_${Date.now()}`;
        updates[`users/${refund.userId}/notifications/${notificationId}`] = {
          type: 'refund_update',
          orderId: refundId,
          status: newStatus,
          message: `Your refund request has been ${newStatus}`,
          read: false,
          createdAt: timestamp
        };
      }
      
      // Perform the update
      await update(ref(database), updates);
      
      // Update local state to reflect the change
      setRefunds(prevRefunds => 
        prevRefunds.map(r => 
          r.id === refundId 
            ? { 
                ...r, 
                status: newStatus,
                updatedAt: timestamp 
              } 
            : r
        )
      );
      
      toast.success(`Refund request ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating refund status:', error);
      toast.error('Failed to update refund status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Refund Requests</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all refund requests including order details and current status.
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 w-1/6">
                        Order ID
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-2/6">
                        Reason
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/6">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/6">
                        Requested
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/6">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-1/6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {refunds.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-3 py-4 text-sm text-center text-gray-500">
                          No refund requests found.
                        </td>
                      </tr>
                    ) : (
                      refunds.map((refund) => (
                        <tr key={refund.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex items-center">
                              <FiPackage className="mr-2 h-5 w-5 text-gray-400" />
                              {refund.id.slice(-6).toUpperCase()}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="font-medium text-gray-900">
                              {refund.customerName && refund.customerName !== 'Unknown Customer' ? refund.customerName : 'Customer'}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {refund.userId ? `User ID: ${refund.userId.slice(0, 8)}...` : ''}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 break-words max-w-xs">
                            <div className="whitespace-normal">{refund.reason}</div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaRupeeSign className="mr-1 h-3 w-3 text-gray-400" />
                              {refund.amount || refund.orderDetails?.total || '0.00'}
                              <span className="ml-1 text-xs text-gray-500">
                                ({refund.orderDetails?.paymentMethod || 'N/A'})
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              {refund.orderId ? `Order #${refund.orderId.slice(-6).toUpperCase()}` : ''}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                            <div className="flex items-center">
                              <FiCalendar className="mr-1 h-4 w-4 text-gray-400" />
                              {formatDate(refund.requestedAt)}
                            </div>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            {refund.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusUpdate(refund.id, 'approved')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approve Refund"
                                >
                                  <FiCheck className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(refund.id, 'rejected')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject Refund"
                                >
                                  <FiX className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                refund.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {refund.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRefunds;
