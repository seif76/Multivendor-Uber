import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';

const statusConfig = {
  pending: {
    color: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'time-outline',
    title: 'Order Pending',
    description: 'Your order is being reviewed'
  },
  confirmed: {
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: 'checkmark-circle-outline',
    title: 'Order Confirmed',
    description: 'Your order has been confirmed'
  },
  preparing: {
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: 'restaurant-outline',
    title: 'Preparing',
    description: 'Your order is being prepared'
  },
  ready: {
    color: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    icon: 'checkmark-done-outline',
    title: 'Ready for Delivery',
    description: 'Your order is ready and waiting for delivery'
  },
  shipped: {
    color: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: 'car-outline',
    title: 'Out for Delivery',
    description: 'Your order is on the way'
  },
  delivered: {
    color: 'bg-green-100',
    textColor: 'text-green-800',
    icon: 'checkmark-done-circle',
    title: 'Delivered',
    description: 'Your order has been delivered'
  },
  cancelled: {
    color: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'close-circle-outline',
    title: 'Order Cancelled',
    description: 'Your order has been cancelled'
  }
};

export default function OrderTrackingCard({ order, onStatusUpdate, onDismiss }) {
  const [currentOrder, setCurrentOrder] = useState(order);
    const [chatLoading, setChatLoading] = useState(false);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const handleViewDetails = () => {
    router.push(`/customer/orders/${currentOrder.id}`);
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(currentOrder.id);
    }
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const config = getStatusConfig(currentOrder.status);

  const handleChatWithVendor = async () => {
    if (!currentOrder) return;
    
    setChatLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/chat/order/${currentOrder.id}`,
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
          orderId: currentOrder.id
        }
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create chat';
      Alert.alert('Chat Error', msg);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <View className="mx-4 mb-4 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full ${config.color.replace('bg-', 'bg-').replace('-100', '-500')}`} />
          <Text className="ml-2 font-semibold text-gray-800">Order #{currentOrder.id}</Text>
        </View>
        <Pressable onPress={handleDismiss} className="p-1">
          <Ionicons name="close" size={20} color="#6b7280" />
        </Pressable>
      </View>

      {/* Status Section */}
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Ionicons name={config.icon} size={24} color={config.textColor.replace('text-', '#')} />
          <View className="ml-3 flex-1">
            <Text className={`font-bold text-lg ${config.textColor}`}>
              {config.title}
            </Text>
            <Text className="text-gray-600 text-sm">
              {config.description}
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="font-semibold text-gray-800 mb-2">Order Summary</Text>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Total Items:</Text>
            <Text className="font-semibold">{currentOrder.items?.length || 0}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Total Price:</Text>
            <Text className="font-semibold text-primary">${currentOrder.total_price}</Text>
          </View>
          {currentOrder.address && (
            <View className="mt-2">
              <Text className="text-gray-600 text-xs">Delivery Address:</Text>
              <Text className="text-gray-800 text-xs">{currentOrder.address}</Text>
            </View>
          )}
          
          {/* Deliveryman Information */}
          {currentOrder.deliveryman && (
            <View className="mt-3 p-3 bg-blue-50 rounded-lg">
              <Text className="text-blue-800 font-semibold text-sm mb-2">Deliveryman Assigned</Text>
              <Text className="text-blue-700 text-xs">Name: {currentOrder.deliveryman.name}</Text>
              <Text className="text-blue-700 text-xs">Phone: {currentOrder.deliveryman.phone_number}</Text>
              {currentOrder.deliveryman.delivery_vehicle && (
                <Text className="text-blue-700 text-xs">
                  Vehicle: {currentOrder.deliveryman.delivery_vehicle.make} {currentOrder.deliveryman.delivery_vehicle.model} ({currentOrder.deliveryman.delivery_vehicle.license_plate})
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3 ">
          <Pressable 
            onPress={handleViewDetails}
            className="flex-1 bg-primary mr-4 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">View Details</Text>
          </Pressable>
          
          {/* Chat with Vendor Button */}
          <Pressable 
            onPress={handleChatWithVendor}
            disabled={chatLoading}
            className={`flex-1 bg-blue-500 py-3 rounded-lg flex-row items-center justify-center ${chatLoading ? 'opacity-60' : ''}`}
          >
            <Ionicons name="chatbubble-outline" size={16} color="white" style={{ marginRight: 4 }} />
            <Text className="text-white text-center font-semibold text-sm">
              {chatLoading ? '...' : 'Chat'}
            </Text>
          </Pressable>
          
          {currentOrder.status === 'delivered' && (
            <Pressable 
              onPress={() => {
                Alert.alert('Rate Order', 'Would you like to rate this order?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Rate', onPress: () => router.push(`/customer/orders/${currentOrder.id}`) }
                ]);
              }}
              className="flex-1 bg-gray-200 py-3 rounded-lg"
            >
              <Text className="text-gray-800 text-center font-semibold">Rate Order</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
} 