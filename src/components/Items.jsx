import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiHome, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useState, useEffect } from 'react';

const Items = () => {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth >= 640) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleCheckout = (itemId) => {
    navigate(`/details/${itemId}`);
  };
  
  const items = [
    { 
      id: 1, 
      name: 'White Kurta', 
      image: '/assets/White Kurta.jpg', 
      price: '₹799',
      description: 'Elegant white kurta with intricate embroidery',
      sizes: ['S', 'M', 'L', 'XL'],
      inStock: true
    },
    { 
      id: 2, 
      name: 'White Shirt', 
      image: '/assets/White-Shirt (3).jpg', 
      price: '₹699',
      description: 'Classic blue kurta with minimal design',
      sizes: ['S', 'M', 'L', 'XL'],
      inStock: true
    },
    { 
      id: 3, 
      name: 'Pink Shirt', 
      image: '/assets/Pink-Kurta (3).jpg', 
      price: '₹799',
      description: 'Sleek black kurta with golden accents',
      sizes: ['M', 'L', 'XL'],
      inStock: true
    },
    { 
      id: 4, 
      name: 'Black T-Shirt', 
      image: '/assets/Black T-Shirt.jpg', 
      price: '₹699',
      description: 'Light beige kurta with subtle patterns',
      sizes: ['S', 'M', 'L', 'XL'],
      inStock: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-4"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-800">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <nav className="space-y-4">
              <Link
                to="/"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiHome className="w-5 h-5 mr-3" />
                <span>Home</span>
              </Link>
              <Link
                to="/cart"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiShoppingCart className="w-5 h-5 mr-3" />
                <span>Cart</span>
                {getCartCount() > 0 && (
                  <span className="ml-auto bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with responsive navigation */}
          <header className="flex justify-between items-center mb-6 sm:mb-8 relative px-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <FiMenu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                title="Back to Home"
              >
                <FiHome className="w-5 h-5 mr-1" />
                <span>Home</span>
              </Link>
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mx-auto"
            >
              <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900">
                Our Collection
              </h1>
              <p className="mt-1 sm:mt-2 max-w-2xl mx-auto text-xs sm:text-base text-gray-500">
                Handcrafted with premium fabric and intricate detailing
              </p>
            </motion.div>

            {/* Cart Icon - Hidden on mobile, shown on sm and up */}
            <div className="hidden sm:flex items-center">
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                title="View Cart"
              >
                <FiShoppingCart className="w-6 h-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </div>
          </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-4">
          {items.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white rounded-lg overflow-hidden shadow-sm sm:shadow-md hover:shadow-lg transition-shadow duration-200 h-full flex flex-col"
            >
              <div className="h-40 sm:h-52 w-full overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/300x400?text=${item.name.split(' ').join('+')}`;
                  }}
                />
              </div>
              <div className="p-3 sm:p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h2>
                    <p className="mt-0.5 text-base font-medium text-indigo-600">{item.price}</p>
                  </div>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.inStock ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
                
                <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                
                <div className="mt-2 sm:mt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.sizes.map((size) => (
                      <button 
                        key={size}
                        type="button"
                        className="w-8 h-8 text-xs flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleCheckout(item.id)}
                    type="button"
                    className="w-full bg-indigo-600 border border-transparent rounded-md py-2 px-3 text-xs sm:text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    Check it out
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Items;