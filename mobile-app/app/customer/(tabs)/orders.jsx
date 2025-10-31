import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useLanguage } from '../../../context/LanguageContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'history'
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const { t, isRTL } = useLanguage();

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${BACKEND_URL}/api/customers/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Expecting res.data to be an array of orders
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
    } finally {
      if (!isRefresh) setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true);
  }, [fetchOrders]);

  // Map backend order.status to progress percent & label
  const statusToProgress = (status) => {
    if (!status) return { percent: 0, label: 'Unknown' };
    const s = status.toString().toLowerCase();
    if (s.includes('cancel') || s.includes('canceled')) return { percent: 0, label: 'Cancelled' };
    if (s.includes('deliver') || s.includes('delivered')) return { percent: 100, label: 'Delivered' };
    if (s.includes('on the way') || s.includes('on_the_way') || s.includes('ontheway') || s.includes('onway') || s.includes('on_way') || s.includes('onroute')) return { percent: 80, label: 'On the Way' };
    if (s.includes('ready')) return { percent: 75, label: 'Ready' };
    if (s.includes('prepar') || s.includes('cooking') || s.includes('processing')) return { percent: 50, label: 'Preparing' };
    if (s.includes('pending') || s.includes('created')) return { percent: 25, label: 'Pending' };
    // fallback
    return { percent: 30, label: status };
  };

  // Decide if an order is "current" (active) or "history" based on status
  const isCurrentOrder = (status) => {
    if (!status) return false;
    const s = status.toString().toLowerCase();
    if (s.includes('deliver') || s.includes('delivered') || s.includes('cancel')) return false;
    return true; // anything else considered current (pending, preparing, on the way, ready...)
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'current') return isCurrentOrder(o.status);
    return !isCurrentOrder(o.status); // history
  });

  const renderOrder = ({ item }) => {
    const { percent, label } = statusToProgress(item.status);
    const imageUrl = item.vendor_image || item.image || item.store_image || null;
    const estimateText = item.eta || item.estimated_delivery || item.expected_time || 'Estimated delivery: 30 mins';
    return (
      <View
        style={{ backgroundColor: '#ffffff' }}
        className="flex-row items-start gap-4 bg-white px-4 py-3 rounded-xl shadow-sm mb-4"
      >
        <View style={{ width: 70, height: 70, borderRadius: 10, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">No Image</Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between mb-1">
            <Text className="text-base font-bold text-gray-800">Order #{item.id}</Text>
            <Text className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>

          <Text className="text-sm text-gray-600 mb-2">
            From {item.vendor_name || item.store_name || item.merchant_name || 'Vendor'}
          </Text>

          {/* Progress bar */}
          <View className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <View
              style={{ width: `${percent}%`, backgroundColor: percent === 100 ? '#16a34a' : '#4CAF50', height: '100%' }}
            />
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-sm font-semibold text-green-600">{label}</Text>
            <Text className="text-xs text-gray-500">{estimateText}</Text>
          </View>

          <Pressable
            onPress={() => router.push(`/customer/orders/${item.id}`)}
            className="bg-[#4CAF50] px-4 py-2 rounded-xl self-end mt-3"
          >
            <Text className="text-white font-bold">View Details</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#f6f8f6] px-4 pt-6" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Pressable onPress={() => { /* optional action */ }} className="p-2">
            {/* shopping cart icon to match html left icon */}
            <Text style={{ fontSize: 22 }} className="text-gray-800">🛒</Text>
          </Pressable>
        </View>

        <Text className="text-lg font-bold text-gray-800">Your Orders</Text>

        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View className="border-b border-gray-200 mb-4">
        <View className="flex-row">
          <Pressable
            onPress={() => setActiveTab('current')}
            className="flex-1 items-center pb-3 pt-4"
            style={{ borderBottomWidth: activeTab === 'current' ? 3 : 3, borderBottomColor: activeTab === 'current' ? '#4CAF50' : 'transparent' }}
          >
            <Text className="text-sm font-bold">Current Orders</Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('history')}
            className="flex-1 items-center pb-3 pt-4"
            style={{ borderBottomWidth: activeTab === 'history' ? 3 : 3, borderBottomColor: activeTab === 'history' ? '#4CAF50' : 'transparent' }}
          >
            <Text className="text-sm font-bold">Order History</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="mt-4 text-gray-700 font-semibold">Loading...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 font-semibold mb-3">{error}</Text>
          <Pressable onPress={() => fetchOrders(true)} className="bg-[#4CAF50] px-6 py-2 rounded-xl">
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 font-semibold text-lg">No orders found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} tintColor="#4CAF50" />}
        />
      )}
    </View>
  );
}
