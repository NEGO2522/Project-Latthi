import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiShoppingCart, FiPackage, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';

// Image Carousel Component
const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Replace these with your actual image paths
  const images = [
    '/assets/t-shir.jpg',
    '/assets/shirts.avif',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          }}
          exit={{ 
            opacity: 0, 
            scale: 1.1,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={images[currentIndex]} 
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-white w-6' : 'bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};



const Home = ({ user }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTagline(true);
      
      // Loop the animation every 8 seconds (longer duration for better UX)
      const interval = setInterval(() => {
        setShowTagline(false);
        // Slightly longer delay before showing again for smoother transition
        setTimeout(() => setShowTagline(true), 800);
      }, 8000);
      
      return () => clearInterval(interval);
    }, 1500); // Reduced initial delay for faster first appearance
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Tagline */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-50 py-2 shadow-sm">
        <p className="text-center text-sm font-medium text-gray-700">
          Lathi – Beat the Boring, Wear the Bold
        </p>
      </div>
      
      {/* Main content with padding for fixed header */}
      <div className="pt-12">

      {/* Top Bar */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button - Removed as per request */}

            {/* Brand Name - Center on mobile, left on larger screens */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.1
              }}
              className="flex items-center justify-center md:justify-start w-full md:w-auto"
            >
              <div className="flex items-center space-x-2">
                <img 
                  src="/assets/Logo.png" 
                  alt="Lathi Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 tracking-wide">
                  LATHI
                </h1>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Cart Button */}
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
          </div>

          {/* Mobile Announcement */}
          <motion.div 
            className="md:hidden mt-3 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.3, 
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
              y: { stiffness: 1000, velocity: -100 }
            }}
          >
            <div className="flex items-center justify-center space-x-2">
              <button className="text-gray-500">
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-xs font-medium text-gray-700">
                Free shipping on orders over $50
              </p>
              <button className="text-gray-500">
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Mobile Menu */}
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

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Left Column - Image */}
          <div className="h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-xl md:rounded-2xl shadow-lg md:shadow-xl">
            <Carousel />
          </div>
          
          {/* Right Column - Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Elevate Your Style with <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">Lathi</span>
            </h2>
            
            <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">
              Discover our exclusive collection of premium T-shirts and shirts designed for those who dare to stand out. Quality meets comfort in every stitch.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Premium Quality</h3>
                  <p className="text-gray-600 text-sm">Crafted from the finest materials for ultimate comfort.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Unique Designs</h3>
                  <p className="text-gray-600 text-sm">Stand out with our exclusive, limited-edition prints.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Eco-Friendly</h3>
                  <p className="text-gray-600 text-sm">Sustainable materials that care for the planet.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={() => navigate('/items')}
                className="bg-indigo-600 text-white px-6 py-3 cursor-pointer rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
              >
                Shop Now
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="ml-4 px-6 py-3 rounded-lg font-medium border cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-colors duration-200"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Featured Products</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            {/* Product 1 */}
            <motion.div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <Link to="/details/1">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="/assets/White Kurta.jpg" 
                    alt="White Jaipuri Cotton Printed Shirt"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">White Jaipuri Cotton Shirt</h3>
                  <p className="text-indigo-600 font-semibold">₹799</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">A shirt that is stitched with detailed precision and printed with an authentic design.</p>
                </div>
              </Link>
            </motion.div>

            {/* Product 2 */}
            <motion.div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <Link to="/details/2">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="/assets/White-Shirt (3).jpg" 
                    alt="White Jaipuri Printed Cotton Shirt"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">White Jaipuri Half Sleeve</h3>
                  <p className="text-indigo-600 font-semibold">₹699</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">A shirt that is stitched with detailed precision and printed with an authentic design.</p>
                </div>
              </Link>
            </motion.div>

            {/* Product 3 */}
            <motion.div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <Link to="/details/3">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="/assets/Pink-Kurta (3).jpg" 
                    alt="Pink Jaipuri Full Sleeve Shirt"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">Pink Jaipuri Full Sleeve</h3>
                  <p className="text-indigo-600 font-semibold">₹799</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">A shirt that is stitched with detailed precision and printed with an authentic design.</p>
                </div>
              </Link>
            </motion.div>

            {/* Product 4 */}
            <motion.div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <Link to="/details/4">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="/assets/Black T-Shirt.jpg" 
                    alt="Black T-Shirt"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">Black T-Shirt</h3>
                  <p className="text-indigo-600 font-semibold">₹699</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">Light beige kurta with subtle patterns, perfect for casual wear.</p>
                </div>
              </Link>
            </motion.div>
          </div>
          
          <div className="text-center mt-10">
            <Link 
              to="/items" 
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors duration-200"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <motion.div 
          className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 max-w-3xl mx-auto border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ 
            scale: 1.01,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">Stay Updated</h2>
            <button 
              onClick={() => setIsSubscribed(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close newsletter"
            >
              ✕
            </button>
          </div>
          
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 font-medium py-2 text-center"
            >
              Thank you for subscribing! 🎉
            </motion.div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Get the latest products, offers, and updates delivered to your inbox.
              </p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email) {
                    setIsSubscribed(true);
                    setEmail('');
                  }
                }}
                className="space-y-3"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full sm:flex-grow px-4 py-3 sm:py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      boxShadow: '0 2px 4px -1px rgba(79, 70, 229, 0.2)'
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 15
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 sm:py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 w-full sm:w-auto"
                  >
                    Subscribe
                  </motion.button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
      </div>    
    </div>
  );
};

export default Home;