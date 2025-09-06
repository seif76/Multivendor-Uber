import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

export default function DeliverymanOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      // This would be the actual endpoint for deliveryman orders
      // const res = await axios.get(`${BACKEND_URL}/api/deliveryman/orders`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      
      // Mock data for now
      const mockOrders = [
        {
          id: 1,
          order_number: 'ORD-001',
          customer_name: 'Ahmed Mohamed',
          customer_phone: '01012345678',
          pickup_address: '123 Main St, Cairo',
          delivery_address: '456 Oak Ave, Giza',
          total_amount: 45.50,
          delivery_fee: 15.00,
          status: 'pending',
          created_at: new Date().toISOString(),
          items: [
            { name: 'Pizza Margherita', quantity: 2, price: 15.00 },
            { name: 'Coca Cola', quantity: 1, price: 3.50 }
          ]
        },
        {
          id: 2,
          order_number: 'ORD-002',
          customer_name: 'Sara Ali',
          customer_phone: '01087654321',
          pickup_address: '789 Pine St, Alexandria',
          delivery_address: '321 Elm St, Alexandria',
          total_amount: 32.00,
          delivery_fee: 12.00,
          status: 'accepted',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          items: [
            { name: 'Burger Deluxe', quantity: 1, price: 20.00 }
          ]
        }
      ];
      
      setOrders(mockOrders);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setAcceptingId(orderId);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      // This would be the actual endpoint for accepting orders
      // await axios.put(
      //   `${BACKEND_URL}/api/deliveryman/orders/${orderId}/accept`,
      //   {},
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      Alert.alert('Order Accepted', 'You have successfully accepted the delivery order.');
      setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'accepted' } : o));
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to accept order';
      Alert.alert('Accept Failed', msg);
    } finally {
      setAcceptingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'picked_up': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOrder = ({ item }) => (
    <Pressable
      className="bg-white rounded-2xl shadow p-5 mb-4 border border-gray-100"
      onPress={() => router.push(`/deliveryMan/orders/${item.id}`)}
    >
      <View className="flex-row justify-between mb-3">
        <Text className="text-lg font-semibold text-gray-800">{item.order_number}</Text>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-semibold capitalize">{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
      
      <View className="mb-3">
        <Text className="text-sm text-gray-600 mb-1">Customer: {item.customer_name}</Text>
        <Text className="text-sm text-gray-600 mb-1">Phone: {item.customer_phone}</Text>
        <Text className="text-sm text-gray-600 mb-1">Pickup: {item.pickup_address}</Text>
        <Text className="text-sm text-gray-600">Delivery: {item.delivery_address}</Text>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-sm text-gray-600">Total Amount</Text>
          <Text className="text-lg font-bold text-green-600">${item.total_amount.toFixed(2)}</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-600">Delivery Fee</Text>
          <Text className="text-lg font-bold text-blue-600">${item.delivery_fee.toFixed(2)}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-500">
          {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
        </Text>
        
        {item.status === 'pending' && (
          <Pressable
            className="bg-blue-600 px-4 py-2 rounded-xl"
            onPress={() => handleAcceptOrder(item.id)}
            disabled={acceptingId === item.id}
          >
            {acceptingId === item.id ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-bold text-sm">Accept</Text>
            )}
          </Pressable>
        )}
        
        {item.status !== 'pending' && (
          <Pressable
            className="bg-gray-200 px-4 py-2 rounded-xl"
            onPress={() => router.push(`/deliveryMan/orders/${item.id}`)}
          >
            <Text className="text-gray-700 font-bold text-sm">View Details</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-blue-600">Delivery Orders</Text>
        <Pressable onPress={fetchOrders} className="bg-blue-600 px-4 py-2 rounded-xl">
          <FontAwesome name="refresh" size={16} color="white" />
        </Pressable>
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-blue-600 font-semibold">Loading orders...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 font-semibold mb-2">{error}</Text>
          <Pressable onPress={fetchOrders} className="bg-blue-600 px-6 py-2 rounded-xl mt-2">
            <Text className="text-white font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <FontAwesome name="truck" size={48} color="#d1d5db" />
          <Text className="text-gray-400 font-semibold text-lg mt-4">No orders available</Text>
          <Text className="text-gray-400 text-center mt-2">
            New delivery orders will appear here when available
          </Text>
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
