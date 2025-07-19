import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext, useState } from 'react';
import { FlatList, Pressable, Text, View, Image, Alert, ActivityIndicator } from 'react-native';
import { CartContext } from '../../../context/customer/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Not logged in', 'Please log in to place an order.');
        setLoading(false);
        return;
      }
      const items = cartItems.map(item => ({ product_id: item.id, quantity: item.quantity }));
      // You can add address or other fields as needed
      const response = await axios.post(
        `${BACKEND_URL}/api/customers/orders`,
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearCart();
      Alert.alert('Order Placed', 'Your order has been placed successfully!');
      router.push('/customer/orders');
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Unknown error';
      Alert.alert('Checkout Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View className="flex-row items-center bg-white rounded-2xl shadow mb-4 p-3 border border-gray-100">
      <Image
        source={{ uri: item.image || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80' }}
        className="w-16 h-16 rounded-xl mr-3 border"
      />
      <View className="flex-1">
        <Text className="font-bold text-base text-gray-900 mb-1" numberOfLines={1}>{item.name}</Text>
        <Text className="text-green-600 font-bold mb-1">EGP {parseFloat(item.price).toFixed(2)}</Text>
        <View className="flex-row items-center mt-1">
          <Pressable
            onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className="bg-gray-200 rounded-full w-7 h-7 items-center justify-center mr-2"
          >
            <Text className="text-lg font-bold">-</Text>
          </Pressable>
          <Text className="mx-1 text-base font-semibold">{item.quantity}</Text>
          <Pressable
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            className="bg-gray-200 rounded-full w-7 h-7 items-center justify-center ml-2"
          >
            <Text className="text-lg font-bold">+</Text>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={() => removeFromCart(item.id)} className="ml-2">
        <Ionicons name="trash-outline" size={22} color="#ef4444" />
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <Pressable onPress={() => router.push('/customer/shop/shop')} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#0f9d58" />
        </Pressable>
        <Text className="text-2xl font-bold text-primary">Your Cart</Text>
      </View>

      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-20">
          <Ionicons name="cart-outline" size={64} color="#d1d5db" />
          <Text className="mt-6 text-gray-400 font-semibold text-lg">Your cart is empty</Text>
          <Pressable
            onPress={() => router.push('/customer/shop/shop')}
            className="mt-8 bg-primary px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-bold text-base">Continue Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCartItem}
            showsVerticalScrollIndicator={false}
            className="mb-4"
          />

          {/* Summary Section */}
          <View className="bg-white rounded-2xl shadow p-5 mt-2 mb-6 border border-gray-100">
            <View className="flex-row justify-between mb-2">
              <Text className="text-lg font-semibold text-gray-700">Total</Text>
              <Text className="text-lg font-bold text-green-600">EGP {total.toFixed(2)}</Text>
            </View>
            <Pressable
              className={`bg-primary py-4 rounded-xl mt-4 ${loading ? 'opacity-60' : ''}`}
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-white font-bold text-lg">Checkout</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
