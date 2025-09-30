import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiMinus, FiPlus, FiLoader } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { toast } from 'react-toastify';
import { auth } from '../firebase/firebase';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    clearCart 
  } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = () => {
    const user = auth.currentUser;
    if (!user) {
      toast.info('Please log in to proceed to checkout.');
      navigate('/login');
      return;
    }

    if (cartItems.length > 0) {
      navigate('/adress', { state: { items: cartItems, fromCart: true } });
    } else {
      toast.error('Your cart is empty.');
    }
  };

  const handleQuantityChange = (itemId, size, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, size, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
            <FiShoppingBag className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven\'t added anything to your cart yet.</p>
          <Link 
            to="/items" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Cart</h1>
            <button 
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
            >
              <span className="hidden sm:inline">Clear Cart</span>
              <FiTrash2 className="sm:hidden w-5 h-5" />
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 text-center">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md mx-auto"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex-col h-full">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900">{item.name}</h3>
                            <p className="ml-4 font-medium text-gray-900 text-base sm:text-lg">{item.price}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-md"
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 w-12 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-md"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="text-red-600 hover:text-red-800 flex items-center p-2 rounded-md hover:bg-red-50"
                          >
                            <FiTrash2 className="mr-1 w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>₹{getCartTotal().toLocaleString()}</p>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link 
                  to="/items"
                  className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`flex-1 flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                    isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Checkout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
