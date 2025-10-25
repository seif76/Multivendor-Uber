import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext } from 'react';
import { FlatList, Pressable, Text, View, Image } from 'react-native';
import { CartContext } from '../../../context/customer/CartContext';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, total } = useContext(CartContext);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    // Force reload of checkout page by adding timestamp
    const timestamp = Date.now();
    router.replace(`/customer/checkout?t=${timestamp}`);
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
        <View>
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
              className="bg-primary py-4 rounded-xl mt-4"
              onPress={handleCheckout}
            >
              <Text className="text-center text-white font-bold text-lg">Place Order</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
