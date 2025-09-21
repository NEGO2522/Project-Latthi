import { useState, useEffect, useContext } from 'react';
import env from '../env';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiShare2, FiCheck, FiMinus, FiPlus, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { handleImageError } from '../utils/imageUtils';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { database } from '../firebase/firebase';

const Details = () => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { addToCart, getCartCount } = useCart();
  const auth = getAuth();

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

  const [product, setProduct] = useState(products[id] || products[1]);
  
  // Check if user is admin
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const adminEmail = user.email?.toLowerCase();
      const isAdminUser = adminEmail?.endsWith('@admin.com') || adminEmail === 'cottonfab0001@gmail.com';
      setIsAdmin(isAdminUser);
      
      // Initialize edit data when product loads
      if (product) {
        setEditData({
          name: product.name || '',
          price: product.price || '',
          description: product.description || '',
          fabric: product.fabric || '',
          color: product.color || '',
          sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
          images: product.images && product.images.length > 0 ? [...product.images] : [''],
          features: product.features && product.features.length > 0 ? [...product.features] : [''],
          careInstructions: product.careInstructions && product.careInstructions.length > 0 ? [...product.careInstructions] : ['']
        });
      }
    }
  }, [id, product, auth.currentUser]);
  
  // Handle input changes for edit mode
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle array field changes (features, careInstructions, etc.)
  const handleArrayEdit = (field, index, value) => {
    const newArray = [...editData[field]];
    newArray[index] = value;
    setEditData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };
  
  // Add new array field
  const addArrayField = (field) => {
    setEditData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };
  
  // Remove array field
  const removeArrayField = (field, index) => {
    const newArray = editData[field].filter((_, i) => i !== index);
    setEditData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };
  
  // Save changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const productRef = ref(database, `products/${id}`);
      await update(productRef, editData);
      
      // Update local state
      setProduct(prev => ({
        ...prev,
        ...editData
      }));
      
      setIsEditing(false);
      toast.success('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle edit mode
  const toggleEdit = () => {
    if (isEditing) {
      // Reset edit data when canceling
      setEditData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        fabric: product.fabric || '',
        color: product.color || '',
        sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
        images: product.images && product.images.length > 0 ? [...product.images] : [''],
        features: product.features && product.features.length > 0 ? [...product.features] : [''],
        careInstructions: product.careInstructions && product.careInstructions.length > 0 ? [...product.careInstructions] : ['']
      });
    }
    setIsEditing(!isEditing);
  };

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

  const handleBuyNow = () => {
    // Navigate to address page with selected item details
    navigate('/address', {
      state: {
        item: {
          id,
          name: product.name,
          price: product.price,
          images: product.images,
          size: selectedSize,
          quantity: quantity,
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="mr-2" /> Back
            </button>
            {isAdmin && (
              <button
                onClick={toggleEdit}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                  isEditing 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isEditing ? (
                  <>
                    <FiX className="mr-1" /> Cancel
                  </>
                ) : (
                  <>
                    <FiEdit2 className="mr-1" /> Edit Product
                  </>
                )}
              </button>
            )}
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
              >
                <FiSave className="mr-1" /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
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
                  onError={(e) => handleImageError(e, product.name)}
                />
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Product Images</h3>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => addArrayField('images')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      + Add Image
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-4">
                    {editData.images.map((image, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={image}
                            onChange={(e) => handleArrayEdit('images', index, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter image URL"
                          />
                          {image && (
                            <div className="mt-2">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="h-20 object-cover rounded"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/placeholder-image.jpg';
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeArrayField('images', index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`overflow-hidden rounded-lg ${
                          selectedImageIndex === index ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="h-24 w-full object-cover object-center"
                          onError={handleImageError}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="py-2">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="text"
                      name="price"
                      value={editData.price}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-xl font-semibold text-gray-900 mt-2">{product.price}</p>
                  <p className="text-gray-600 mt-4">{product.description}</p>
                </>
              )}
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600">{product.description}</p>
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900">Features</h3>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => addArrayField('features')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      + Add Feature
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    {editData.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleArrayEdit('features', index, e.target.value)}
                          className="flex-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter feature"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayField('features', index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <FiCheck className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
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
                <h3 className="text-sm font-medium text-gray-900">Sizes</h3>
                {isEditing ? (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            const newSizes = editData.sizes.includes(size)
                              ? editData.sizes.filter(s => s !== size)
                              : [...editData.sizes, size];
                            setEditData(prev => ({
                              ...prev,
                              sizes: newSizes
                            }));
                          }}
                          className={`px-4 py-2 border rounded-md text-sm font-medium ${
                            editData.sizes.includes(size)
                              ? 'bg-gray-900 text-white border-transparent'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Selected: {editData.sizes.join(', ') || 'None'}</p>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          selectedSize === size
                            ? 'bg-gray-900 text-white border-transparent'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
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