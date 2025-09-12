import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
<<<<<<< HEAD
=======
import Constants from 'expo-constants';
>>>>>>> main
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';


const VendorDeliveryConfirmation = ({ order, onStatusUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(order.delivery_status || 'none');
  const [updating, setUpdating] = useState(false);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
<<<<<<< HEAD


=======
>>>>>>> main
  const handleVendorAction = async (newStatus) => {
    if (updating) return;
    
    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.put(
        `${BACKEND_URL}/api/vendor/orders/${order.id}/delivery-status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCurrentStatus(newStatus);
        onStatusUpdate && onStatusUpdate(newStatus);
        
        const statusMessages = {
          'order_handed_over': 'Order has been handed over to deliveryman',
          'payment_confirmed': 'Payment confirmed and order is on the way'
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

  const statusConfig = {
    none: { 
      title: 'Waiting for Deliveryman', 
      color: 'bg-gray-500', 
      description: 'Deliveryman is on the way to pick up the order'
    },
    deliveryman_arrived: { 
      title: 'Deliveryman Arrived', 
      color: 'bg-blue-500', 
      description: 'Deliveryman has arrived at your location',
      vendorAction: 'order_handed_over',
      vendorButtonText: 'Hand Over Order'
    },
    order_handed_over: { 
      title: 'Order Handed Over', 
      color: 'bg-yellow-500', 
      description: 'Order has been handed over to deliveryman'
    },
    order_received: { 
      title: 'Order Received', 
      color: 'bg-yellow-500', 
      description: 'Deliveryman has confirmed receiving the order'
    },
    payment_made: { 
      title: 'Payment Made', 
      color: 'bg-green-500', 
      description: 'Deliveryman has paid the payment to vendor',
      vendorAction: 'payment_confirmed',
      vendorButtonText: 'Confirm Payment'
    },
    payment_confirmed: { 
      title: 'Delivery Complete', 
      color: 'bg-green-600', 
      description: 'Order delivery completed successfully'
    }
  };

  const currentConfig = statusConfig[currentStatus];
  const isCashPayment = order.payment_method === 'cash';

  return (
    <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-3">Delivery Status</Text>
      
      {/* Order Info */}
      <View className="mb-4 p-3 bg-gray-50 rounded-lg">
        <Text className="text-sm font-semibold text-gray-700">Order #{order.id}</Text>
        <Text className="text-sm text-gray-600">Amount: EGP {parseFloat(order.total_price).toFixed(2)}</Text>
        <Text className="text-sm text-gray-600">Payment: {order.payment_method.toUpperCase()}</Text>
        {order.deliveryman && (
          <View className="mt-2">
            <Text className="text-sm font-semibold text-blue-800">Deliveryman:</Text>
            <Text className="text-sm text-blue-700">Name: {order.deliveryman.name}</Text>
            <Text className="text-sm text-blue-700">Phone: {order.deliveryman.phone_number}</Text>
            {order.deliveryman.delivery_vehicle && (
              <Text className="text-sm text-blue-700">
                Vehicle: {order.deliveryman.delivery_vehicle.make} {order.deliveryman.delivery_vehicle.model} ({order.deliveryman.delivery_vehicle.license_plate})
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Status Progress */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Delivery Progress:</Text>
        
        {/* Step 1: Arrived */}
        <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">1</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'deliveryman_arrived' || currentStatus === 'order_handed_over' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Deliveryman Arrived
          </Text>
        </View>

        {/* Step 2: Order Handed Over */}
        <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'order_handed_over' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">2</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'order_handed_over' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Order Handed Over
          </Text>
        </View>
         {/* Step 3: Order Received */}
         <View className="flex-row items-center mb-2">
          <View className={`w-6 h-6 rounded-full ${currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
            <Text className="text-white text-xs text-center leading-6">3</Text>
          </View>
          <Text className={`text-sm ${currentStatus === 'order_received' || currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Order Received to deliveryman
          </Text>
        </View>

        {/* Step 3: Payment (Cash only) */}
        {isCashPayment && (
          <>
            <View className="flex-row items-center mb-2">
              <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
                <Text className="text-white text-xs text-center leading-6">4</Text>
              </View>
              <Text className={`text-sm ${currentStatus === 'payment_made' || currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                Payment Made
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <View className={`w-6 h-6 rounded-full ${currentStatus === 'payment_confirmed' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}>
                <Text className="text-white text-xs text-center leading-6">5</Text>
              </View>
              <Text className={`text-sm ${currentStatus === 'payment_confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                Payment Confirmed
              </Text>
            </View>
          </>
          
        )}

       
       
      </View>

      {/* Current Status */}
      <View className={`p-3 rounded-lg ${currentConfig.color}`}>
        <Text className="text-white font-semibold text-center">{currentConfig.title}</Text>
        <Text className="text-white text-sm text-center mt-1">{currentConfig.description}</Text>
      </View>

      {/* Vendor Action Button */}
      {currentConfig.vendorAction && (
        <TouchableOpacity
          onPress={() => handleVendorAction(currentConfig.vendorAction)}
          disabled={updating}
          className={`${updating ? 'bg-gray-400' : 'bg-green-600'} py-3 px-4 rounded-lg mt-3`}
        >
          <Text className="text-white font-semibold text-center">
            {updating ? 'Updating...' : currentConfig.vendorButtonText}
          </Text>
        </TouchableOpacity>
      )}

      {currentStatus === 'payment_confirmed' && (
        <View className="bg-green-100 p-3 rounded-lg mt-2">
          <Text className="text-green-800 font-semibold text-center">✅ Order Delivered Successfully!</Text>
        </View>
      )}
    </View>
  );
};

export default VendorDeliveryConfirmation;
