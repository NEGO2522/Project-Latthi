import { useState, useEffect } from 'react';
import env from '../env';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiShare2, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const Details = () => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart, getCartCount } = useCart();

  // Product database
  const products = {
    1: {
      name: 'White Jaipuri Cotton Printed Shirt For Men',
      price: '₹799',
      description: 'A shirt that is stitched with detailed precision and printed with an authentic design.',
      fabric: '100% Premium Cotton',
      color: 'White with Jaipuri Print',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [
        '/assets/White Kurta.jpg',
        '/assets/White Kurta_1.jpg',
        '/assets/White Kurta_2.jpg',
      ],
      features: [
        'Handcrafted with authentic Jaipuri print',
        'Breathable cotton fabric',
        'Regular fit',
        'Full sleeves',
        'Button closure',
        'Machine washable'
      ],
      careInstructions: [
        'Gentle hand wash with cold water',
        'Do not bleach',
        'Colors may bleed - wash dark clothes separately',
        'Iron on the reverse side'
      ]
    },
    2: {
      name: 'White Jaipuri Printed Cotton Half Sleeve Shirt',
      price: '₹699',
      description: 'A shirt that is stitched with detailed precision and printed with an authentic design.',
      fabric: '100% Premium Cotton - Easy on the Skin',
      color: 'White with Jaipuri Print',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [
        '/assets/White-Shirt (3).jpg',
        '/assets/White-Shirt (1).jpg',
        '/assets/White-Shirt (2).jpg',
      ],
      features: [
        'Handcrafted with authentic Jaipuri print',
        'Breathable cotton fabric',
        'Regular fit',
        'Half sleeves',
        'Button closure',
        'Machine washable'
      ],
      careInstructions: [
        'Gentle hand wash with cold water',
        'Do not bleach',
        'Colors may bleed - wash dark clothes separately',
        'Iron on the reverse side'
      ]
    },
    3: {
      name: 'Pink Jaipuri Full Sleeve Printed Shirt for Men',
      price: '₹799',
      description: 'A shirt that is stitched with detailed precision and printed with an authentic design.',
      fabric: '100% Premium Cotton',
      color: 'Pink with Jaipuri Print',
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        '/assets/Pink-Kurta (3).jpg',
        '/assets/Pink-Kurta (1).jpg',
        '/assets/Pink-Kurta (2).jpg',
      ],
      features: [
        'Handcrafted with authentic Jaipuri print',
        'Breathable cotton fabric',
        'Regular fit',
        'Full sleeves',
        'Button closure',
        'Machine washable'
      ],
      careInstructions: [
        'Gentle hand wash with cold water',
        'Do not bleach',
        'Colors may bleed - wash dark clothes separately',
        'Iron on the reverse side'
      ]
    },
    4: {
      name: 'Black T-Shirt',
      price: '₹699',
      description: 'Premium quality black t-shirt with a comfortable fit, perfect for casual and semi-formal occasions.',
      fabric: '100% Cotton - Soft and Breathable',
      color: 'Solid Black',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [
        '/assets/Black T-Shirt.jpg',
       
      ],
      features: [
        'Premium quality cotton fabric',
        'Comfortable regular fit',
        'Round neck design',
        'Short sleeves',
        'Durable stitching',
        'Machine washable'
      ],
      careInstructions: [
        'Machine wash with similar colors',
        'Wash inside out',
        'Use mild detergent',
        'Do not bleach',
        'Tumble dry low',
        'Iron on medium heat',
        'Do not dry clean'
      ]
    }
    // Add more products as needed
  };

  const product = products[id] || products[1]; // Default to first product if ID not found

  const handleAddToCart = async () => {
    if (!id) return;
    
    const product = products[id];
    if (!product) return;
    
    setIsAdding(true);
    try {
      addToCart(
        { 
          id: id, 
          name: product.name, 
          price: product.price, 
          images: product.images 
        },
        selectedSize,
        quantity
      );
      
      toast.success('Added to cart!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyNow = async () => {
    try {
      // Check if Razorpay is already loaded
      if (!window.Razorpay) {
        const loaded = await loadRazorpay();
        if (!loaded) {
          throw new Error('Failed to load Razorpay');
        }
      }

      const amount = parseInt(product.price.replace(/[^0-9]/g, '')) * 100; // Convert price to paise
      
      const options = {
        key: env.RAZORPAY_KEY_ID,
        amount: amount.toString(),
        currency: 'INR',
        name: env.RAZORPAY_COMPANY_NAME,
        description: `Order for ${product.name} (${selectedSize})`,
        image: env.RAZORPAY_COMPANY_LOGO,
        handler: function (response) {
          // Handle successful payment
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          // Redirect to order success page or show success message
          // navigate('/order-success');
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '+919876543210'
        },
        notes: {
          address: 'Customer Address',
          product: product.name,
          size: selectedSize,
          quantity: quantity
        },
        theme: {
          color: '#4F46E5' // Match your brand color
        }
      };

      // Create a new Razorpay instance
      const paymentObject = new window.Razorpay(options);
      
      // Open the payment form
      paymentObject.open();
      
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" /> Back to Shop
          </button>
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

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600x800?text=Product+Image';
                  }}
                />
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-lg transition-all duration-200 ${
                      selectedImageIndex === index ? 'ring-2 ring-indigo-500 ring-offset-2' : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-indigo-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150x200?text=Product';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="py-2">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-3 text-2xl font-medium text-indigo-600">{product.price}</p>
              
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600">{product.description}</p>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Fabric & Care</h2>
                <ul className="mt-2 space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <FiCheck className="h-5 w-5 flex-shrink-0 text-green-500 mr-2 mt-0.5" />
                    <span>Fabric: {product.fabric}</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="h-5 w-5 flex-shrink-0 text-green-500 mr-2 mt-0.5" />
                    <span>Color: {product.color}</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="h-5 w-5 flex-shrink-0 text-green-500 mr-2 mt-0.5" />
                    <span>Gentle hand wash with cold water</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="h-5 w-5 flex-shrink-0 text-green-500 mr-2 mt-0.5" />
                    <span>Do not bleach</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="h-5 w-5 flex-shrink-0 text-green-500 mr-2 mt-0.5" />
                    <span>Colors may bleed - wash dark clothes separately</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="h-5 w-5 flex-shrink-0 text-green-500 mr-2 mt-0.5" />
                    <span>Iron on the reverse side</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Size</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-10 flex items-center justify-center rounded-md border ${
                        selectedSize === size
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Quantity</h2>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                      disabled={isAdding}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1 w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                      disabled={isAdding}
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`flex-1 py-2 px-6 rounded-md font-medium flex items-center justify-center space-x-2 border ${
                      isAdding 
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-700 hover:text-indigo-700'
                    }`}
                  >
                    {isAdding ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <FiShoppingCart />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 bg-indigo-600 border border-transparent text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Buy Now
                </button>
              </div>

              <div className="mt-6 flex items-center space-x-4">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-500"
                  title="Add to Wishlist"
                >
                  <FiHeart className="h-6 w-6" />
                  <span className="sr-only">Add to wishlist</span>
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-500"
                  title="Share"
                >
                  <FiShare2 className="h-6 w-6" />
                  <span className="sr-only">Share</span>
                </button>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-900">Style Note</h2>
                <p className="mt-2 text-gray-600">
                  We offer the right blend of quality, style, and value to our customers. You can team this shirt with cargo or denim and can gift it to your loved ones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;