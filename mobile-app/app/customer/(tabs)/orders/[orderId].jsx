import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';
import CustomerDeliveryConfirmation from '../../../../components/customer/custom/CustomerDeliveryConfirmation';

export default function OrderDetailsPage() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (orderId) {
      initializeCustomerSocket();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [orderId]);

  const initializeCustomerSocket = async () => {
    try {
      // Get customer token and ID
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Get customer profile to get ID
      const profileResponse = await axios.get(`${BACKEND_URL}/api/customers/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      //alert("profileResponse: " + JSON.stringify(profileResponse.data));
      
      const customerId = profileResponse.data.id;
      setCustomerId(customerId);

      // Initialize socket connection
      initializeSocket(customerId, token);

      // Fetch initial order details
      await fetchOrder();

    } catch (error) {
      console.error('Error initializing customer socket:', error);
      // Still fetch order details even if socket fails
      await fetchOrder();
    }
  };

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${BACKEND_URL}/api/customers/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch order');
    }
    setLoading(false);
  };

  const initializeSocket = (customerId, token) => {
    socketRef.current = io(BACKEND_URL, {
      auth: {
        token: token
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Customer connected to socket for order details');
      setSocketConnected(true);
      // Join customer room for order updates
      socketRef.current.emit('customerJoin', { customerId });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Customer disconnected from socket');
      setSocketConnected(false);
    });

    // Listen for delivery status updates for this specific order
    socketRef.current.on('deliveryStatusUpdate', ({ orderId: updatedOrderId, status, orderDetails }) => {
      console.log('customer delivery status update received for order:', updatedOrderId, status);
      
      // Only update if it's the current order
      if (parseInt(updatedOrderId) === parseInt(orderId)) {
        setOrder(prevOrder => {
          if (prevOrder) {
            return { 
              ...prevOrder, 
              delivery_status: orderDetails.delivery_status,
              customer_delivery_status: orderDetails.customer_delivery_status,
              status: orderDetails.status // This will be 'delivered' if final step was completed
            };
          }
          return prevOrder;
        });
      }
    });

    socketRef.current.on('error', (error) => {
      console.error('Customer socket error:', error);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Customer socket connection error:', error);
    });
  };

  const handleCancel = async () => {
    if (!order || order.status !== 'pending') return;
    setCancelLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      await axios.delete(`${BACKEND_URL}/api/customers/orders/${orderId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      //Alert.alert('Order Cancelled', 'Your order has been cancelled.');
      router.replace('/customer/orders');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to cancel order';
      //Alert.alert('Cancel Failed', msg);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleChatWithVendor = async () => {
    if (!order) return;
    
    setChatLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/chat/order/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { chat, vendorInfo } = response.data;
      
      // Navigate to singlechat folder
      router.push({
        pathname: '/customer/singlechat/[chatId]',
        params: { 
          chatId: chat.id,
          vendorName: vendorInfo.vendorName,
          orderId: orderId
        }
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create chat';
      //Alert.alert('Chat Error', msg);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCustomerStatusUpdate = (newStatus) => {
    console.log('Customer delivery status updated to:', newStatus);
    // Update the local state
    setOrder(prevOrder => {
      if (prevOrder) {
        return { ...prevOrder, customer_delivery_status: newStatus };
      }
      return prevOrder;
    });
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
        <Pressable onPress={() => router.replace('/customer/orders')} className="bg-primary px-6 py-2 rounded-xl mt-2">
          <Text className="text-white font-bold">Back to Orders</Text>
        </Pressable>
      </View>
    );
  }
  if (!order) return null;

  // Get vendor info from the first product
  const vendorInfo = order.items?.[0]?.product?.vendor;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 pt-8 pb-6">
       
        {/* Header with socket status */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-primary">Order #{order.id}</Text>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-xs text-gray-600">
              {socketConnected ? 'Online' : 'Offline'}
              
              <Pressable onPress={() => {
                setRefreshing(true);
                fetchOrder();
                setRefreshing(false);
              }}>
                <Ionicons name="refresh" size={20} color="black" />
              </Pressable>
            </Text>
          </View>
        </View>
        
        <Text className="text-base text-gray-600 mb-2">Status: <Text className="font-semibold text-primary">{order.status}</Text></Text>
        <Text className="text-base text-gray-600 mb-2">Total: <Text className="font-bold text-green-600">EGP {parseFloat(order.total_price).toFixed(2)}</Text></Text>
        <Text className="text-base text-gray-600 mb-4">Placed: {new Date(order.createdAt).toLocaleString()}</Text>
        
        {/* Vendor Information */}
        {vendorInfo && (
          <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-100">
            <Text className="text-lg font-bold mb-2">Vendor Information</Text>
            <Text className="text-gray-800 font-semibold">{vendorInfo.name}</Text>
            <Text className="text-gray-600">{vendorInfo.phone_number}</Text>
          </View>
        )}
        
        <Text className="text-lg font-bold mb-2">Items</Text>
        <View>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <View key={item.id?.toString() || item.product_id?.toString() || index} className="bg-white rounded-xl shadow p-4 mb-3 border border-gray-100">
                <Text className="font-semibold text-gray-800">{item.product?.name || 'Product'}</Text>
                <Text className="text-gray-600">Qty: {item.quantity}</Text>
                <Text className="text-green-600 font-bold">EGP {parseFloat(item.price).toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-400">No items found.</Text>
          )}
        </View>

        {/* Customer Delivery Confirmation */}
        {order.deliveryman_id && order.status === 'shipped' && (
          <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-100">
            <CustomerDeliveryConfirmation 
              isCustomer={true}
              order={order} 
              onStatusUpdate={handleCustomerStatusUpdate}
            />
          </View>
        )}
        
        {/* Action Buttons */}
        <View className="mt-6 space-y-3">
          {/* Chat with Vendor Button */}
          <Pressable
            className={`bg-blue-500 py-4 rounded-xl flex-row items-center justify-center ${chatLoading ? 'opacity-60' : ''}`}
            onPress={handleChatWithVendor}
            disabled={chatLoading}
          >
            <Ionicons name="chatbubble-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white text-center text-lg font-bold">
              {chatLoading ? 'Creating Chat...' : 'Chat with Vendor'}
            </Text>
          </Pressable>
          
          {/* Cancel Order Button */}
          {order.status === 'pending' && (
            <Pressable
              className={`bg-red-500 py-4 rounded-xl ${cancelLoading ? 'opacity-60' : ''}`}
            onPress={handleCancel}
            disabled={cancelLoading}
          >
              <Text className="text-white text-center text-lg font-bold">
                {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
              </Text>
          </Pressable>
        )}
        </View>
      </View>
    </ScrollView>
  );
} 