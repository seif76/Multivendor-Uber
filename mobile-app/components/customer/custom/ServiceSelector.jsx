import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';


export default function ServiceSelector() {
    const router =  useRouter();
  return (
    <View className="px-4 py-3">
      <Text className="text-lg font-bold mb-3 text-gray-800">How can we help you today?</Text>
      <View className="flex-row justify-between">
        <Pressable  onPress={() => router.push('/customer/map')} className="w-[48%] bg-primary rounded-xl py-4 items-center">
          <FontAwesome name="car" size={28} color="#fff" />
          <Text className="text-white font-semibold mt-2">Book a Ride</Text>
        </Pressable>
        <Pressable className="w-[48%] bg-primary rounded-xl py-4 items-center">
          <FontAwesome name="truck" size={28} color="#fff" />
          <Text className="text-white font-semibold mt-2">Send a Package</Text>
        </Pressable>
      </View>
    </View>
  );
}
