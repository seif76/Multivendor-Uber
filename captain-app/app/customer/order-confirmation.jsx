import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';

export default function OrderConfirmationScreen() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please log in to view order details');
        router.push('/customer/login');
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/customers/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    router.push('/customer/shop/shop');
  };

  const handleViewOrders = () => {
    router.push('/customer/orders');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007233" />
        <Text className="mt-4 text-gray-600">Loading order details...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 text-center">Order Confirmation</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Message */}
        <View className="bg-white mx-4 mt-6 rounded-2xl p-6 border border-gray-100">
          <View className="items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark" size={32} color="#22c55e" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</Text>
            <Text className="text-gray-600 text-center">
              Your order has been confirmed and payment has been processed.
            </Text>
          </View>
        </View>

        {/* Order Details */}
        {order && (
          <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="receipt-outline" size={20} color="#007233" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Order Details</Text>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Order ID</Text>
                <Text className="font-semibold text-gray-900">#{order.id}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Order Date</Text>
                <Text className="font-semibold text-gray-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Status</Text>
                <View className="bg-yellow-100 px-3 py-1 rounded-full">
                  <Text className="text-yellow-800 font-semibold text-sm">
                    {order.status || 'Processing'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Payment Method</Text>
                <Text className="font-semibold text-gray-900">Wallet Payment</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Amount</Text>
                <Text className="font-bold text-primary text-lg">
                  EGP {order.total_amount?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Shipping Address */}
        {order?.shipping_address && (
          <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="location-outline" size={20} color="#007233" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Shipping Address</Text>
            </View>
            
            <View className="space-y-2">
              <Text className="font-semibold text-gray-900">{order.shipping_address.name}</Text>
              <Text className="text-gray-600">{order.shipping_address.phone}</Text>
              <Text className="text-gray-600">{order.shipping_address.address}</Text>
              <Text className="text-gray-600">{order.shipping_address.city}</Text>
              {order.shipping_address.notes && (
                <Text className="text-gray-500 text-sm mt-2">
                  <Text className="font-medium">Notes: </Text>
                  {order.shipping_address.notes}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Order Items */}
        {order?.items && order.items.length > 0 && (
          <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="list-outline" size={20} color="#007233" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Order Items</Text>
            </View>
            
            {order.items.map((item, index) => (
              <View key={index} className="flex-row items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">{item.product?.name || 'Product'}</Text>
                  <Text className="text-sm text-gray-500">Qty: {item.quantity}</Text>
                </View>
                <Text className="font-semibold text-primary">
                  EGP {((item.product?.price || 0) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className="mx-4 mt-6 mb-8 space-y-3">
          <Pressable
            onPress={handleContinueShopping}
            className="bg-primary py-4 rounded-xl"
          >
            <Text className="text-center text-white font-bold text-lg">Continue Shopping</Text>
          </Pressable>
          
          <Pressable
            onPress={handleViewOrders}
            className="bg-white border-2 border-primary py-4 rounded-xl"
          >
            <Text className="text-center text-primary font-bold text-lg">View My Orders</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
