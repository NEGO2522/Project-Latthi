import { useState, useEffect } from 'react';
import { ref, push, set, get, update, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { database, app } from '../firebase/firebase';
import { toast } from 'react-toastify';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FiPackage, FiPlusCircle } from 'react-icons/fi';

const Admin = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    fabric: '',
    color: '',
    sizes: [],
    images: [''],
    features: [''],
    careInstructions: ['']
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [availableSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);
  const auth = getAuth(app);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const user = auth.currentUser;
    const adminEmail = user?.email?.toLowerCase();
    const isAdminUser = adminEmail?.endsWith('@admin.com') || adminEmail === 'cottonfab0001@gmail.com';
    
    if (!user || !isAdminUser) {
      navigate('/');
      toast.error('Unauthorized access');
    } else {
      fetchProducts();
    }
  }, [navigate, auth]);
  
  // Handle edit product
  const handleEdit = (productId) => {
    const product = products[productId];
    if (product) {
      setFormData({
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
      setEditingId(productId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fetch existing products
  const fetchProducts = async () => {
    try {
      const productsRef = ref(database, 'products');
      const snapshot = await get(productsRef);
      if (snapshot.exists()) {
        setProducts(snapshot.val());
      } else {
        setProducts({});
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e, field, index) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleSizesChange = (e) => {
    const { value, checked } = e.target;
    let newSizes = [...formData.sizes];
    
    if (checked) {
      newSizes.push(value);
    } else {
      newSizes = newSizes.filter(size => size !== value);
    }
    
    setFormData(prev => ({
      ...prev,
      sizes: newSizes
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const productRef = ref(database, `products/${productId}`);
        await remove(productRef);
        toast.success('Product deleted successfully!');
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      fabric: '',
      color: '',
      sizes: [],
      images: [''],
      features: [''],
      careInstructions: ['']
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.price || !formData.description || !formData.fabric || !formData.color) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.sizes.length) {
      toast.error('Please select at least one size');
      return;
    }
    
    // Validate images
    const validImages = formData.images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      toast.error('Please add at least one image URL');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Clean up data
      const productData = {
        name: formData.name.trim(),
        price: formData.price.trim(),
        description: formData.description.trim(),
        fabric: formData.fabric.trim(),
        color: formData.color.trim(),
        sizes: [...formData.sizes],
        images: validImages,
        features: formData.features.filter(feature => feature.trim() !== ''),
        careInstructions: formData.careInstructions.filter(instruction => instruction.trim() !== '')
      };
      
      let productId = editingId || uuidv4();
      const productRef = ref(database, `products/${productId}`);
      
      // Save to Firebase
      await set(productRef, productData);
      
      // Show success message
      toast.success(editingId ? 'Product updated successfully!' : 'Product added successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset the form and fetch updated products
      resetForm();
      await fetchProducts();
      
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const location = useLocation();
  const isProductsPage = location.pathname === '/admin';
  const isOrdersPage = location.pathname === '/admin/orders';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to="/admin"
              className={`${isProductsPage ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <div className="flex items-center">
                <FiPackage className="mr-2 h-5 w-5" />
                Products
              </div>
            </Link>
            <Link
              to="/admin/orders"
              className={`${isOrdersPage ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <div className="flex items-center">
                <FiPackage className="mr-2 h-5 w-5" />
                Orders
              </div>
            </Link>
          </nav>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isProductsPage ? 'Product Management' : 'Order Management'}
            </h1>
            {isProductsPage && (
              <Link
                to="/admin/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlusCircle className="mr-2 h-5 w-5" />
                Add New Product
              </Link>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 799"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
                <input
                  type="text"
                  name="fabric"
                  value={formData.fabric}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            
            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
                {availableSizes.map((size) => (
                  <label key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={size}
                      checked={formData.sizes.includes(size)}
                      onChange={handleSizesChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs</label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleArrayInputChange(e, 'images', index)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/image.jpg"
                    required={index === 0}
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('images', index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('images')}
                className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add another image URL
              </button>
            </div>
            
            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleArrayInputChange(e, 'features', index)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Machine washable"
                    required={index === 0}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('features', index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('features')}
                className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add another feature
              </button>
            </div>
            
            {/* Care Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
              {formData.careInstructions.map((instruction, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => handleArrayInputChange(e, 'careInstructions', index)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Machine wash cold"
                    required={index === 0}
                  />
                  {formData.careInstructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('careInstructions', index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('careInstructions')}
                className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add another care instruction
              </button>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (editingId ? 'Updating Product...' : 'Adding Product...') : (editingId ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>
        </div>
        
        {/* Existing Products */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Products ({Object.keys(products).length})</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {Object.entries(products).map(([id, product]) => (
                <li key={id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm">
                          <p className="font-medium text-indigo-600 truncate">{product.name}</p>
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                            • {product.price}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <p className="truncate">{product.color}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex -space-x-1 overflow-hidden">
                          {product.images && product.images[0] && (
                            <img
                              className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                              src={product.images[0]}
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/50';
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(id)}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
