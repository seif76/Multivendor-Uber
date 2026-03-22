import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function VendorOrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const limit = 10;

  const fetchOrders = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await axios.get(`${BACKEND_URL}/api/vendor/orders/history?page=${pageNum}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newOrders = res.data.orders || [];
      const total = res.data.totalPages || 1;

      setOrders(reset ? newOrders : prev => [...prev, ...newOrders]);
      setTotalPages(total);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchOrders(1, true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(1, true);
  };

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    fetchOrders(page + 1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'shipped':   return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default:          return 'bg-gray-100 text-gray-700';
    }
  };

  const renderOrder = ({ item }) => (
    <View className="bg-white rounded-2xl  p-5 mb-4 border border-gray-100">
      <View className="flex-row justify-between mb-2">
        <Text className="text-base font-semibold text-gray-700">Order #{item?.id}</Text>
        <Text className="text-sm text-gray-500">{new Date(item?.createdAt).toLocaleDateString()}</Text>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <View className={`px-2.5 py-1 rounded-full ${getStatusColor(item?.status)}`}>
          <Text className="text-xs font-semibold capitalize">{item?.status}</Text>
        </View>
        <Text className="text-lg font-bold text-green-600">EGP {parseFloat(item?.total_price).toFixed(2)}</Text>
      </View>

      <Text className="text-sm text-gray-600 mb-1">Payment: {item?.payment_method?.toUpperCase()}</Text>

      {item?.deliveryman && (
        <View className="mt-2 p-2 bg-gray-50 rounded-lg">
          <Text className="text-xs text-gray-500">Delivered by: {item.deliveryman.name}</Text>
        </View>
      )}

      <Pressable
        className="bg-gray-100 py-2 rounded-xl mt-3"
        onPress={() => router.push(`/vendor/orders/${item?.id}`)}
      >
        <Text className="text-primary text-center font-bold">View Details</Text>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      <Text className="text-2xl font-bold text-primary mb-6">Order History</Text>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0f9d58" />
          <Text className="mt-4 text-primary font-semibold">Loading history...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 font-semibold mb-2">{error}</Text>
          <Pressable onPress={() => fetchOrders(1, true)} className="bg-primary px-6 py-2 rounded-xl mt-2">
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 font-semibold text-lg">No order history.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item?.id.toString()}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0f9d58']} />}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#0f9d58" className="py-4" />
            ) : page >= totalPages ? (
              <Text className="text-center text-gray-400 text-xs py-4">No more orders</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}