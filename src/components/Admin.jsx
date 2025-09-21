import { useState, useEffect } from 'react';
import { ref, push, set, get, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { database, app } from '../firebase/firebase';
import { toast } from 'react-toastify';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FiBox, FiPlus, FiEdit, FiTrash2, FiHome, FiUsers, FiClipboard } from 'react-icons/fi';

const Admin = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    fabric: '',
    color: '',
    category: 'one-piece',
    sizes: [],
    images: [''],
    features: [''],
    careInstructions: ['']
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [availableSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);
  const [categories] = useState([
    { name: 'One piece', value: 'one-piece' },
    { name: 'Two piece', value: 'two-piece' },
    { name: 'Three piece', value: 'three-piece' },
    { name: 'Short Kurti', value: 'short-kurti' },
  ]);
  const auth = getAuth(app);
  const navigate = useNavigate();

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
  
  const handleEdit = (productId) => {
    const product = products[productId];
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        fabric: product.fabric || '',
        color: product.color || '',
        category: product.category || 'one-piece',
        sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
        images: product.images && product.images.length > 0 ? [...product.images] : [''],
        features: product.features && product.features.length > 0 ? [...product.features] : [''],
        careInstructions: product.careInstructions && product.careInstructions.length > 0 ? [...product.careInstructions] : ['']
      });
      setEditingId(productId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const { value, checked } = e.target;
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
      name: '', price: '', description: '', fabric: '', color: '', category: 'one-piece',
      sizes: [], images: [''], features: [''], careInstructions: ['']
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['name', 'price', 'description', 'fabric', 'color', 'category'];
    if (requiredFields.some(field => !formData[field])) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.sizes.length) {
      toast.error('Please select at least one size');
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
      className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-200 ${location.pathname === to ? 'bg-indigo-100 text-indigo-700 font-semibold' : ''}`}
    >
      {icon}
      <span className="ml-3">{children}</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-lg p-4 flex-shrink-0">
        <div className="flex items-center justify-center mb-8">
            <img src="/assets/Logo.png" alt="Lathi Logo" className="h-10 w-10 mr-2"/>
            <h1 className="text-2xl font-bold text-gray-800">LATHI</h1>
        </div>
        <nav className="space-y-2">
            <SideNavLink to="/admin" icon={<FiBox className="h-5 w-5" />}>Products</SideNavLink>
            <SideNavLink to="/admin/orders" icon={<FiClipboard className="h-5 w-5" />}>Orders</SideNavLink>
            <SideNavLink to="/admin/subscribers" icon={<FiUsers className="h-5 w-5" />}>Subscribers</SideNavLink>
            <SideNavLink to="/" icon={<FiHome className="h-5 w-5" />}>Back to Home</SideNavLink>
        </nav>
      </aside>

      <main className="flex-1 p-6 sm:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your products, orders, and subscribers.</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              {editingId ? <FiEdit className="mr-3 text-indigo-600" /> : <FiPlus className="mr-3 text-indigo-600" />}
              {editingId ? 'Edit Product' : 'Add a New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full input-field" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full input-field" required>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
                    <input type="text" name="fabric" value={formData.fabric} onChange={handleInputChange} className="w-full input-field" required />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSizes.map((size) => (
                        <label key={size} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer text-sm">
                          <input type="checkbox" value={size} checked={formData.sizes.includes(size)} onChange={handleSizesChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                          <span>{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {['images', 'features', 'careInstructions'].map(field => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                      {formData[field].map((value, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type={field === 'images' ? 'url' : 'text'}
                            value={value}
                            onChange={(e) => handleArrayInputChange(e, field, index)}
                            className="flex-1 input-field"
                            placeholder={field === 'images' ? `https://example.com/image.jpg` : `Enter ${field.slice(0, -1)}`}
                            required={index === 0 && field === 'images'}
                          />
                          {formData[field].length > 1 && (
                            <button type="button" onClick={() => removeArrayField(field, index)} className="p-2 text-red-500 hover:text-red-700">
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayField(field)} className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        + Add {field.slice(0, -1)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3">
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
          
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Existing Products ({Object.keys(products).length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(products).reverse().map(([id, product]) => (
                <div key={id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl group">
                  <div className="h-56 overflow-hidden">
                    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={product.images[0]} alt={product.name} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-indigo-600 font-bold text-xl">₹{product.price}</p>
                        <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{product.color}</p>
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
      </main>
    </div>
  );
};

export default Admin;
