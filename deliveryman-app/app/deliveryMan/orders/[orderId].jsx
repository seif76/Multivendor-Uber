import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import DeliveryConfirmation from '../../../components/deliveryman/custom/DeliveryConfirmation';
import CustomerDeliveryConfirmation from '../../../components/customer/custom/CustomerDeliveryConfirmation';
import { useDeliverySocket } from '../../../context/Deliveryman/DeliverySocketContext';
import { formatCurrency } from '../../../utlis/currency';

export default function DeliverymanOrderDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [vendor, setVendor] = useState(null);
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const [localOrder, setLocalOrder] = useState(null);


  const { acceptedOrders, socketConnected } = useDeliverySocket();
  const contextOrder = acceptedOrders.find(o => parseInt(o.id) === parseInt(orderId)) || null;
  const order = contextOrder || localOrder; // ← use context if available, else local


  const fetchVendor = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${BACKEND_URL}/api/deliveryman/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      //alert(JSON.stringify(res.data));
      setVendor(res.data.vendor ? { ...res.data.vendor } : null);
      setLocalOrder({ ...res.data.order });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchVendor();
  }, [orderId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVendor(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':   return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'ready':     return 'bg-green-500';
      case 'shipped':   return 'bg-purple-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-500';
      default:          return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
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
        <TouchableOpacity onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-lg">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Order not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-lg mt-4">
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
            <Text className="text-xs text-gray-600">{socketConnected ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
          <Text className="text-sm text-gray-600">Amount: {formatCurrency(order.total_price || '0')} </Text>
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
              <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-800">{item.product?.name || 'Product'}</Text>
                  <Text className="text-xs text-gray-600">Quantity: {item.quantity}</Text>
                </View>
                <Text className="text-sm font-semibold text-gray-800">{formatCurrency(item.price || '0')} </Text>
              </View>
            ))}
          </View>
        )}

        {/* Delivery Confirmation — vendor ↔ deliveryman */}
        <DeliveryConfirmation
          key={`delivery-${order.id}-${order.delivery_status}`}
          order={order}
          onStatusUpdate={() => {}}
        />

        {/* Customer Delivery Confirmation — customer ↔ deliveryman */}
        {order.status === 'shipped' && (
          <CustomerDeliveryConfirmation
            key={`customer-${order.id}-${order.customer_delivery_status}`}
            isCustomer={false}
            order={order}
            onStatusUpdate={() => {}}
          />
        )}

      </ScrollView>
    </View>
  );
}