import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { io } from 'socket.io-client';
import DeliveryConfirmation from '../../../components/deliveryman/custom/DeliveryConfirmation';

export default function DeliverymanOrderDetailsPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deliverymanId, setDeliverymanId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const [vendor, setVendor] = useState(null);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const res = await axios.get(`${BACKEND_URL}/api/deliveryman/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setOrder(res.data.order);
      setVendor(res.data.vendor);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch order details');
      console.error('Error fetching order details:', err);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    if (orderId) {
      initializeDeliverymanSocket();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [orderId]);

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

      // Fetch initial order details
      await fetchOrderDetails();

    } catch (error) {
      console.error('Error initializing deliveryman socket:', error);
      // Still fetch order details even if socket fails
      await fetchOrderDetails();
    }
  };

  const initializeSocket = (deliverymanId, token) => {
    socketRef.current = io(BACKEND_URL, {
      auth: {
        token: token
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Deliveryman connected to socket for order details');
      setSocketConnected(true);
      // Join deliveryman room for order updates
      socketRef.current.emit('deliverymanJoin', { deliverymanId });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Deliveryman disconnected from socket');
      setSocketConnected(false);
    });

    // Listen for delivery status updates for this specific order
    socketRef.current.on('deliveryStatusUpdate', ({ orderId: updatedOrderId, status, orderDetails }) => {
      console.log('Delivery status update received for order:', updatedOrderId, status);
      
      // Only update if it's the current order
      if (parseInt(updatedOrderId) === parseInt(orderId)) {
        setOrder(prevOrder => {
          if (prevOrder) {
            return { ...prevOrder, delivery_status: status };
          }
          return prevOrder;
        });
      }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = (newStatus) => {
    console.log('Order status updated to:', newStatus);
    // The DeliveryConfirmation component handles the API call
    // We just need to update the local state
    setOrder(prevOrder => {
      if (prevOrder) {
        return { ...prevOrder, delivery_status: newStatus };
      }
      return prevOrder;
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0f9d58" />
        <Text className="text-gray-600 mt-2">Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-4">
        <Text className="text-red-600 text-lg font-semibold mb-2">Error</Text>
        <Text className="text-gray-600 text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Order not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-lg mt-4"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">← Back</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">Order #{order.id}</Text>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-xs text-gray-600">
              {socketConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Order Status */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">Order Status</Text>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
              <Text className="text-white text-sm font-semibold">{order.status?.toUpperCase()}</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600">Amount: EGP {parseFloat(order.total_price).toFixed(2)}</Text>
          <Text className="text-sm text-gray-600">Payment: {order.payment_method || 'N/A'}</Text>
          <Text className="text-xs text-gray-500 mt-2">Created: {formatDate(order.createdAt)}</Text>
        </View>

        {/* Customer Details */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Customer Details</Text>
          <View className="p-3 bg-blue-50 rounded-lg">
            <Text className="text-sm font-semibold text-blue-800">Name: {order.customer?.name || 'N/A'}</Text>
            <Text className="text-sm font-semibold text-blue-800">Phone: {order.customer?.phone_number || 'N/A'}</Text>
            <Text className="text-sm font-semibold text-blue-800">Email: {order.customer?.email || 'N/A'}</Text>
            <Text className="text-sm font-semibold text-blue-800">Address: {order?.address || 'N/A'}</Text>
          </View>
        </View>

        {/* Vendor Details */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Vendor Details</Text>
          <View className="p-3 bg-green-50 rounded-lg">
            <Text className="text-sm font-semibold text-green-800">Name: {vendor?.shop_name || 'N/A'}</Text>
            <Text className="text-sm font-semibold text-green-800">Phone: {vendor?.phone_number || 'N/A'}</Text>
            <Text className="text-sm font-semibold text-green-800">Address: {vendor?.shop_location || vendor?.address || 'N/A'}</Text>
          </View>
        </View>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">Order Items</Text>
            {order.items.map((item, index) => (
              <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-800">{item.product?.name || 'Product'}</Text>
                  <Text className="text-xs text-gray-600">Quantity: {item.quantity}</Text>
                </View>
                <Text className="text-sm font-semibold text-gray-800">EGP {parseFloat(item.price).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Delivery Confirmation */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Delivery Confirmation</Text>
          <DeliveryConfirmation 
            order={order} 
            onStatusUpdate={handleStatusUpdate}
          />
        </View>
      </ScrollView>
    </View>
  );
}
