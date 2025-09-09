import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';
import { io } from 'socket.io-client';
import OrderTrackingCard from './OrderTrackingCard';

export default function OrderTrackingManager() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState(null);
  const socketRef = useRef(null);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    initializeOrderTracking();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeOrderTracking = async () => {
    try {
      // Get customer token and ID
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Get customer profile to get ID
      const profileResponse = await axios.get(`${BACKEND_URL}/api/customers/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const customerId = profileResponse.data.id;
      setCustomerId(customerId);

      // Fetch active orders
      await fetchActiveOrders(token);

      // Initialize socket connection
      initializeSocket(customerId);

    } catch (error) {
      console.error('Error initializing order tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveOrders = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/customers/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter for active orders (not delivered or cancelled)
      const activeOrders = response.data.filter(order => 
        !['delivered', 'cancelled'].includes(order.status)
      );
    //  alert("active orders are :" + JSON.stringify(activeOrders));

      setActiveOrders(activeOrders);
    } catch (error) {
      console.error('Error fetching active orders:', error);
    }
  };

  const initializeSocket = (customerId) => {
    // Get token for authentication
    const getToken = async () => {
      try {
        return await AsyncStorage.getItem('token');
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    };

    // Connect to socket server with authentication
    const connectSocket = async () => {
      const token = await getToken();
      if (!token) {
        console.error('No token available for socket connection');
        return;
      }

      socketRef.current = io(BACKEND_URL, {
        auth: {
          token: token
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to order tracking socket');
        // Join customer room for order updates
        socketRef.current.emit('customerJoin', { customerId });
      });

      socketRef.current.on('orderStatusChanged', ({ orderId, status }) => {
        console.log('Order status changed:', orderId, status);
        
        setActiveOrders(prevOrders => {
          const updatedOrders = prevOrders.map(order => {
       //     console.log(`Checking order ${order.id} (type: ${typeof order.id}) against ${orderId} (type: ${typeof orderId}), current status: ${order.status}`);
            // Handle both string and number comparison
            if (order.id == orderId || order.id === parseInt(orderId) || order.id === orderId.toString()) {
              console.log(`Updating order ${orderId} status from ${order.status} to ${status}`);
              return { ...order, status };
            }
            return order;
          });

//          console.log('Updated orders:', updatedOrders);

          // Remove delivered/cancelled orders from active list
          const filteredOrders = updatedOrders.filter(order => 
            !['delivered', 'cancelled'].includes(order.status)
          );
          
          console.log('Filtered orders:', filteredOrders);
          return filteredOrders;
        });
      });

      socketRef.current.on('newOrderCreated', ({ orderId, customerId: newOrderCustomerId, status }) => {
        console.log('New order created:', orderId, status);
        
        // Only add to active orders if it's for this customer
        if (newOrderCustomerId === customerId) {
          // Fetch the new order details
          fetchNewOrderDetails(orderId);
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from order tracking socket');
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    };

    connectSocket();
  };

  const fetchNewOrderDetails = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/api/customers/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newOrder = response.data;
      
      // Add to active orders if it's not delivered/cancelled
      if (!['delivered', 'cancelled'].includes(newOrder.status)) {
        setActiveOrders(prevOrders => [newOrder, ...prevOrders]);
      }
    } catch (error) {
      console.error('Error fetching new order details:', error);
    }
  };

  const handleOrderDismiss = (orderId) => {
    setActiveOrders(prevOrders => 
      prevOrders.filter(order => order.id !== orderId)
    );
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    setActiveOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  if (loading) {
    return (
      <View className="p-4">
        <Text className="text-gray-600 text-center">Loading orders...</Text>
      </View>
    );
  }

  if (activeOrders.length === 0) {
    return null; // Don't show anything if no active orders
  }

  return (
    <View className="mb-4">
      <View className="px-4 mb-3">
        <Text className="text-lg font-bold text-gray-800">Active Orders</Text>
        <Text className="text-sm text-gray-600">Track your orders in real-time</Text>
      </View>
      
      <ScrollView 
        horizontal 

        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        
        {activeOrders.map((order) => (
          <View key={order.id} className="w-80 my-4 mr-4">
            <OrderTrackingCard
              order={order}
              onStatusUpdate={handleStatusUpdate}
              onDismiss={handleOrderDismiss}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
} 