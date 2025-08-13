import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiShare2, FiCheck } from 'react-icons/fi';

const Details = () => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams();

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

  const handleAddToCart = () => {
    // Add to cart functionality will be implemented later
    console.log('Added to cart:', { product, size: selectedSize, quantity });
  };

  const handleBuyNow = () => {
    // Buy now functionality will be implemented later
    console.log('Buy now:', { product, size: selectedSize, quantity });
    // navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="mr-2" /> Back to Shop
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600x800?text=Product+Image';
                  }}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150x200?text=Product';
                      }}
                    />
                  </div>
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
                <div className="mt-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md text-gray-600 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-300 text-gray-900">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-white border border-indigo-600 text-indigo-600 py-3 px-6 rounded-md font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </button>
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