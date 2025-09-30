import { useState, useEffect } from 'react';
import { CartContext } from '../hooks/useCart';

export default function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage if available
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  const [message, setMessage] = useState('');


  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product, selectedSize, quantity) => {
    setCartItems(prevItems => {
      // Check if item with same ID and size already exists in cart
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.size === selectedSize
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: selectedSize,
            quantity: quantity
          }
        ];
      }
    });
    setMessage(`${product.name} added to cart!`); 
    setTimeout(() => setMessage(''), 3000);
  };

  const removeFromCart = (itemId, size) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === itemId && item.size === size))
    );
  };

  const updateQuantity = (itemId, size, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (parseInt(String(item.price).replace(/[^0-9]/g, '')) * item.quantity),
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        message
      }}
    >
      {children}
    </CartContext.Provider>
  );
};