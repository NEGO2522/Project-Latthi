import { Link } from 'react-router-dom';
import { FiShoppingBag, FiArrowLeft, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    clearCart 
  } = useCart();

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
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FiArrowLeft className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
            <button 
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear Cart
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                            <p className="ml-4 font-medium text-gray-900">{item.price}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-1 w-12 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="text-red-600 hover:text-red-800 flex items-center"
                          >
                            <FiTrash2 className="mr-1" />
                            <span className="text-sm">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-6">
                <p>Subtotal</p>
                <p>₹{getCartTotal().toLocaleString()}</p>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/categories"
                  className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiArrowLeft className="mr-2" />
                  Continue Shopping
                </Link>
                <button
                  className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Checkout
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