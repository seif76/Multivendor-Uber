import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { io } from 'socket.io-client';
import { DeliverymanAuthContext } from '../../../context/DeliverymanAuthContext';

export default function DeliverymanOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deliverymanId, setDeliverymanId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
 // const [vendor, setVendor] = useState(null);
  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const res = await axios.get(`${BACKEND_URL}/api/deliveryman/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    //  alert('Orders fetched: ' + JSON.stringify(res.data));
      
      setOrders(res.data.orders || []);
     // setVendor(res.data.vendor || null);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    initializeDeliverymanSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeDeliverymanSocket = async () => {
    try {
      // Get deliveryman token and ID
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Get deliveryman profile to get ID
      const profileResponse = await axios.get(`${BACKEND_URL}/api/deliveryman/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const deliverymanId = profileResponse.data.id;
      setDeliverymanId(deliverymanId);

      // Initialize socket connection
      initializeSocket(deliverymanId, token);

      // Fetch initial orders
      await fetchOrders();

    } catch (error) {
      console.error('Error initializing deliveryman socket:', error);
      // Still fetch orders even if socket fails
      await fetchOrders();
    }
  };

  const initializeSocket = (deliverymanId, token) => {
    socketRef.current = io(BACKEND_URL, {
      auth: {
        token: token
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Deliveryman connected to socket for orders');
      setSocketConnected(true);
      // Join deliveryman room for order updates
      socketRef.current.emit('deliverymanJoin', { deliverymanId });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Deliveryman disconnected from socket');
      setSocketConnected(false);
    });

    // Listen for new delivery orders
    socketRef.current.on('newDeliveryOrder', ({ orderId, deliverymanId: orderDeliverymanId, customerId, status, orderDetails }) => {
      console.log('New delivery order:', orderId, status);
      
      // Add to orders list
      setOrders(prevOrders => {
        // Check if order already exists
        const exists = prevOrders.some(order => order.id === orderId);
        if (!exists) {
          return [orderDetails, ...prevOrders];
        }
        return prevOrders;
      });
    });

    // Listen for delivery status updates
    socketRef.current.on('deliveryStatusUpdate', ({ orderId, status, orderDetails }) => {
      console.log('Delivery status update received:', orderId, status);
      
      // Update the order in the local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, delivery_status: status }
          : order
      ));
    });

    socketRef.current.on('error', (error) => {
      console.error('Deliveryman socket error:', error);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Deliveryman socket connection error:', error);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'none': return 'bg-gray-500';
      case 'deliveryman_arrived': return 'bg-blue-500';
      case 'order_handed_over': return 'bg-orange-500';
      case 'order_received': return 'bg-green-500';
      case 'payment_made': return 'bg-purple-500';
      case 'payment_confirmed': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0f9d58" />
        <Text className="text-gray-600 mt-2">Loading orders...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-800">My Orders</Text>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-xs text-gray-600">
              {socketConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-600">Real-time order updates</Text>
      </View>

      {error && (
        <View className="mx-4 mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <Text className="text-red-700 text-sm">{error}</Text>
        </View>
      )}

      {/* Orders List */}
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        {orders.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-lg">No orders assigned</Text>
            <Text className="text-gray-400 text-sm mt-2">Orders will appear here when assigned to you</Text>
          </View>
        ) : (
          orders?.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push(`/deliveryMan/orders/${order.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">Order #{order.id}</Text>
                  <Text className="text-sm text-gray-600">Amount: EGP {parseFloat(order.total_price).toFixed(2)}</Text>
                  <Text className="text-xs text-gray-500 mt-1">Created: {formatDate(order.createdAt)}</Text>
                </View>
                <View className="flex-row space-x-2">
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    <Text className="text-white text-xs font-semibold">{order.status?.toUpperCase()}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${getDeliveryStatusColor(order.delivery_status)}`}>
                    <Text className="text-white text-xs font-semibold">{order.delivery_status?.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              {/* Customer Details */}
              <View className="mb-3 p-2 bg-blue-50 rounded-lg">
                <Text className="text-sm font-semibold text-blue-800">Customer</Text>
                <Text className="text-xs text-blue-700">Name: {order.customer?.name || 'N/A'}</Text>
                <Text className="text-xs text-blue-700">Phone: {order.customer?.phone_number || 'N/A'}</Text>
                <Text className="text-xs text-blue-700">Address: {order?.address || 'N/A'}</Text>
              </View>

              {/* Vendor Details */}
              <View className="mb-3 p-2 bg-green-50 rounded-lg">
                <Text className="text-sm font-semibold text-green-800">Vendor</Text>
                <Text className="text-xs text-green-700">Name: {order.vendor?.shop_name || 'N/A'}</Text>
                <Text className="text-xs text-green-700">Phone: {order.vendor?.phone_number || 'N/A'}</Text>
                <Text className="text-xs text-green-700">Address: {order.vendor?.shop_location || 'N/A'}</Text>
              </View>

              {/* Payment Method */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">
                  Payment: <Text className="font-semibold">{order.payment_method || 'N/A'}</Text>
                </Text>
                <Text className="text-xs text-gray-500">Tap to view details</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}