// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useDeliverySocket } from '../../../context/Deliveryman/DeliverySocketContext';  
// import { useRouter } from 'expo-router';


// const { width } = Dimensions.get('window');

// export default function GlobalOrderPopup() {
//   const { availableOrders, acceptOrder, rejectOrder } = useDeliverySocket();
//   const [slideAnim] = useState(new Animated.Value(100)); // Start off-screen
//   const router = useRouter();

//   // Show the latest order
//   const currentOrder = availableOrders.length > 0 ? availableOrders[0] : null;

//   useEffect(() => {
//     if (currentOrder) {
//       // Slide UP
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       // Slide DOWN
//       Animated.timing(slideAnim, {
//         toValue: 100,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [currentOrder]);

//   if (!currentOrder) return null;

//   const handleAccept = async () => {
//     const success = await acceptOrder(currentOrder.id);
//     if (success) {
//         // Optional: Navigate to the order details page
//         router.push(`/deliveryMan/orders/${currentOrder.id}`);
//     }
//   };

//   return (
//     <Animated.View 
//       style={{ 
//         transform: [{ translateY: slideAnim }],
//         position: 'absolute', 
//         bottom: 90, // Above bottom tabs
//         left: 10, 
//         right: 10,
//         zIndex: 9999, // On top of everything
//       }}
//     >
//       <View className="bg-white rounded-2xl shadow-xl border border-green-500 p-4 elevation-10">
        
//         {/* Header */}
//         <View className="flex-row justify-between items-center mb-2">
//           <View className="flex-row items-center">
//             <View className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" />
//             <Text className="text-lg font-bold text-gray-800">New Request! 🔔</Text>
//           </View>
//           <View className="bg-green-100 px-2 py-1 rounded">
//              <Text className="text-green-700 font-bold">EGP {currentOrder.total_price}</Text>
//           </View>
//         </View>

//         {/* Details */}
//         <View className="mb-4">
//           <Text className="text-gray-600 font-semibold">{currentOrder.vendor?.shop_name || currentOrder.vendor?.name} </Text>
//           <Text className="text-gray-500 text-xs mb-1">📍 {currentOrder.vendor?.shop_location || currentOrder.vendor?.address}</Text>
//           <View className="h-[1px] bg-gray-200 my-1" />
//           <Text className="text-gray-600 font-semibold">{currentOrder.customer?.name}</Text>
//           <Text className="text-gray-500 text-xs">📍 {currentOrder.address}</Text>
//         </View>

//         {/* Buttons */}
//         <View className="flex-row gap-3">
//           <TouchableOpacity 
//             onPress={() => rejectOrder(currentOrder.id)}
//             className="flex-1 bg-gray-100 py-3 rounded-xl border border-gray-300"
//           >
//             <Text className="text-gray-700 font-bold text-center">Decline</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             onPress={handleAccept}
//             className="flex-1 bg-green-600 py-3 rounded-xl shadow-md"
//           >
//             <Text className="text-white font-bold text-center">Accept Delivery</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Animated.View>
//   );
// }

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useDeliverySocket } from '../../../context/Deliveryman/DeliverySocketContext';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

export default function GlobalOrderPopup() {
  const { availableOrders, acceptOrder, rejectOrder } = useDeliverySocket();
  const [slideAnim] = useState(new Animated.Value(100));
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  const router = useRouter();
  const soundRef = useRef(null);

  const currentOrder = availableOrders.length > 0 ? availableOrders[0] : null;

  // Slide animation
  const playSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
    } catch (err) {
      console.error('Sound error:', err);
    }
  };
  
  const stopSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (err) {
      // silently ignore — sound may have already been unloaded
      soundRef.current = null;
    }
  };
  useEffect(() => {
    if (currentOrder) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
      playSound(); // ← add

      // Start countdown
      const seconds = currentOrder.timeoutSeconds || 15;
      setCountdown(seconds);

      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setTimeout(() => rejectOrder(currentOrder.id), 0); // ← defer outside render
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      Animated.timing(slideAnim, { toValue: 100, duration: 300, useNativeDriver: true }).start();
      clearInterval(countdownRef.current);
      stopSound(); // ← add
      setCountdown(0);
    }

    return () => {
      clearInterval(countdownRef.current);
      stopSound(); // ← add
    };
  }, [currentOrder?.id]); // ← depend on order id not the whole object

  if (!currentOrder) return null;

  const handleAccept = async () => {
    clearInterval(countdownRef.current);
    await stopSound(); 
    const success = await acceptOrder(currentOrder.id);
    if (success) {
      router.push(`/deliveryMan/orders/${currentOrder.id}`);
    }
    if (!success) {
      rejectOrder(currentOrder.id);
     }
  };

  const handleReject = async () => {
    clearInterval(countdownRef.current);
    await stopSound(); 
    rejectOrder(currentOrder.id);
  };

  // Color changes as time runs out
  const countdownColor = countdown > 10 ? '#16a34a' : countdown > 5 ? '#f59e0b' : '#ef4444';
  const progressWidth = `${(countdown / (currentOrder.timeoutSeconds || 15)) * 100}%`;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        bottom: 90,
        left: 10,
        right: 10,
        zIndex: 9999,
      }}
    >
      <View className="bg-white rounded-2xl shadow-xl border border-green-500 p-4">

        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <Text className="text-lg font-bold text-gray-800">New Request! 🔔</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text style={{ color: countdownColor }} className="font-bold text-lg">
              {countdown}s
            </Text>
            <View className="bg-green-100 px-2 py-1 rounded">
              <Text className="text-green-700 font-bold">EGP {currentOrder.total_price}</Text>
            </View>
          </View>
        </View>

        {/* Countdown Progress Bar */}
        <View className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <View
            style={{ width: progressWidth, backgroundColor: countdownColor }}
            className="h-full rounded-full"
          />
        </View>

        {/* Details */}
        <View className="mb-4">
          <Text className="text-gray-600 font-semibold">
            {currentOrder.vendor?.shop_name || currentOrder.vendor?.name}
          </Text>
          <Text className="text-gray-500 text-xs mb-1">
            📍 {currentOrder.vendor?.shop_location || currentOrder.vendor?.address}
          </Text>
          <View className="h-[1px] bg-gray-200 my-1" />
          <Text className="text-gray-600 font-semibold">{currentOrder.customer?.name}</Text>
          <Text className="text-gray-500 text-xs">📍 {currentOrder.address}</Text>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleReject}
            className="flex-1 bg-gray-100 py-3 rounded-xl border border-gray-300"
          >
            <Text className="text-gray-700 font-bold text-center">Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAccept}
            className="flex-1 bg-green-600 py-3 rounded-xl"
          >
            <Text className="text-white font-bold text-center">Accept Delivery</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Animated.View>
  );
}