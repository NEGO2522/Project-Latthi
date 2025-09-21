import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiShoppingCart, FiPackage, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';

const Navbar = ({ user, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isDesktopCategoryOpen, setIsDesktopCategoryOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { getCartCount } = useCart();

  const handleSignIn = () => {
    navigate('/login', { state: { from: window.location.pathname } });
  };
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const categories = [
    { name: 'One piece', value: 'one-piece' },
    { name: 'Two piece', value: 'two-piece' },
    { name: 'Three piece', value: 'three-piece' },
    { name: 'Short Kurti', value: 'short-kurti' },
  ];

  const handleCategorySelect = (category) => {
      navigate(`/items?category=${category}`);
      setIsMenuOpen(false);
      setIsDesktopCategoryOpen(false);
  };

  return (
    <>
      <header className="border-b border-gray-100 sticky top-[36px] bg-white z-50">
        <div className="container mx-auto px-3 sm:px-4 py-1 sm:py-2">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.1
              }}
              className="flex items-center space-x-8"
            >
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/assets/Logo.png" 
                  alt="Lathi Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 tracking-wide" style={{ fontFamily: "'Great Vibes', cursive" }}>
                  LATHI
                </h1>
              </Link>
              <div className="hidden md:flex items-center">
                <div className="relative">
                    <button
                        onClick={() => setIsDesktopCategoryOpen(!isDesktopCategoryOpen)}
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <span>Categories</span>
                        <FiChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDesktopCategoryOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {isDesktopCategoryOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute mt-2 w-48 bg-white rounded-md shadow-lg z-20"
                            >
                                <div className="py-1">
                                    {categories.map(category => (
                                        <button
                                            key={category.value}
                                            onClick={() => handleCategorySelect(category.value)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            </motion.div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center space-x-4">
                    <Link 
                      to="/orders" 
                      className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 flex items-center"
                    >
                      <FiPackage className="w-5 h-5 mr-1" />
                      <span className="text-sm font-medium">Orders</span>
                    </Link>
                    <Link to="/cart">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 relative"
                      >
                        <FiShoppingCart className="w-6 h-6" />
                        {getCartCount() > 0 && (
                          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {getCartCount()}
                          </span>
                        )}
                      </motion.button>
                    </Link>
                    
                    <motion.button
                      onClick={handleSignOut}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      <FiUser className="w-5 h-5" />
                      <span>Sign Out</span>
                    </motion.button>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors duration-200"
                      >
                        Admin Panel
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.button
                    onClick={handleSignIn}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-sm font-medium text-gray-800 border border-indigo-600 rounded-full hover:bg-indigo-50 transition-colors duration-200"
                  >
                    Sign In
                  </motion.button>
                </motion.div>
              )}
            </div>
             <div className="md:hidden flex items-center">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                    {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg py-2 px-4 absolute w-full z-40"
            ref={menuRef}
          >
            <nav className="flex flex-col space-y-4 py-4">
              {user ? (
                <>
                  <button 
                    className="text-left px-4 py-2 w-full text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setShowCategories(!showCategories)}
                  >
                    <div className="flex items-center justify-between">
                      <span>Categories</span>
                      <svg className={`w-4 h-4 transform transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {showCategories && (
                    <div className="pl-6 space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => handleCategorySelect(category.value)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <Link 
                    to="/account" 
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUser className="w-5 h-5 mr-2" />
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link 
                    to="/orders" 
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiPackage className="w-5 h-5 mr-2" />
                    Your Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 text-left text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                  <a href="#" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    New Arrivals
                  </a>
                  <a href="#" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    Best Sellers
                  </a>
                  <a href="#" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    Sale
                  </a>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
