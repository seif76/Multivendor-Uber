// import { FontAwesome } from '@expo/vector-icons';
// import React from 'react';
// import { Pressable, Text, View } from 'react-native';

// export default function SupportAccess() {
//   return (
//     <View className="px-4 mt-6">
//       <Text className="text-lg font-bold text-gray-800 mb-3">Need Help?</Text>
//       <View className="flex-row justify-between">
//         <Pressable className="w-[48%] bg-pink-100 rounded-xl py-4 items-center">
//           <FontAwesome name="headphones" size={24} color="#d63384" />
//           <Text className="text-pink-700 font-semibold mt-2">Live Support</Text>
//         </Pressable>
//         <Pressable className="w-[48%] bg-yellow-100 rounded-xl py-4 items-center">
//           <FontAwesome name="exclamation-triangle" size={24} color="#e67e22" />
//           <Text className="text-yellow-700 font-semibold mt-2">Report Issue</Text>
//         </Pressable>
//       </View>
//     </View>
//   );
// }
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function SupportAccess() {
  const router = useRouter();

  const handleLogout = async () => {
    // Remove all relevant AsyncStorage items for logout
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('cart');
    await AsyncStorage.removeItem('cart_vendor_id');
    // Add more keys to remove if needed

    router.replace('/'); // Redirect to home or login
  };

  return (
    <View className="px-4 mt-6">
      <Text className="text-lg font-bold text-gray-800 mb-3">Need Help?</Text>
      <View className="flex-row justify-between">
        <Pressable className="w-[48%] bg-pink-100 rounded-xl py-4 items-center">
          <FontAwesome name="headphones" size={24} color="#d63384" />
          <Text className="text-pink-700 font-semibold mt-2">Live Support</Text>
        </Pressable>
        <Pressable className="w-[48%] bg-yellow-100 rounded-xl py-4 items-center">
          <FontAwesome name="exclamation-triangle" size={24} color="#e67e22" />
          <Text className="text-yellow-700 font-semibold mt-2">Report Issue</Text>
        </Pressable>
      </View>
      <View className="mt-6 items-center">
        <Pressable
          className="bg-red-100 rounded-xl py-3 px-8 flex-row items-center"
          onPress={handleLogout}
        >
          <FontAwesome name="sign-out" size={20} color="#e74c3c" />
          <Text className="text-red-700 font-semibold ml-2">Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

