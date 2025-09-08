import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
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
      alert("orders are :" + JSON.stringify(res.data)); 
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    initializeVendorSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeVendorSocket = async () => {
    try {
      // Get vendor token and ID
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Get vendor profile to get ID
      const profileResponse = await axios.get(`${BACKEND_URL}/api/vendor/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const vendorId = profileResponse.data.id;
      setVendorId(vendorId);

      // Initialize socket connection
      initializeSocket(vendorId, token);

      // Fetch initial orders
      await fetchOrders();

    } catch (error) {
      console.error('Error initializing vendor socket:', error);
      // Still fetch orders even if socket fails
      await fetchOrders();
    }
  };

  const initializeSocket = (vendorId, token) => {
    socketRef.current = io(BACKEND_URL, {
      auth: {
        token: token
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Vendor connected to socket for orders');
      setSocketConnected(true);
      // Join vendor room for order updates
      socketRef.current.emit('vendorJoin', { vendorId });
    });

    socketRef.current.on('newOrderForVendor', ({ orderId, vendorId: orderVendorId, customerId, status }) => {
      console.log('New order for vendor:', orderId, status);
      
      // Only handle orders for this vendor
      if (orderVendorId === vendorId) {
        // Show alert for new order
        Alert.alert(
          'New Order!',
          `Order #${orderId} has been placed. Status: ${status}`,
          [
            { text: 'View Orders', onPress: () => fetchOrders() },
            { text: 'OK', style: 'default' }
          ]
        );
        
        // Refresh orders to show the new one
        fetchOrders();
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Vendor disconnected from socket');
      setSocketConnected(false);
    });

    socketRef.current.on('error', (error) => {
      console.error('Vendor socket error:', error);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Vendor socket connection error:', error);
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setConfirmingId(orderId);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.put(
        `${BACKEND_URL}/api/vendor/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const statusMessages = {
          'confirmed': 'Order confirmed and customer notified',
          'preparing': 'Order preparation started and customer notified',
          'ready': 'Order ready for delivery and deliverymen notified'
        };
        
        Alert.alert(
          'Status Updated', 
          statusMessages[newStatus] || 'Order status updated and customer notified',
          [{ text: 'OK' }]
        );
        
        setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        console.log(`Order ${orderId} status updated to ${newStatus}`);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update order status';
      Alert.alert('Update Failed', msg);
    } finally {
      setConfirmingId(null);
    }
  };

  const renderOrder = ({ item }) => (
    <View className="bg-white rounded-2xl shadow p-5 mb-4 border border-gray-100">
      <Pressable onPress={() => router.push(`/vendor/orders/${item?.id}`)}>
        <View className="flex-row justify-between mb-2">
          <Text className="text-base font-semibold text-gray-700">Order #{item?.id}</Text>
          <Text className="text-sm text-gray-500">{new Date(item?.createdAt).toLocaleDateString()}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">Status: <Text className="font-semibold text-primary">{item?.status}</Text></Text>
          <Text className="text-lg font-bold text-green-600">EGP {parseFloat(item?.total_price).toFixed(2)}</Text>
        </View>
      </Pressable>
      
      <View className="flex-row gap-2 mt-2">
        <Pressable
          className="bg-gray-200 py-2 rounded-xl flex-1"
            onPress={() => router.push(`/vendor/orders/${item?.id}`)}
        >
          <Text className="text-primary text-center font-bold">View Order</Text>
        </Pressable>
        
        {item?.status === 'pending' && (
          <Pressable
            className="bg-green-600 py-2 rounded-xl flex-1"
            onPress={() => handleStatusUpdate(item?.id, 'confirmed')}
            disabled={confirmingId === item?.id}
          >
            {confirmingId === item?.id ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white text-center font-bold">Confirm</Text>
            )}
          </Pressable>
        )}
        
        {item?.status === 'confirmed' && (
          
          <Pressable
            className="bg-orange-600 py-2 rounded-xl flex-1"
            onPress={() => handleStatusUpdate(item?.id, 'ready')}
            disabled={confirmingId === item?.id}
          >
            {confirmingId === item?.id ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white text-center font-bold">Mark Ready</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
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
          keyExtractor={item => item?.id.toString()}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
