import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';
import { io } from 'socket.io-client';
import DeliveryConfirmation from './DeliveryConfirmation';

export default function DeliveryOrderManager() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [deliverymanId, setDeliverymanId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

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

    } catch (error) {
      console.error('Error initializing deliveryman socket:', error);
    }
  };

  const initializeSocket = (deliverymanId, token) => {
    socketRef.current = io(BACKEND_URL, {
      auth: {
        token: token
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Deliveryman connected to socket');
      setSocketConnected(true);
      // Join deliveryman room for order updates
      socketRef.current.emit('deliverymanJoin', { deliverymanId });
    });

    socketRef.current.on('newDeliveryOrder', ({ orderId, deliverymanId: orderDeliverymanId, customerId, status, orderDetails }) => {
      console.log('New delivery order:', orderId, status);
      
      // Add to available orders
      setAvailableOrders(prevOrders => {
        // Check if order already exists
        const exists = prevOrders.some(order => order.id === orderId);
        if (!exists) {
          return [orderDetails, ...prevOrders];
        }
        return prevOrders;
      });
      
      // Show alert for new delivery order
      Alert.alert(
        'New Delivery Order!',
        `Order #${orderId} is ready for delivery. Customer: ${orderDetails.customer.name}`,
        [
          { text: 'View Orders', onPress: () => console.log('View orders') },
          { text: 'OK', style: 'default' }
        ]
      );
    });

    // Listen for delivery status updates
    socketRef.current.on('deliveryStatusUpdate', ({ orderId, status, orderDetails }) => {
      console.log('Delivery status update received:', orderId, status);
      
      // Update accepted orders with new delivery status
      setAcceptedOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, delivery_status: status }
          : order
      ));
      
      // Show notification for important status changes
      const statusMessages = {
        'deliveryman_arrived': `You have arrived for order #${orderId}`,
        'order_handed_over': `Order #${orderId} has been handed over to you`,
        'payment_received': `Payment received for order #${orderId}`,
        'payment_confirmed': `Order #${orderId} delivery completed successfully!`
      };
      
      if (statusMessages[status]) {
        Alert.alert('Status Update', statusMessages[status]);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Deliveryman disconnected from socket');
      setSocketConnected(false);
    });

    socketRef.current.on('error', (error) => {
      console.error('Deliveryman socket error:', error);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Deliveryman socket connection error:', error);
    });
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.put(`${BACKEND_URL}/api/deliveryman/orders/${orderId}/accept`, {
        deliverymanId: deliverymanId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Find the order being accepted
        const acceptedOrder = availableOrders.find(order => order.id === orderId);
        
        // Remove from available orders and add to accepted orders
        setAvailableOrders(prevOrders => 
          prevOrders.filter(order => order.id !== orderId)
        );
        
        // Add to accepted orders with accepted status
        if (acceptedOrder) {
          setAcceptedOrders(prevAccepted => [
            { ...acceptedOrder, status: 'shipped', acceptedAt: new Date().toISOString() },
            ...prevAccepted
          ]);
        }
        
        Alert.alert('Order Accepted', 'You have accepted the delivery order!');
        console.log('Delivery order accepted:', orderId);
      }
    } catch (error) {
      console.error('Error accepting delivery order:', error);
      Alert.alert('Error', 'Failed to accept delivery order');
    }
  };

  const handleRejectOrder = (orderId) => {
    // Remove from available orders
    setAvailableOrders(prevOrders => 
      prevOrders.filter(order => order.id !== orderId)
    );
    
    Alert.alert('Order Rejected', 'Order has been rejected');
    console.log('Delivery order rejected:', orderId);
  };

  const handleClearAcceptedOrders = () => {
    Alert.alert(
      'Clear Accepted Orders',
      'Are you sure you want to clear all accepted orders?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => setAcceptedOrders([])
        }
      ]
    );
  };

  // Only show component if there are available orders or accepted orders
  if (availableOrders.length === 0 && acceptedOrders.length === 0) {
    return null; // Don't render anything if no orders
  }

  return (
    <View className="mb-4">
      {/* Connection Status */}
      <View className="px-4 mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-800">Delivery Orders</Text>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-xs text-gray-600">
              {socketConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-600">Real-time delivery notifications</Text>
      </View>
      
      {/* Available Orders */}
      {availableOrders.length > 0 && (
        <View className="mb-4">
          <Text className="text-md font-semibold text-gray-700 px-4 mb-2">Available Orders</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {availableOrders.map((order) => (
              <View key={order.id} className="w-80 my-4 mr-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">Order #{order.id}</Text>
                    <Text className="text-sm text-gray-600">Amount: EGP {parseFloat(order.total_price).toFixed(2)}</Text>
                    
                    {/* Customer Details */}
                    <View className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <Text className="text-sm font-semibold text-blue-800">Customer Details</Text>
                      <Text className="text-xs text-blue-700">Name: {order.customer.name}</Text>
                      <Text className="text-xs text-blue-700">Phone: {order.customer.phone_number}</Text>
                      <Text className="text-xs text-blue-700">Address: {order?.address}</Text>
                    </View>
                    
                    {/* Vendor Details */}
                    <View className="mt-2 p-2 bg-green-50 rounded-lg">
                      <Text className="text-sm font-semibold text-green-800">Vendor Details</Text>
                      <Text className="text-xs text-green-700">Name: {order.vendor.name}</Text>
                      <Text className="text-xs text-green-700">Phone: {order.vendor.phone_number}</Text>
                      <Text className="text-xs text-green-700">Address: {order.vendor.address}</Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={() => handleAcceptOrder(order.id)}
                    className="bg-green-600 px-4 py-2 rounded-lg flex-1 mr-2"
                  >
                    <Text className="text-white font-semibold text-center">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRejectOrder(order.id)}
                    className="bg-red-600 px-4 py-2 rounded-lg flex-1 ml-2"
                  >
                    <Text className="text-white font-semibold text-center">Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Accepted Orders */}
      {acceptedOrders.length > 0 && (
        <View className="mb-4">
          <View className="flex-row justify-between items-center px-4 mb-2">
            <Text className="text-md font-semibold text-gray-700">Your Accepted Orders</Text>
            <TouchableOpacity
              onPress={handleClearAcceptedOrders}
              className="bg-gray-500 px-3 py-1 rounded-lg"
            >
              <Text className="text-white text-xs font-semibold">Clear All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {acceptedOrders.map((order) => (
              <View key={order.id} className="w-80 my-4 mr-4 bg-green-50 rounded-xl shadow-sm border border-green-200 p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-lg font-bold text-gray-800">Order #{order.id}</Text>
                      <View className="bg-green-600 px-2 py-1 rounded-full ml-2">
                        <Text className="text-white text-xs font-bold">ACCEPTED</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600">Amount: EGP {parseFloat(order.total_price).toFixed(2)}</Text>
                    
                    {/* Customer Details */}
                    <View className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <Text className="text-sm font-semibold text-blue-800">Customer Details</Text>
                      <Text className="text-xs text-blue-700">Name: {order.customer.name}</Text>
                      <Text className="text-xs text-blue-700">Phone: {order.customer.phone_number}</Text>
                      <Text className="text-xs text-blue-700">Address: {order.customer.address}</Text>
                    </View>
                    
                    {/* Vendor Details */}
                    <View className="mt-2 p-2 bg-green-50 rounded-lg">
                      <Text className="text-sm font-semibold text-green-800">Vendor Details</Text>
                      <Text className="text-xs text-green-700">Name: {order.vendor.name}</Text>
                      <Text className="text-xs text-green-700">Phone: {order.vendor.phone_number}</Text>
                      <Text className="text-xs text-green-700">Address: {order.vendor.address}</Text>
                    </View>
                    
                    <Text className="text-xs text-green-600 mt-2">
                      Accepted: {new Date(order.acceptedAt).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <DeliveryConfirmation 
                  order={order} 
                  onStatusUpdate={(newStatus) => {
                    setAcceptedOrders(prev => prev.map(o => 
                      o.id === order.id ? { ...o, delivery_status: newStatus } : o
                    ));
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
