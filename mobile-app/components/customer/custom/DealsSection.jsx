import React from 'react';
import { Image, Text, View } from 'react-native';

export default function DealsSection() {
  return (
    <View className="px-4 mt-6">
      <Text className="text-lg font-bold text-gray-800 mb-3">Best Deals</Text>
      {[1, 2].map((i) => (
        <View key={i} className="flex-row items-center mb-4 bg-gray-100 rounded-lg p-3">
          <Image
            source={ require('../../../assets/images/Elnaizak-logo.jpeg') }
            className="w-20 h-20 rounded-lg"
          />
          <View className="ml-4">
            <Text className="font-semibold text-gray-800">Product {i}</Text>
            <Text className="text-green-600 font-bold mt-1">$19.99</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
