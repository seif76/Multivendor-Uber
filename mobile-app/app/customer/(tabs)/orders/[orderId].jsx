import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetailsPage() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get(`${BACKEND_URL}/api/customers/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch order');
      }
      setLoading(false);
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleCancel = async () => {
    if (!order || order.status !== 'pending') return;
    setCancelLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      await axios.delete(`${BACKEND_URL}/api/customers/orders/${orderId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Order Cancelled', 'Your order has been cancelled.');
      router.replace('/customer/orders');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to cancel order';
      Alert.alert('Cancel Failed', msg);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleChatWithVendor = async () => {
    if (!order) return;
    
    setChatLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/chat/order/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { chat, vendorInfo } = response.data;
      
      // Navigate to singlechat folder
      router.push({
        pathname: '/customer/singlechat/[chatId]',
        params: { 
          chatId: chat.id,
          vendorName: vendorInfo.vendorName,
          orderId: orderId
        }
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create chat';
      Alert.alert('Chat Error', msg);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f9d58" />
        <Text className="mt-4 text-primary font-semibold">Loading order...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 font-semibold mb-2">{error}</Text>
        <Pressable onPress={() => router.replace('/customer/orders')} className="bg-primary px-6 py-2 rounded-xl mt-2">
          <Text className="text-white font-bold">Back to Orders</Text>
        </Pressable>
      </View>
    );
  }
  if (!order) return null;

  // Get vendor info from the first product
  const vendorInfo = order.items?.[0]?.product?.vendor;

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      <Text className="text-2xl font-bold text-primary mb-2">Order #{order.id}</Text>
      <Text className="text-base text-gray-600 mb-2">Status: <Text className="font-semibold text-primary">{order.status}</Text></Text>
      <Text className="text-base text-gray-600 mb-2">Total: <Text className="font-bold text-green-600">EGP {parseFloat(order.total_price).toFixed(2)}</Text></Text>
      <Text className="text-base text-gray-600 mb-4">Placed: {new Date(order.createdAt).toLocaleString()}</Text>
      
      {/* Vendor Information */}
      {vendorInfo && (
        <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-100">
          <Text className="text-lg font-bold mb-2">Vendor Information</Text>
          <Text className="text-gray-800 font-semibold">{vendorInfo.name}</Text>
          <Text className="text-gray-600">{vendorInfo.phone_number}</Text>
        </View>
      )}
      
      <Text className="text-lg font-bold mb-2">Items</Text>
      <FlatList
        data={order.items}
        keyExtractor={item => item.id?.toString() || item.product_id?.toString()}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl shadow p-4 mb-3 border border-gray-100">
            <Text className="font-semibold text-gray-800">{item.product?.name || 'Product'}</Text>
            <Text className="text-gray-600">Qty: {item.quantity}</Text>
            <Text className="text-green-600 font-bold">EGP {parseFloat(item.price).toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text className="text-gray-400">No items found.</Text>}
      />
      
      {/* Action Buttons */}
      <View className="mt-6 space-y-3">
        {/* Chat with Vendor Button */}
        <Pressable
          className={`bg-blue-500 py-4 rounded-xl flex-row items-center justify-center ${chatLoading ? 'opacity-60' : ''}`}
          onPress={handleChatWithVendor}
          disabled={chatLoading}
        >
          <Ionicons name="chatbubble-outline" size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white text-center text-lg font-bold">
            {chatLoading ? 'Creating Chat...' : 'Chat with Vendor'}
          </Text>
        </Pressable>
        
        {/* Cancel Order Button */}
        {order.status === 'pending' && (
          <Pressable
            className={`bg-red-500 py-4 rounded-xl ${cancelLoading ? 'opacity-60' : ''}`}
            onPress={handleCancel}
            disabled={cancelLoading}
          >
            <Text className="text-white text-center text-lg font-bold">
              {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
} 