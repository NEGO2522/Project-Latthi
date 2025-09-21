import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, database, ref, push, get } from '../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiShoppingCart, FiPackage, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';

const Home = ({ user, isAdmin }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = ref(database, 'products');
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
          const allProducts = snapshot.val();
          const recentProducts = Object.keys(allProducts).slice(-3).reduce((obj, key) => {
            obj[key] = allProducts[key];
            return obj;
          }, {});
          setProducts(recentProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products.');
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      const subscribersRef = ref(database, 'subscribers');
      push(subscribersRef, { 
        email: email,
        subscribedAt: new Date().toISOString()
      }).then(() => {
        setIsSubscribed(true);
        setEmail('');
        toast.success('Thank you for subscribing! 🎉');
      }).catch(error => {
        console.error('Subscription error:', error);
        toast.error('Something went wrong. Please try again.');
      });
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTagline(true);
      
      const interval = setInterval(() => {
        setShowTagline(false);
        setTimeout(() => setShowTagline(true), 800);
      }, 8000);
      
      return () => clearInterval(interval);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-12">

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="w-full overflow-hidden rounded-xl md:rounded-2xl">
            <img src="/assets/Home.png" alt="Home" className="w-full h-full object-contain" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Elevate Your Style with <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold" style={{ fontFamily: "'Great Vibes', cursive" }}>Lathi</span>
            </h2>
            
            <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">
                <span className="hidden sm:block">
                    At Lathi, we believe in the power of self-expression. Our kurtis are designed for the modern woman who is confident, bold, and unapologetically herself. We blend traditional craftsmanship with contemporary designs to create pieces that are not just clothes, but a statement.
                </span>
                <span className="sm:hidden">
                    Discover kurtis designed for the confident, modern woman. A blend of tradition and contemporary style.
                </span>
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
                  <h3 className="font-medium text-gray-900">Exceptional Quality</h3>
                  <p className="text-gray-600 text-sm">
                    <span className="hidden sm:block">Our kurtis are crafted from the finest materials, ensuring a soft, breathable, and comfortable fit that lasts.</span>
                    <span className="sm:hidden">Crafted from the finest materials for a comfortable fit.</span>
                  </p>
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
                  <p className="text-gray-600 text-sm">
                    <span className="hidden sm:block">Stand out with our exclusive, limited-edition prints that you won't find anywhere else.</span>
                    <span className="sm:hidden">Exclusive, limited-edition prints.</span>
                  </p>
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
                  <h3 className="font-medium text-gray-900">Perfect Fit</h3>
                  <p className="text-gray-600 text-sm">
                    <span className="hidden sm:block">Our kurtis are designed to flatter every body type, with a comfortable and stylish fit that you'll love.</span>
                    <span className="sm:hidden">Designed to flatter every body type.</span>
                  </p>
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
                  <p className="text-gray-600 text-sm">
                    <span className="hidden sm:block">We use sustainable materials and ethical manufacturing processes to create our kurtis.</span>
                    <span className="sm:hidden">Sustainable materials and ethical manufacturing.</span>
                  </p>
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

      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Featured Products</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
          </div>
          
          {loading ? (
             <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
              {Object.entries(products).map(([id, product]) => (
                <motion.div 
                  key={id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 max-w-xs mx-auto"
                  whileHover={{ y: -5 }}
                >
                  <Link to={`/details/${id}`}>
                    <div className="h-64 overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-indigo-600 font-semibold">₹{product.price}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

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
                onSubmit={handleSubscribe}
                className="space-y-3"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.text)}
                    placeholder="Your email address"
                    className="w-full sm:flex-grow px-4 py-3 sm:py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0..3)'
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
