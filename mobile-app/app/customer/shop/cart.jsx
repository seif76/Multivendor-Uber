import React, { useContext, useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { CartContext } from '../../../context/customer/CartContext';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, total } = useContext(CartContext);
  const [localCart, setLocalCart] = useState(cartItems);

  // Reload cart when screen gains focus
  useFocusEffect(
    useCallback(() => {
      const loadCart = async () => {
        try {
          const stored = await AsyncStorage.getItem('cartItems');
          if (stored) {
            setLocalCart(JSON.parse(stored));
          } else {
            setLocalCart(cartItems);
          }
        } catch (err) {
          console.log('Error loading cart:', err);
        }
      };
      loadCart();
    }, [cartItems])
  );

  const handleCheckout = () => {
    if (localCart.length === 0) return;
    const timestamp = Date.now();
    router.replace(`/customer/checkout?t=${timestamp}`);
  };

  const itemsToRender = localCart?.length ? localCart : cartItems;

  const renderCartItem = ({ item }) => (
    <View className="flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
      {/* Product Image */}
      <View className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
        <Image
          source={{
            uri:
              item.image ||
              'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
          }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Product Info */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-primary font-bold text-sm mb-2">
          EGP {parseFloat(item.price).toFixed(2)}
        </Text>

        {/* Quantity Controls */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
          >
            <Text className="text-lg font-bold">-</Text>
          </Pressable>

          <Text className="text-base font-medium">{item.quantity}</Text>

          <Pressable
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
          >
            <Text className="text-lg font-bold">+</Text>
          </Pressable>
        </View>
      </View>

      {/* Delete Item */}
      <Pressable onPress={() => removeFromCart(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#ef4444" />
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Pressable
          onPress={() => router.push('/customer/shop/shop')}
          className="flex items-center justify-center w-12 h-12 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#0f9d58" />
        </Pressable>

        <Text className="text-xl font-bold flex-1 text-center text-gray-900">
          Shopping Cart
        </Text>

        <View className="w-12" />
      </View>

      {/* Empty Cart */}
      {itemsToRender.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-20">
          <Ionicons name="cart-outline" size={64} color="#d1d5db" />
          <Text className="mt-6 text-gray-400 font-semibold text-lg">
            Your cart is empty
          </Text>
          <Pressable
            onPress={() => router.push('/customer/shop/shop')}
            className="mt-8 bg-primary px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-bold text-base">Continue Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Cart List */}
          <FlatList
            data={itemsToRender}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCartItem}
            showsVerticalScrollIndicator={false}
            className="mb-4"
          />

          {/* Summary Section */}
          <View className="bg-white rounded-t-2xl shadow-[0_-4px_8px_-1px_rgba(0,0,0,0.05)] p-5 border-t border-gray-100">
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">Subtotal</Text>
              <Text className="text-sm font-medium">EGP {total.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-500">Delivery Fee</Text>
              <Text className="text-sm font-medium">Determined During Checkout</Text>
            </View>

            <View className="border-t border-gray-200 my-3" />

            <View className="flex-row justify-between py-2">
              <Text className="text-lg font-bold">Total</Text>
              <Text className="text-lg font-bold text-primary">
                EGP {total.toFixed(2)}
              </Text>
            </View>

            <Pressable
              onPress={handleCheckout}
              className="bg-primary mt-4 py-4 rounded-xl items-center justify-center shadow-lg shadow-primary/30"
            >
              <Text className="text-white font-bold text-lg">Confirm Order</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
