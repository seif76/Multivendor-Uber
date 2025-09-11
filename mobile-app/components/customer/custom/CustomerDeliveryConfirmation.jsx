import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';

const CustomerDeliveryConfirmation = ({ order, onStatusUpdate  , isCustomer }) => {
  const [currentStatus, setCurrentStatus] = useState(order.customer_delivery_status || 'none');
  const [updating, setUpdating] = useState(false);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  // alert("status order: " + JSON.stringify(order.customer_delivery_status));
  //alert("isCustomer: " + isCustomer);

  // Sync currentStatus with order.customer_delivery_status when it changes
  useEffect(() => {
    console.log('CustomerDeliveryConfirmation useEffect - order.customer_delivery_status changed:', order.customer_delivery_status);
    setCurrentStatus(order.customer_delivery_status || 'none');
  }, [order.customer_delivery_status]);

  // Debug logging for component renders
  useEffect(() => {
    console.log('CustomerDeliveryConfirmation rendered for order:', order.id, 'with status:', order.customer_delivery_status);
  }, [order.id, order.customer_delivery_status]);

  const statusConfig = {
    none: { 
      title: 'Waiting for Deliveryman', 
      color: 'bg-gray-500', 
      nextAction: !isCustomer ? "deliveryman_arrived" : null,
      nextButtonText: !isCustomer ? "Deliveryman Arrived" : null,
      description: isCustomer ? 'Waiting for deliveryman to arrive' : 'Waiting for customer to confirm delivery'
    },
    deliveryman_arrived: { 
      title: 'Deliveryman Arrived', 
      color: 'bg-blue-500', 
      nextAction: !isCustomer && order.customer_delivery_status === 'deliveryman_arrived' ? 'order_handed_over' : null, // Wait for deliveryman to hand over first
      nextButtonText: !isCustomer && order.customer_delivery_status === 'deliveryman_arrived'  ? 'I handed the Order' : null,
      description: 'Deliveryman has arrived. Waiting for order to be handed over.'
    },
    order_handed_over: { 
      title: 'Order Handed Over', 
      color: 'bg-yellow-500', 
      nextAction: isCustomer ? "order_received" : null,
      nextButtonText: isCustomer ? 'I Have Received the Order' : null,
      description: 'Press when you confirm you have received the order'
    },
    order_received: { 
      title: 'Order Received', 
      color: 'bg-green-500', 
      nextAction: isCustomer && order.payment_method === 'cash' ? 'payment_made' : null ,
      nextButtonText: isCustomer && order.payment_method === 'cash' ? 'Payment Made' : null,
      description: isCustomer && order.payment_method === 'cash' 
        ? 'Press when payment has been made'
        : 'Order received successfully - delivery completed'
    },
    payment_made: { 
      title: 'Payment Made', 
      color: 'bg-green-500', 
      nextAction: !isCustomer ? 'payment_confirmed' : null,
      nextButtonText: !isCustomer ? 'Confirm Payment' : null,
      description: 'Press to confirm that payment has been processed'
    },
    payment_confirmed: { 
      title: 'Payment Confirmed', 
      color: 'bg-green-600', 
      nextAction: null,
      nextButtonText: null,
      description: 'Payment confirmed - delivery completed'
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (updating) return;
    
    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.put(
        `${BACKEND_URL}/api/customers/orders/${order.id}/customer-delivery-status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCurrentStatus(newStatus);
        onStatusUpdate && onStatusUpdate(newStatus);
        
        const statusMessages = {
          'deliveryman_arrived': 'Deliveryman has arrived at your location',
          'order_handed_over': 'Order has been handed over to customer',
          'order_received': 'You have confirmed receiving the order',
          'payment_made': 'Payment has been processed from your wallet',
          'payment_confirmed': 'Payment confirmed and delivery completed'
        };
        
        Alert.alert('Status Updated', statusMessages[newStatus] || 'Status updated successfully');
      }
    } catch (error) {
      console.error('Error updating customer delivery status:', error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const currentConfig = statusConfig[currentStatus];
  const isWalletPayment = order.payment_method === 'wallet';
  const showPaymentSteps = isWalletPayment;

  // Debug logging
  console.log('CustomerDeliveryConfirmation render - Order ID:', order.id, 'Current Status:', currentStatus, 'Order Status:', order.customer_delivery_status);

  return (
    <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-3">Customer Delivery Confirmation</Text>
      
      {/* Order Info */}
      <View className="mb-4 p-3 bg-gray-50 rounded-lg">
        <Text className="text-sm font-semibold text-gray-700">Order #{order.id}</Text>
        <Text className="text-sm text-gray-600">Amount: EGP {parseFloat(order.total_price).toFixed(2)}</Text>
        <Text className="text-sm text-gray-600">Payment: {order.payment_method?.toUpperCase()}</Text>
        <Text className="text-sm text-gray-600">Address: {order.address}</Text>
      </View>

      {/* Status Progress */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Delivery Progress:</Text>
        
        {/* Step 1: Deliveryman Arrived */}
        <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">1</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Deliveryman Arrived
          </Text>
        </View>

        {/* Step 2: Order Handed Over */}
        <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">2</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Order Handed Over
          </Text>
        </View>

        {/* Step 3: Order Received */}
        <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">3</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Order Received
          </Text>
        </View>

        {/* Step 4: Payment Made (Wallet only) */}
        {!isWalletPayment && (
          <View className="flex-row items-center mb-2">
            <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
              <Text className="text-white text-xs text-center leading-6">4</Text>
            </View>
            <Text className={`text-sm ${currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              Payment Made
            </Text>
          </View>
        )}

        {/* Step 5: Payment Confirmed (Wallet only) */}
        {!isWalletPayment && (
          <View className="flex-row items-center mb-2">
            <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
              <Text className="text-white text-xs text-center leading-6">5</Text>
            </View>
            <Text className={`text-sm ${currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              Payment Confirmed
            </Text>
          </View>
        )}
      </View>

      {/* Current Status */}
      <View className={`p-3 rounded-lg mb-4 ${currentConfig.color}`}>
        <Text className="text-white font-semibold text-center">{currentConfig.title}</Text>
        <Text className="text-white text-sm text-center mt-1">{currentConfig.description}</Text>
      </View>

      {/* Action Button */}
      {currentConfig.nextAction && (
        <TouchableOpacity
          onPress={() => handleStatusUpdate(currentConfig.nextAction)}
          disabled={updating}
          className={`${updating ? 'bg-gray-400' : 'bg-green-600'} py-3 px-4 rounded-lg`}
        >
          <Text className="text-white font-semibold text-center">
            {updating ? 'Updating...' : currentConfig.nextButtonText}
          </Text>
        </TouchableOpacity>
      )}

      {currentStatus === 'payment_confirmed' && (
        <View className="bg-green-100 p-3 rounded-lg mt-2">
          <Text className="text-green-800 font-semibold text-center">✅ Delivery Completed Successfully!</Text>
        </View>
      )}
    </View>
  );
};

export default CustomerDeliveryConfirmation;
