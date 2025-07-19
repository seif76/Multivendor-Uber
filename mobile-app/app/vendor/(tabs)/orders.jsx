import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${BACKEND_URL}/api/vendor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirm = async (orderId) => {
    setConfirmingId(orderId);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      await axios.put(
        `${BACKEND_URL}/api/vendor/orders/${orderId}/status`,
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Order Confirmed', 'The order has been confirmed.');
      setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o));
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to confirm order';
      Alert.alert('Confirm Failed', msg);
    } finally {
      setConfirmingId(null);
    }
  };

  const renderOrder = ({ item }) => (
    <Pressable
      className="bg-white rounded-2xl shadow p-5 mb-4 border border-gray-100"
      onPress={() => router.push(`/vendor/orders/${item.id}`)}
    >
      <View className="flex-row justify-between mb-2">
        <Text className="text-base font-semibold text-gray-700">Order #{item.id}</Text>
        <Text className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm text-gray-600">Status: <Text className="font-semibold text-primary">{item.status}</Text></Text>
        <Text className="text-lg font-bold text-green-600">EGP {parseFloat(item.total_price).toFixed(2)}</Text>
      </View>
      <Pressable
        className="bg-gray-200 py-2 rounded-xl mt-2"
        onPress={() => router.push(`/vendor/orders/${item.id}`)}
      >
        <Text className="text-primary text-center font-bold">View Order</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-primary">Orders</Text>
        <Pressable onPress={fetchOrders} className="bg-primary px-4 py-2 rounded-xl">
          <Text className="text-white font-bold">Refresh</Text>
        </Pressable>
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0f9d58" />
          <Text className="mt-4 text-primary font-semibold">Loading orders...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 font-semibold mb-2">{error}</Text>
          <Pressable onPress={fetchOrders} className="bg-primary px-6 py-2 rounded-xl mt-2">
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 font-semibold text-lg">No orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id.toString()}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
