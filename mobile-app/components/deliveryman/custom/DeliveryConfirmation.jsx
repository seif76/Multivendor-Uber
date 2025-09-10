import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
// import { BACKEND_URL } from '../../../config/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const DeliveryConfirmation = ({ order, onStatusUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(order.delivery_status || 'none');
  const [updating, setUpdating] = useState(false);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  
  // Sync currentStatus with order.delivery_status when it changes
  useEffect(() => {
    console.log('DeliveryConfirmation useEffect - order.delivery_status changed:', order.delivery_status);
    setCurrentStatus(order.delivery_status || 'none');
    alert("order are :" + JSON.stringify(order));  
  }, [order.delivery_status]);

  // Debug logging for component renders
  useEffect(() => {
    console.log('DeliveryConfirmation rendered for order:', order.id, 'with status:', order.delivery_status);
  }, [order.id, order.delivery_status]);
  

  const statusConfig = {
    none: { 
      title: 'Ready to Start', 
      color: 'bg-gray-500', 
      nextAction: 'deliveryman_arrived',
      nextButtonText: 'I Have Arrived',
      description: 'Press when you arrive at the vendor location'
    },
    deliveryman_arrived: { 
      title: 'Arrived at Vendor', 
      color: 'bg-blue-500', 
      nextAction: order.delivery_status === 'order_handed_over' ? 'order_received' : null, // Wait for vendor to hand over first
      nextButtonText: order.delivery_status === 'order_handed_over' ? 'I Have the Order' : null,
      description: 'Waiting for vendor to hand over the order'
    },
    order_handed_over: { 
      title: 'Order Handed Over', 
      color: 'bg-yellow-500', 
      nextAction: 'order_received',
      nextButtonText: 'I Have the Order',
      description: 'Press when you confirm you have received the order'
    },
    order_received: { 
      title: 'Order Received', 
      color: 'bg-green-500', 
      nextAction: order.payment_method === 'cash' ? 'payment_made' : null,
      nextButtonText: order.payment_method === 'cash' ? 'Payment Made' : null,
      description: order.payment_method === 'cash' 
        ? 'Press when you have paid the vendor'
        : 'Order received successfully - delivery completed'
    },
    payment_made: { 
      title: 'Payment Made', 
      color: 'bg-green-500', 
      nextAction: 'payment_confirmed',
      nextButtonText: 'Confirm Payment',
      description: 'Waiting for vendor to confirm payment'
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
     // alert("newStatus: "+ newStatus + " order.id: "+ order.id);

      const response = await axios.put(
        `${BACKEND_URL}/api/deliveryman/orders/${order.id}/delivery-status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("response: "+ JSON.stringify(response.data));

      if (response.data.success) {
        setCurrentStatus(newStatus);
        onStatusUpdate && onStatusUpdate(newStatus);
        
        const statusMessages = {
          'deliveryman_arrived': 'You have arrived at the vendor location',
          'order_handed_over': 'Order has been handed over to you',
          'payment_received': 'Payment received from customer',
          'payment_confirmed': 'Payment confirmed and delivery completed'
        };
        
        Alert.alert('Status Updated', statusMessages[newStatus] || 'Status updated successfully');
      }
    } catch (error) {
      console.error('Error updating delivery status:'+ error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const currentConfig = statusConfig[currentStatus];
  const isCashPayment = order.payment_method === 'cash';
  const showPaymentSteps = isCashPayment;
  const showPaymentConfirmation = !isCashPayment && currentStatus !== 'payment_confirmed';

  // Debug logging
  console.log('DeliveryConfirmation render - Order ID:', order.id, 'Current Status:', currentStatus, 'Order Status:', order.delivery_status);

  return (
    <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-3">Delivery Confirmation</Text>
      
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
        
        {/* Step 1: Arrived */}
        <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">1</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Arrived at Vendor
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
        {isCashPayment && (
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
        {isCashPayment && (
          <View className="flex-row items-center mb-2">
            <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
              <Text className="text-white text-xs text-center leading-6">5</Text>
            </View>
            <Text className={`text-sm ${currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              Payment Confirmed
            </Text>
          </View>
        )}

        {/* Final Step: Delivered */}
        
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

export default DeliveryConfirmation;