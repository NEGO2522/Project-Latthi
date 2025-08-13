import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiHome } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

const Items = () => {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12 relative">
          <Link 
            to="/"
            className="absolute left-0 top-0 flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
            title="Back to Home"
          >
            <FiHome className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mx-auto"
          >
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Collection
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Handcrafted with premium fabric and intricate detailing
            </p>
          </motion.div>
          <Link 
            to="/cart"
            className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors self-start mt-2"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
          {items.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="h-48 sm:h-52 w-full overflow-hidden">
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
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h2>
                    <p className="mt-0.5 text-base font-medium text-indigo-600">{item.price}</p>
                  </div>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.inStock ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
                
                <p className="mt-2 text-sm text-gray-600 line-clamp-2 h-10">{item.description}</p>
                
                <div className="mt-3">
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
                
                <div className="mt-4">
                  <button
                    onClick={() => handleCheckout(item.id)}
                    type="button"
                    className="w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
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
  );
};

export default Items;