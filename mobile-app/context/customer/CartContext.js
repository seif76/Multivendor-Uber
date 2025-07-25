import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [vendorId, setVendorId] = useState(null);

  // Load cart and vendorId from AsyncStorage on first load
  useEffect(() => {
    const loadCart = async () => {
      const savedCart = await AsyncStorage.getItem('cart');
      const savedVendorId = await AsyncStorage.getItem('cart_vendor_id');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedVendorId) setVendorId(Number(savedVendorId));
    };
    loadCart();
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
    if (cartItems.length === 0) {
      setVendorId(product.vendor_id);
      setCartItems([{ ...product, quantity: 1 }]);
      return;
    }
    if (product.vendor_id !== vendorId) {
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
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const newCart = prev.filter((item) => item.id !== productId);
      if (newCart.length === 0) setVendorId(null);
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((prev) => {
      const newCart = prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      if (newCart.length === 0) setVendorId(null);
      return newCart;
    });
  };

  const getCartItems = () => {
    return cartItems;
  };

  const clearCart = () => {
    setCartItems([]);
    setVendorId(null);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
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
