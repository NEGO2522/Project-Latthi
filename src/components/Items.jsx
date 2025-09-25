import { AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiLoader, FiFilter, FiX } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useState, useEffect, useMemo } from 'react';
import { handleImageError } from '../utils/imageUtils';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/firebase';

const Items = () => {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const definedCategories = useMemo(() => ["One piece", "Two piece", "Three piece", "short kurti"], []);

  useEffect(() => {
    const fetchProducts = () => {
      const productsRef = ref(database, 'products');
      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productsArray = Object.entries(data).map(([id, product]) => ({
            id,
            ...product,
            image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/assets/placeholder.jpg',
            price: typeof product.price === 'number' ? `₹${product.price}` : product.price || '₹0',
            category: product.category || 'Uncategorized',
          }));
          setItems(productsArray);
        } else {
          setItems([]);
        }
        setLoading(false);
      }, (err) => {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      });
    };
    fetchProducts();
  }, []);

  const { categories, categoryCounts } = useMemo(() => {
    const counts = {};
    definedCategories.forEach(cat => {
        counts[cat] = items.filter(item => item.category === cat).length;
    });

    return {
      categories: ['All', ...definedCategories],
      categoryCounts: { 'All': items.length, ...counts },
    };
  }, [items, definedCategories]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const filteredItems = useMemo(() =>
    selectedCategory === 'All'
      ? items
      : items.filter(item => item.category === selectedCategory)
  , [items, selectedCategory]);

  const CategorySidebar = ({ isMobileView = false }) => (
    <div className={`${isMobileView ? 'p-4' : 'sticky top-8 bg-white p-6 rounded-lg shadow-sm'}`}>
      <h2 className="text-2xl font-bold mb-5 flex items-center">
        <FiFilter className="mr-3 text-indigo-600"/>
        Categories
      </h2>
      <nav className="space-y-2">
        {categories.map(category => (
          <button 
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              if (isMobileView) {
                toggleMenu();
              }
            }}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex justify-between items-center text-sm font-medium ${selectedCategory === category ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-50 text-gray-700'}`}>
            <span>{category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === category ? 'bg-white text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
              {categoryCounts[category] || 0}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <FiLoader className="animate-spin text-5xl text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col justify-center items-center p-4 text-center">
        <p className="text-red-700 text-xl mb-4 font-semibold">Something went wrong</p>
        <p className="text-red-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <div
            className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm z-40"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <div
            className="fixed top-0 left-0 h-full w-72 bg-gray-50 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <Link to="/cart" className="flex items-center p-3 font-bold text-lg">
                <FiShoppingCart className="mr-3" /> Cart
                {getCartCount() > 0 && <span className="ml-auto bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{getCartCount()}</span>}
              </Link>
              <button onClick={toggleMenu} className="p-2 rounded-lg bg-white shadow-sm" aria-label="Close menu"><FiX className="text-gray-800"/></button>
            </div>
            <CategorySidebar isMobileView={true} />
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-screen-2xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center mb-6 sm:mb-8 md:hidden">
          <button onClick={toggleMenu} className="p-2 rounded-lg bg-white shadow-sm" aria-label="Open menu"><FiMenu className="text-gray-800"/></button>
          <h1 className="text-xl font-bold text-gray-800">Our Collection</h1>
          <Link to="/cart" className="relative p-2 rounded-lg bg-white shadow-sm">
            <FiShoppingCart className="text-gray-800"/>
            {getCartCount() > 0 && <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{getCartCount()}</span>}
          </Link>
        </header>

        <div className="md:flex md:gap-8 lg:gap-12">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <CategorySidebar />
          </aside>

          <main className="flex-1">
           
            
            <AnimatePresence>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id}
                      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      <div className="h-56 w-full overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => handleImageError(e, item.name)} />
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <h2 className="text-md font-bold text-gray-800 line-clamp-1 flex-grow pr-2 mb-2">{item.name}</h2>
                        <p className="text-lg font-semibold text-indigo-600 mb-3">{item.price}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 flex-grow mb-4">{item.description}</p>
                        <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-gray-100">
                           <button onClick={() => {}} className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"><FiShoppingCart className="mr-2" />Add to Cart</button>
                           <button onClick={() => navigate('/adress', { state: { item: { ...item, quantity: 1 } } })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-lg text-sm font-bold transition-colors">Buy Now</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-600 text-xl font-semibold">No Products Found</p>
                  <p className="text-gray-500 mt-2">There are no products available in the "{selectedCategory}" category.</p>
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Items;
