import { useState, useEffect } from 'react';
import { ref, set, get, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { database, app } from '../firebase/firebase';
import { toast } from 'react-toastify';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FiBox, FiPlus, FiEdit, FiTrash2, FiHome, FiUsers, FiClipboard, FiMessageSquare, FiDollarSign, FiMenu, FiX } from 'react-icons/fi';
import { AVAILABLE_SIZES, CATEGORIES } from '../constants';
import { convertGoogleDriveLink } from '../utils/imageUtils';

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    fabric: '',
    colors: [''],
    category: 'one-piece',
    sizes: [],
    images: [''],
    features: [''],
    careInstructions: ['']
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const auth = getAuth(app);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
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
  
  const handleEdit = (productId) => {
    const product = products[productId];
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        fabric: product.fabric || '',
        colors: product.colors && product.colors.length > 0 ? [...product.colors] : [''],
        category: product.category || 'one-piece',
        sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
        images: product.images && product.images.length > 0 ? [...product.images] : [''],
        features: product.features && product.features.length > 0 ? [...product.features] : [''],
        careInstructions: product.careInstructions && product.careInstructions.length > 0 ? [...product.careInstructions] : ['']
      });
      setEditingId(productId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSidebarOpen(false); // Close sidebar on mobile when editing
    }
  };

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (e, field, index) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayField = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSizesChange = (e) => {
    const { value } = e.target;
    let newSizes = formData.sizes.includes(value)
      ? formData.sizes.filter(size => size !== value)
      : [...formData.sizes, value];
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await remove(ref(database, `products/${productId}`));
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
      name: '', price: '', description: '', fabric: '', colors: [''], category: 'one-piece',
      sizes: [], images: [''], features: [''], careInstructions: ['']
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['name', 'price', 'description', 'fabric', 'category'];
    if (requiredFields.some(field => !formData[field])) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.sizes.length) {
      toast.error('Please select at least one size');
      return;
    }
    
    const validColors = formData.colors.filter(color => color.trim() !== '');
    if (validColors.length === 0) {
        toast.error('Please add at least one color');
        return;
    }

    const validImages = formData.images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      toast.error('Please add at least one image URL');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        price: formData.price.trim(),
        images: validImages,
        colors: validColors,
        features: formData.features.filter(f => f.trim() !== ''),
        careInstructions: formData.careInstructions.filter(i => i.trim() !== '')
      };
      
      const productId = editingId || uuidv4();
      await set(ref(database, `products/${productId}`), productData);
      
      toast.success(editingId ? 'Product updated!' : 'Product added!');
      resetForm();
      await fetchProducts();
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Failed to submit product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const location = useLocation();

  const SideNavLink = ({ to, icon, children }) => (
    <Link
      to={to}
      onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click
      className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-200 ${location.pathname === to ? 'bg-indigo-100 text-indigo-700 font-semibold' : ''}`}
    >
      {icon}
      <span className="ml-3">{children}</span>
    </Link>
  );

  return (
    <div className="relative flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white shadow-lg p-4 flex-shrink-0 z-30 flex flex-col`}>
        <div className="flex items-center justify-between mb-8 lg:justify-center">
            <div className="flex items-center">
                <img 
                  src={`${window.location.protocol}//${window.location.host}/assets/Logo.png`}
                  alt="Lathi Logo" 
                  className="h-10 w-10 mr-2 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/placeholder.jpg';
                  }}
                />
                <h1 className="text-2xl font-bold text-gray-800">LATHI</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-600 hover:text-gray-800">
                <FiX className="h-6 w-6" />
            </button>
        </div>
        <nav className="space-y-2">
            <SideNavLink to="/admin" icon={<FiBox className="h-5 w-5" />}>Products</SideNavLink>
            <SideNavLink to="/admin/orders" icon={<FiClipboard className="h-5 w-5" />}>Orders</SideNavLink>
            <SideNavLink to="/admin/subscribers" icon={<FiUsers className="h-5 w-5" />}>Subscribers</SideNavLink>
            <SideNavLink to="/admin/feedback" icon={<FiMessageSquare className="h-5 w-5" />}>Feedback</SideNavLink>
            <SideNavLink to="/admin/refunds" icon={<FiDollarSign className="h-5 w-5" />}>Refunds</SideNavLink>
            <SideNavLink to="/" icon={<FiHome className="h-5 w-5" />}>Back to Home</SideNavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <div className="max-w-full mx-auto">
          <div className="mb-8 flex items-center justify-end">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md lg:hidden"
            >
                <FiMenu className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:space-x-10 lg:items-start">
            <div className={`lg:w-1/2 lg:sticky lg:top-10 bg-white p-4 sm:p-8 rounded-2xl shadow-lg mb-10 lg:mb-0 transition-all duration-700 ease-in-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                {editingId ? <FiEdit className="mr-3 text-indigo-600" /> : <FiPlus className="mr-3 text-indigo-600" />}
                {editingId ? 'Edit Product' : 'Add a New Product'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full input-field" required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input type="text" name="price" value={formData.price} onChange={handleInputChange} className="w-full input-field" placeholder="e.g., 799" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
                        <input type="text" name="fabric" value={formData.fabric} onChange={handleInputChange} className="w-full input-field" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full input-field" required>
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full input-field" required />
                    </div>
                  </div>

                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
                          {formData.colors.map((value, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleArrayInputChange(e, 'colors', index)}
                                className="flex-1 input-field"
                                placeholder="Enter color"
                              />
                              {formData.colors.length > 1 && (
                                <button type="button" onClick={() => removeArrayField('colors', index)} className="p-2 text-red-500 hover:text-red-700">
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          ))}
                          <button type="button" onClick={() => addArrayField('colors')} className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            + Add color
                          </button>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {AVAILABLE_SIZES.map((size) => (
                              <label key={size} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer text-sm">
                              <input type="checkbox" value={size} checked={formData.sizes.includes(size)} onChange={handleSizesChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                              <span>{size}</span>
                              </label>
                          ))}
                          </div>
                      </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">Images</label>
                        {formData.images.map((value, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                              type='url'
                              value={value}
                              onChange={(e) => handleArrayInputChange(e, 'images', index)}
                              className="flex-1 input-field"
                              placeholder={`https://example.com/image.jpg`}
                              required={index === 0}
                            />
                            {formData.images.length > 1 && (
                              <button type="button" onClick={() => removeArrayField('images', index)} className="p-2 text-red-500 hover:text-red-700">
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addArrayField('images')} className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                          + Add image
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                        {formData.features.map((value, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleArrayInputChange(e, 'features', index)}
                              className="flex-1 input-field"
                              placeholder="Enter feature"
                            />
                            {formData.features.length > 1 && (
                              <button type="button" onClick={() => removeArrayField('features', index)} className="p-2 text-red-500 hover:text-red-700">
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addArrayField('features')} className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                          + Add feature
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
                        {formData.careInstructions.map((value, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleArrayInputChange(e, 'careInstructions', index)}
                              className="flex-1 input-field"
                              placeholder="Enter care instruction"
                            />
                            {formData.careInstructions.length > 1 && (
                              <button type="button" onClick={() => removeArrayField('careInstructions', index)} className="p-2 text-red-500 hover:text-red-700">
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addArrayField('careInstructions')} className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                          + Add instruction
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-wrap items-center justify-end gap-3">
                  {editingId && (
                    <button type="button" onClick={resetForm} className="btn-secondary py-2 px-4">
                        Cancel Edit
                    </button>
                  )}
                  <button type="submit" disabled={isSubmitting} className={`btn-primary py-2 px-6 ${isSubmitting ? 'opacity-50' : ''}`}>
                    {isSubmitting ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Product' : 'Add Product')}
                  </button>
                </div>
              </form>
            </div>
            
            <div className={`lg:w-1/2 transition-all duration-700 ease-in-out delay-200 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Existing Products ({Object.keys(products).length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-4">
                {Object.entries(products).reverse().map(([id, product]) => (
                  <div key={id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl group">
                    <div className="h-56 overflow-hidden">
                      <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={convertGoogleDriveLink(product.images[0])} alt={product.name} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800 truncate">{product.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                          <p className="text-indigo-600 font-bold text-xl">₹{product.price}</p>
                          <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{product.colors && Array.isArray(product.colors) ? product.colors.join(', ') : ''}</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => handleEdit(id)} className="flex-1 btn-secondary text-sm py-2">
                          <FiEdit className="mr-2 h-4 w-4" /> Edit
                        </button>
                        <button onClick={() => handleDelete(id)} className="flex-1 btn-danger text-sm py-2">
                          <FiTrash2 className="mr-2 h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
