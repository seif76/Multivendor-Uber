import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { BACKEND_URL } from '../../../config/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const DeliveryConfirmation = ({ order, onStatusUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(order.delivery_status || 'none');
  const [updating, setUpdating] = useState(false);

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
      nextAction: 'order_handed_over',
      nextButtonText: 'Order Handed Over',
      description: 'Press when vendor hands over the order to you'
    },
    order_handed_over: { 
      title: 'Order Received', 
      color: 'bg-yellow-500', 
      nextAction: order.payment_method === 'cash' ? 'payment_received' : 'payment_confirmed',
      nextButtonText: order.payment_method === 'cash' ? 'Payment Received' : 'Mark as Delivered',
      description: order.payment_method === 'cash' 
        ? 'Press when you receive payment from customer'
        : 'Press when order is delivered to customer'
    },
    payment_received: { 
      title: 'Payment Received', 
      color: 'bg-green-500', 
      nextAction: 'payment_confirmed',
      nextButtonText: 'Payment Confirmed',
      description: 'Press when you confirm payment with vendor'
    },
    payment_confirmed: { 
      title: 'Delivery Complete', 
      color: 'bg-green-600', 
      nextAction: null,
      nextButtonText: null,
      description: 'Order delivery completed successfully'
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (updating) return;
    
    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.put(
        `${BACKEND_URL}/api/deliveryman/orders/${order.id}/delivery-status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
      console.error('Error updating delivery status:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const currentConfig = statusConfig[currentStatus];
  const isCashPayment = order.payment_method === 'cash';
  const showPaymentSteps = isCashPayment && currentStatus !== 'payment_confirmed';

  return (
    <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-3">Delivery Confirmation</Text>
      
      {/* Order Info */}
      <View className="mb-4 p-3 bg-gray-50 rounded-lg">
        <Text className="text-sm font-semibold text-gray-700">Order #{order.id}</Text>
        <Text className="text-sm text-gray-600">Amount: EGP {parseFloat(order.total_price).toFixed(2)}</Text>
        <Text className="text-sm text-gray-600">Payment: {order.payment_method.toUpperCase()}</Text>
        <Text className="text-sm text-gray-600">Address: {order.address}</Text>
      </View>

      {/* Status Progress */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Delivery Progress:</Text>
        
        {/* Step 1: Arrived */}
        <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'payment_received' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">1</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'payment_received' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Arrived at Vendor
          </Text>
        </View>

        {/* Step 2: Order Handed Over */}
        <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'order_handed_over' || currentStatus === 'payment_received' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">2</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'order_handed_over' || currentStatus === 'payment_received' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Order Handed Over
          </Text>
        </View>

        {/* Step 3: Payment (Cash only) */}
        {showPaymentSteps && (
          <>
            <View className="flex-row items-center mb-2">
              <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_received' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
                <Text className="text-white text-xs text-center leading-6">3</Text>
              </View>
              <Text className={`text-sm ${currentStatus === 'payment_received' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                Payment Received
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
                <Text className="text-white text-xs text-center leading-6">4</Text>
              </View>
              <Text className={`text-sm ${currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                Payment Confirmed
              </Text>
            </View>
          </>
        )}

        {/* Step 3/4: Delivered */}
        <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_confirmed' ? 'bg-green-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">{isCashPayment ? '5' : '3'}</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'payment_confirmed' ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
            Delivered
          </Text>
        </View>
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
