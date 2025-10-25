import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function VendorOrderDetailsPage() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get(`${BACKEND_URL}/api/vendor/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Order fetched: ' + JSON.stringify(res.data));
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch order');
      }
      setLoading(false);
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (status) => {
    if (!order || order.status !== 'pending') return;
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      await axios.put(
        `${BACKEND_URL}/api/vendor/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert(
        status === 'confirmed' ? 'Order Confirmed' : 'Order Rejected',
        status === 'confirmed' ? 'The order has been confirmed.' : 'The order has been rejected.'
      );
      setOrder({ ...order, status });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update order';
      Alert.alert('Action Failed', msg);
    } finally {
      setActionLoading(false);
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
        <Pressable onPress={() => router.replace('/vendor/orders')} className="bg-primary px-6 py-2 rounded-xl mt-2">
          <Text className="text-white font-bold">Back to Orders</Text>
        </Pressable>
      </View>
    );
  }
  if (!order) return null;

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      {/* Back Arrow */}
      <Pressable onPress={() => router.replace('/vendor/orders')} className="mb-4 w-10">
        <Ionicons name="arrow-back" size={24} color="#0f9d58" />
      </Pressable>
      <Text className="text-2xl font-bold text-primary mb-2">Order #{order.id}</Text>
      <Text className="text-base text-gray-600 mb-2">Status: <Text className="font-semibold text-primary">{order.status}</Text></Text>
      <Text className="text-base text-gray-600 mb-2">Total: <Text className="font-bold text-green-600">EGP {parseFloat(order.total_price).toFixed(2)}</Text></Text>
      <Text className="text-base text-gray-600 mb-4">Placed: {new Date(order.createdAt).toLocaleString()}</Text>
      {/* Customer Info */}
      <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-100">
        <Text className="text-lg font-bold mb-2 text-primary">Customer Info</Text>
        <Text className="text-base text-gray-800">Name: <Text className="font-semibold">{order.customer?.name || '-'}</Text></Text>
        <Text className="text-base text-gray-800">Phone: <Text className="font-semibold">{order.customer?.phone_number || '-'}</Text></Text>
        <Text className="text-base text-gray-800">Email: <Text className="font-semibold">{order.customer?.email || '-'}</Text></Text>
        <Text className="text-base text-gray-800">Address: <Text className="font-semibold">{order.address || '-'}</Text></Text>
      </View>
      <Text className="text-lg font-bold mb-2">Your Items</Text>
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
      {order.status === 'pending' && (
        <View className="flex-row gap-4 mt-6">
          <Pressable
            className={`flex-1 bg-primary py-4 rounded-xl ${actionLoading ? 'opacity-60' : ''}`}
            onPress={() => handleStatusChange('confirmed')}
            disabled={actionLoading}
          >
            <Text className="text-white text-center text-lg font-bold">{actionLoading ? 'Processing...' : 'Confirm Order'}</Text>
          </Pressable>
          <Pressable
            className={`flex-1 bg-red-500 py-4 rounded-xl ${actionLoading ? 'opacity-60' : ''}`}
            onPress={() => handleStatusChange('cancelled')}
            disabled={actionLoading}
          >
            <Text className="text-white text-center text-lg font-bold">{actionLoading ? 'Processing...' : 'Reject Order'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
} 