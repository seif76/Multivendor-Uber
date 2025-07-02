import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

export default function VendorList() {
  return (
    <View className="px-4 mt-6">
      <Text className="text-lg font-bold text-gray-800 mb-3">Featured Stores</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
        {[1, 2, 3].map((i) => (
          <View key={i} className="w-40 bg-white rounded-lg shadow p-3 mr-3">
            <Image
              source={ require('../../../assets/images/Elnaizak-logo.jpeg') }
              className="w-full h-24 rounded"
            />
            <Text className="mt-2 font-semibold">Vendor {i}</Text>
            <Text className="text-xs text-gray-500">4.5 ★</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
