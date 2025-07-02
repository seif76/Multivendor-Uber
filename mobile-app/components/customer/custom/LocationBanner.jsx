import { Entypo } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

export default function LocationBanner() {
  return (
    <View className="px-4 py-2 bg-gray-50 flex-row items-center space-x-2">
      <Entypo name="location-pin" size={20} color="#0f9d58" />
      <Text className="text-gray-700 font-semibold">Cairo, Egypt</Text>
    </View>
  );
}
