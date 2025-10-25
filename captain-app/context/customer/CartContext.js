import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [vendorId, setVendorId] = useState(null);
  const isMountedRef = useRef(true);
  
  // Ensure cartItems is always an array
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // Load cart and vendorId from AsyncStorage on first load
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        const savedVendorId = await AsyncStorage.getItem('cart_vendor_id');
        
        if (savedCart && isMountedRef.current) {
          const parsedCart = JSON.parse(savedCart);
          // Ensure it's an array
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          } else {
            console.warn('Initial cart data is not an array:', parsedCart);
            setCartItems([]);
          }
        }
        
        if (savedVendorId && isMountedRef.current) {
          setVendorId(Number(savedVendorId));
        }
      } catch (error) {
        console.error('Error loading initial cart:', error);
        if (isMountedRef.current) {
          setCartItems([]);
          setVendorId(null);
        }
      }
    };
    loadCart();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Save cart and vendorId when items change
  useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    if (vendorId) {
      AsyncStorage.setItem('cart_vendor_id', vendorId.toString());
    } else {
      AsyncStorage.removeItem('cart_vendor_id');
    }
  }, [cartItems, vendorId]);

  const addToCart = (product) => {
    if (!isMountedRef.current) return;
    
    console.log('Adding to cart:', product);
    console.log('Current vendorId:', vendorId);
    console.log('Product vendor_id:', product.vendor_id);
    
    if (cartItems.length === 0) {
      setVendorId(product.vendor_id);
      setCartItems([{ ...product, quantity: 1 }]);
      console.log('First item added to cart');
      return;
    }
    if (product.vendor_id !== vendorId) {
      console.log('Vendor mismatch:', product.vendor_id, 'vs', vendorId);
      Alert.alert(
        'Single Vendor Cart',
        'You can only add products from one vendor at a time. Clear your cart to add products from another vendor.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear Cart', style: 'destructive', onPress: () => clearCart() },
        ]
      );
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        console.log('Updating quantity for existing item:', product.id, 'from', existing.quantity, 'to', existing.quantity + 1);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        console.log('Adding new item to cart:', product.id);
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    if (!isMountedRef.current) return;
    
    setCartItems((prev) => {
      const newCart = prev.filter((item) => item.id !== productId);
      if (newCart.length === 0) setVendorId(null);
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (!isMountedRef.current) return;
    
    setCartItems((prev) => {
      const newCart = prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      if (newCart.length === 0) setVendorId(null);
      return newCart;
    });
  };

  const getCartItems = async () => {
    try {
      // Reload cart from AsyncStorage to ensure we have the latest data
      const savedCart = await AsyncStorage.getItem('cart');
      const savedVendorId = await AsyncStorage.getItem('cart_vendor_id');
      
      if (savedCart && isMountedRef.current) {
        const parsedCart = JSON.parse(savedCart);
        // Ensure it's an array
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          console.warn('Cart data is not an array:', parsedCart);
          setCartItems([]);
        }
      }
      
      if (savedVendorId && isMountedRef.current) {
        setVendorId(Number(savedVendorId));
      }
      
      return cartItems;
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      if (isMountedRef.current) {
        setCartItems([]);
        setVendorId(null);
      }
      return [];
    }
  };

  const clearCart = () => {
    if (!isMountedRef.current) return;
    
    setCartItems([]);
    setVendorId(null);
  };

  const total = React.useMemo(() => {
    if (!Array.isArray(safeCartItems) || safeCartItems.length === 0) {
      return 0;
    }
    
    let sum = 0;
    try {
      for (let i = 0; i < safeCartItems.length; i++) {
        const item = safeCartItems[i];
        if (item && typeof item === 'object') {
          const price = parseFloat(item.price) || 0;
          const quantity = parseInt(item.quantity) || 0;
          sum += (price * quantity);
        }
      }
      return sum;
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  }, [safeCartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems: safeCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        getCartItems,
        vendorId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
