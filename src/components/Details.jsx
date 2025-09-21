import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiShare2, FiCheck, FiMinus, FiPlus, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { handleImageError } from '../utils/imageUtils';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import { ref, update, get } from 'firebase/database';
import { database } from '../firebase/firebase';

const Details = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart, getCartCount } = useCart();
  const auth = getAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = ref(database, `products/${id}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
          const productData = snapshot.val();
          setProduct(productData);
          setSelectedSize(productData.sizes[0] || '');
          setEditData(productData);
        } else {
          toast.error('Product not found!');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    const user = auth.currentUser;
    if (user) {
      const adminEmail = user.email?.toLowerCase();
      const isAdminUser = adminEmail?.endsWith('@admin.com') || adminEmail === 'cottonfab0001@gmail.com';
      setIsAdmin(isAdminUser);
    }
  }, [id, navigate, auth]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayEdit = (field, index, value) => {
    const newArray = [...editData[field]];
    newArray[index] = value;
    setEditData(prev => ({ ...prev, [field]: newArray }));
  };
  
  const addArrayField = (field) => {
    setEditData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };
  
  const removeArrayField = (field, index) => {
    const newArray = editData[field].filter((_, i) => i !== index);
    setEditData(prev => ({ ...prev, [field]: newArray }));
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const productRef = ref(database, `products/${id}`);
      await update(productRef, editData);
      setProduct(prev => ({ ...prev, ...editData }));
      setIsEditing(false);
      toast.success('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleEdit = () => {
    if (isEditing) {
      setEditData(product);
    }
    setIsEditing(!isEditing);
  };

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    try {
      addToCart({ id, name: product.name, price: product.price, images: product.images }, selectedSize, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    navigate('/address', { state: { item: { id, name: product.name, price: product.price, images: product.images, size: selectedSize, quantity } } });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!product) {
    return <div className="flex items-center justify-center min-h-screen">Product not found.</div>;
  }

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
                {isEditing ? <><FiX className="mr-1" /> Cancel</> : <><FiEdit2 className="mr-1" /> Edit Product</>}
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
          <Link to="/cart" className="relative p-2 text-gray-700 hover:text-indigo-600">
            <FiShoppingCart className="w-6 h-6" />
            {getCartCount() > 0 && 
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {getCartCount()}
              </span>
            }
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                <img src={product.images[selectedImageIndex]} alt={product.name} className="h-full w-full object-cover" onError={handleImageError} />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {product.images.map((image, index) => (
                  <button key={index} type="button" onClick={() => setSelectedImageIndex(index)} className={`overflow-hidden rounded-lg ${selectedImageIndex === index ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}>
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-24 w-full object-cover" onError={handleImageError} />
                  </button>
                ))}
              </div>
            </div>

            <div className="py-2">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Edit form fields */}
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-xl font-semibold text-gray-900 mt-2">₹{product.price}</p>
                  <p className="text-gray-600 mt-4">{product.description}</p>
                </>
              )}

              {/* Rest of the component code for displaying product details */}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
