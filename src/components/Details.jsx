import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiShare2, FiCheck, FiMinus, FiPlus, FiEdit2, FiSave, FiX, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { handleImageError, convertGoogleDriveLink } from '../utils/imageUtils';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import { ref, update, get } from 'firebase/database';
import { database } from '../firebase/firebase';

const Details = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addToCart, getCartCount } = useCart();
  const auth = getAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const snapshot = await get(ref(database, `products/${id}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProduct(data);
          setSelectedSize(data.sizes?.[0] || '');
          setSelectedColor(data.colors?.[0] || '');
          setEditData(data);
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
      setIsAdmin(adminEmail?.endsWith('@admin.com') || adminEmail === 'cottonfab0001@gmail.com');
    }
  }, [id, navigate, auth]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await update(ref(database, `products/${id}`), editData);
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
      setEditData(product); // Reset changes if canceling
    }
    setIsEditing(!isEditing);
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
    const itemToPurchase = { ...product, id, size: selectedSize, color: selectedColor, quantity };
    navigate('/adress', { state: { item: itemToPurchase } });
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!product) return <div className="flex items-center justify-center min-h-screen">Product not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 sm:p-6">
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                <img src={convertGoogleDriveLink(editData.images?.[selectedImageIndex] || '')} alt={editData.name} className="h-full w-full object-cover object-center" onError={handleImageError} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {editData.images?.map((image, index) => (
                  <button key={index} type="button" onClick={() => setSelectedImageIndex(index)} className={`block overflow-hidden rounded-lg border ${selectedImageIndex === index ? 'ring-2 ring-indigo-500' : 'border-gray-200'}`}>
                    <img src={convertGoogleDriveLink(image)} alt={`${editData.name} ${index + 1}`} className="h-20 w-full object-cover" onError={handleImageError} />
                  </button>
                ))}
              </div>
            </div>

            <div className="py-2">
              {isEditing ? (
                <div className="space-y-4 text-sm">
                  <input name="name" value={editData.name} onChange={handleEditChange} placeholder="Product Name" className="w-full input-field" />
                  <input name="price" value={editData.price} onChange={handleEditChange} placeholder="Price" className="w-full input-field" />
                  <textarea name="description" value={editData.description} onChange={handleEditChange} placeholder="Description" rows="4" className="w-full input-field" />
                  {/* More fields... */}
                </div>
              ) : (
                <div className="space-y-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-2xl font-semibold text-indigo-600">₹{product.price}</p>
                  <p className="text-gray-600 text-sm sm:text-base">{product.description}</p>
                  
                  <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Select Size</h3>
                      <div className="flex flex-wrap gap-2">
                          {product.sizes.map(size => (
                              <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 text-sm border rounded-md ${selectedSize === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
