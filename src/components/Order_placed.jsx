import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';
import { handleImageError } from '../utils/imageUtils';

const OrderPlaced = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const orderId = useMemo(() => {
    if (state?.orderId) return state.orderId;
    // fallback: simple readable id
    const ts = Date.now().toString().slice(-6);
    return `LTH${ts}`;
  }, [state]);

  const item = state?.item;
  const total = state?.total;

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <FiCheckCircle className="w-9 h-9" />
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">Order Placed Successfully</h1>
          <p className="mt-2 text-gray-600">Thank you for shopping with Lathi. Your order is on its way!</p>

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-gray-600">Order ID</div>
              <div className="font-semibold text-gray-900">{orderId}</div>
            </div>
            {item && (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={item.images?.[0] || item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                  onError={(e) => handleImageError(e, item.name || 'Item')}
                />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-600">Size: {item.size} • Qty: {item.quantity}</p>
                </div>
                {typeof total === 'number' && (
                  <div className="ml-auto font-semibold text-gray-900 whitespace-nowrap">₹{total}</div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/orders')}
              className="inline-flex items-center justify-center w-full px-5 py-3 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
            >
              <FiPackage className="mr-2" /> View Orders
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/items')}
              className="inline-flex items-center justify-center w-full px-5 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <FiHome className="mr-2" /> Continue Shopping
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderPlaced;

