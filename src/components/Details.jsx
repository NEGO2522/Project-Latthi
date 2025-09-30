import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { FiShoppingCart, FiCheck, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { handleImageError, convertGoogleDriveLink } from '../utils/imageUtils';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebase/firebase';
import { referralCodes } from './ReferralCode';
import SizeChart from './SizeChart';

const Details = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const auth = getAuth();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const backUrl = categoryParam ? `/items?category=${encodeURIComponent(categoryParam)}` : '/items';

  // Generate a consistent discount percentage based on product ID
  const getConsistentDiscount = (id, category) => {
    if (!id) return 35; // Default discount if no ID
    
    // Create a simple hash from the product ID to get a consistent value
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use different discount ranges based on category
    if (category === 'short-kurti') {
      // For short kurtis, use 30-40% discount (consistent for each product)
      return 30 + Math.abs(hash) % 11; // 30-40%
    } else {
      // For other categories, use 35-50% discount (consistent for each product)
      return 35 + Math.abs(hash) % 16; // 35-50%
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        toast.error('Product ID is missing');
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const snapshot = await get(ref(database, `products/${id}`));
        if (!snapshot.exists()) {
          toast.error('Product not found!');
          navigate('/');
          return;
        }

        const data = snapshot.val();
        const priceString = (data.price || '0').toString().replace('₹', '');
        const discountedPrice = parseFloat(priceString) || 0;
        
        const discountPercentage = getConsistentDiscount(id, data.category || 'other');
        const originalPrice = Math.round(discountedPrice / (1 - (discountPercentage / 100)));

        const productWithDiscount = {
          ...data,
          id: id,
          price: discountedPrice,
          originalPrice: originalPrice,
          discountPercentage: discountPercentage,
          images: Array.isArray(data.images) ? data.images : [data.image].filter(Boolean)
        };

        setProduct(productWithDiscount);
        setSelectedSize(Array.isArray(data.sizes) ? data.sizes[0] : '');
        setSelectedColor(Array.isArray(data.colors) ? data.colors[0] : '');
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleApplyReferral = async () => {
    if (!referralCode) {
      toast.warn('Please enter a redeem code.');
      return;
    }

    if (referralCodes.includes(referralCode)) {
      const usedCodeRef = ref(database, `usedReferralCodes/${referralCode}`);
      const snapshot = await get(usedCodeRef);

      if (snapshot.exists()) {
        toast.error('This redeem code has already been used.');
      } else {
        setReferralApplied(true);
        setShowConfetti(true);
        toast.success('Congratulations! You get a 10% discount!');
        await set(usedCodeRef, true);
        setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
      }
    } else {
      toast.error('Invalid redeem code.');
    }
  };

  const handleAddToCart = () => {
    const user = auth.currentUser;
    if (!user) {
      toast.info('Please log in to add items to your cart.');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!product || !selectedSize || (product.colors && product.colors.length > 0 && !selectedColor)) {
      toast.warn('Please select a size and color.');
      return;
    }
    setIsAdding(true);
    try {
      addToCart({ id, name: product.name, price: product.price, image: product.images[0], color: selectedColor }, selectedSize, quantity);
      toast.success(`${quantity} x ${product.name} (Size: ${selectedSize}, Color: ${selectedColor}) added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setTimeout(() => setIsAdding(false), 1000);
    }
  };

  const handleBuyNow = () => {
    const user = auth.currentUser;
    if (!user) {
      toast.info('Please log in to buy an item.');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!product || !selectedSize || (product.colors && product.colors.length > 0 && !selectedColor)) {
      toast.warn('Please select a size and color.');
      return;
    }
    const itemToPurchase = { ...product, id, size: selectedSize, color: selectedColor, quantity, referralApplied };
    navigate('/address', { state: { item: itemToPurchase } });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product not found</h2>
      <Link 
        to={backUrl} 
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Back to Shop
      </Link>
    </div>
  );

  const finalPrice = referralApplied ? product.price * 0.9 : product.price;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      {showConfetti && <Confetti />}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate(backUrl)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to {categoryParam || 'Shop'}
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 sm:p-6">
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                <img src={convertGoogleDriveLink(product.images?.[selectedImageIndex] || '')} alt={product.name} className="h-full w-full object-cover object-center" onError={handleImageError} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images?.map((image, index) => (
                  <button key={index} type="button" onClick={() => setSelectedImageIndex(index)} className={`block overflow-hidden rounded-lg border ${selectedImageIndex === index ? 'ring-2 ring-indigo-500' : 'border-gray-200'}`}>
                    <img src={convertGoogleDriveLink(image)} alt={`${product.name} ${index + 1}`} className="h-20 w-full object-cover" onError={handleImageError} />
                  </button>
                ))}
              </div>
            </div>

            <div className="py-2">
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-indigo-600">{`₹${finalPrice.toFixed(2)}`}</p>
                  <p className="text-lg text-gray-500 line-through ml-2">{`₹${product.originalPrice}`}</p>
                  <p className="text-sm font-bold text-green-600 ml-2">{`${product.discountPercentage}% OFF`}</p>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">{product.description}</p>
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                        <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSizeChart(true);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none"
                        >
                            Check Size Chart
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {product.sizes.map(size => (
                            <button 
                                key={size} 
                                onClick={() => setSelectedSize(size)} 
                                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${selectedSize === size 
                                    ? 'bg-indigo-600 text-white border-2 border-indigo-600 transform scale-110' 
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-indigo-400 hover:shadow-md'}`}
                                title={`Size ${size}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {product.colors && product.colors.length > 0 && (
                  <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Select Color</h3>
                      <div className="flex flex-wrap gap-2">
                          {product.colors.map(color => (
                              <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 text-sm border rounded-md ${selectedColor === color ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                                  {color}
                              </button>
                          ))}
                      </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                  <div className="flex items-center border rounded-md w-fit">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600"><FiMinus/></button>
                      <span className="px-4 py-2 w-12 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600"><FiPlus/></button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Redeem Code</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Enter redeem code"
                      className="flex-grow px-3 py-2 text-sm border rounded-md border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      disabled={referralApplied}
                    />
                    <button
                      onClick={handleApplyReferral}
                      disabled={referralApplied || !referralCode}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {referralApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {referralApplied && (
                    <p className="text-green-600 text-sm mt-1">Congratulations! You get a 10% discount!</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button onClick={handleAddToCart} disabled={isAdding} className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                        {isAdding ? <FiCheck className="mr-2"/> : <FiShoppingCart className="mr-2"/>} 
                        {isAdding ? 'Added!' : 'Add to Cart'}
                    </button>
                    <button onClick={handleBuyNow} className="flex-1 flex items-center justify-center bg-transparent hover:bg-indigo-600 text-indigo-700 font-semibold hover:text-white py-3 px-6 border border-indigo-500 hover:border-transparent rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                        Buy Now
                    </button>
                </div>

                <div className="space-y-3 pt-4 text-sm text-gray-600">
                  {product.features && <div className="flex items-start"><FiCheck className="w-4 h-4 mr-2 mt-1 text-green-500"/><span>{product.features.join(', ')}</span></div>}
                  {product.fabric && <div className="flex items-start"><FiCheck className="w-4 h-4 mr-2 mt-1 text-green-500"/><span>Fabric: {product.fabric}</span></div>}
                  {product.careInstructions && <div className="flex items-start"><FiCheck className="w-4 h-4 mr-2 mt-1 text-green-500"/><span>Care: {product.careInstructions.join(', ')}</span></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Size Chart Modal */}
      {showSizeChart && (
        <SizeChart onClose={() => setShowSizeChart(false)} />
      )}
    </div>
  );
};

export default Details;