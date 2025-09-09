import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${BACKEND_URL}/api/customers/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
    }
    if (!isRefresh) setLoading(false);
    if (isRefresh) setRefreshing(false);
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true);
  }, [fetchOrders]);

  const renderOrder = ({ item }) => (
    <View className="bg-white rounded-2xl shadow p-5 mb-4 border border-gray-100">
      <View className="flex-row justify-between mb-2">
        <Text className="text-base font-semibold text-gray-700">Order #{item.id}</Text>
        <Text className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm text-gray-600">
          Status: <Text className="font-semibold text-primary">{item.status}</Text>
        </Text>
        <Text className="text-lg font-bold text-green-600">
          EGP {parseFloat(item.total_price).toFixed(2)}
        </Text>
      </View>
      <Pressable
        className="bg-primary px-4 py-2 rounded-xl self-end"
        onPress={() => router.push(`/customer/orders/${item.id}`)}
      >
        <Text className="text-white font-bold">View Order</Text>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      <Text className="text-2xl font-bold text-primary mb-6">My Orders</Text>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0f9d58" />
          <Text className="mt-4 text-primary font-semibold">Loading orders...</Text>
        </View>

      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 font-semibold mb-2">{error}</Text>
          <Pressable onPress={() => onRefresh()} className="bg-primary px-6 py-2 rounded-xl mt-2">
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 font-semibold text-lg">You have no orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id.toString()}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0f9d58']}
              tintColor="#0f9d58"
            />
          }
        />
      )}
    </View>
  );
}
