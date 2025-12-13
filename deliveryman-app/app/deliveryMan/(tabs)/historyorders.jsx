import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DeliveryHistoryOrders() {
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // Fetch only HISTORY orders (delivered/cancelled)
      const res = await axios.get(`${BACKEND_URL}/api/deliveryman/orders?type=history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistoryOrders(res.data.orders || []);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="gray" className="mt-10" />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-800">Past Orders</Text>
        <Text className="text-xs text-gray-500">History of completed deliveries</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {historyOrders.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons name="time-outline" size={64} color="#ccc" />
            <Text className="text-gray-500 mt-4">No order history yet.</Text>
          </View>
        ) : (
          historyOrders.map((order) => (
            <TouchableOpacity 
            key={order.id} 
            className="bg-white rounded-xl p-4 mb-3 border-l-4 border-gray-400 opacity-80"
            onPress={() => router.push(`/deliveryMan/orders/${order.id}`)}
            >
              <View className="flex-row justify-between mb-1">
                <Text className="font-bold text-gray-600">Order #{order.id}</Text>
                <Text className={`text-xs font-bold ${order.status === 'delivered' ? 'text-green-600' : 'text-red-500'}`}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
              <Text className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</Text>
              <Text className="text-xs text-gray-800 mt-2">EGP {order.total_price}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}