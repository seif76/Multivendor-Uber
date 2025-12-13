import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliverySocket } from '../../../context/Deliveryman/DeliverySocketContext';  
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function GlobalOrderPopup() {
  const { availableOrders, acceptOrder, rejectOrder } = useDeliverySocket();
  const [slideAnim] = useState(new Animated.Value(100)); // Start off-screen
  const router = useRouter();

  // Show the latest order
  const currentOrder = availableOrders.length > 0 ? availableOrders[0] : null;

  useEffect(() => {
    if (currentOrder) {
      // Slide UP
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide DOWN
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentOrder]);

  if (!currentOrder) return null;

  const handleAccept = async () => {
    const success = await acceptOrder(currentOrder.id);
    if (success) {
        // Optional: Navigate to the order details page
        router.push(`/deliveryMan/orders/${currentOrder.id}`);
    }
  };

  return (
    <Animated.View 
      style={{ 
        transform: [{ translateY: slideAnim }],
        position: 'absolute', 
        bottom: 90, // Above bottom tabs
        left: 10, 
        right: 10,
        zIndex: 9999, // On top of everything
      }}
    >
      <View className="bg-white rounded-2xl shadow-xl border border-green-500 p-4 elevation-10">
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" />
            <Text className="text-lg font-bold text-gray-800">New Request! 🔔</Text>
          </View>
          <View className="bg-green-100 px-2 py-1 rounded">
             <Text className="text-green-700 font-bold">EGP {currentOrder.total_price}</Text>
          </View>
        </View>

        {/* Details */}
        <View className="mb-4">
          <Text className="text-gray-600 font-semibold">{currentOrder.vendor?.shop_name || currentOrder.vendor?.name} </Text>
          <Text className="text-gray-500 text-xs mb-1">📍 {currentOrder.vendor?.shop_location || currentOrder.vendor?.address}</Text>
          <View className="h-[1px] bg-gray-200 my-1" />
          <Text className="text-gray-600 font-semibold">{currentOrder.customer?.name}</Text>
          <Text className="text-gray-500 text-xs">📍 {currentOrder.address}</Text>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => rejectOrder(currentOrder.id)}
            className="flex-1 bg-gray-100 py-3 rounded-xl border border-gray-300"
          >
            <Text className="text-gray-700 font-bold text-center">Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleAccept}
            className="flex-1 bg-green-600 py-3 rounded-xl shadow-md"
          >
            <Text className="text-white font-bold text-center">Accept Delivery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}