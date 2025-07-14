import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function ManageShopScreen() {
  const shop = {
    name: 'Seif’s Sweets',
    location: 'New Cairo, Egypt',
    description: 'We sell fresh sweets, cakes, and desserts daily.',
    phone: '+20 123-456-7890',
    logo: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4 text-gray-800">Manage Shop</Text>

      <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
        <Image source={{ uri: shop.logo }} className="w-full h-40 rounded-lg mb-4" resizeMode="cover" />
        <Text className="text-lg font-semibold text-black">{shop.name}</Text>
        <Text className="text-sm text-gray-600 mt-1">{shop.location}</Text>
        <Text className="text-sm text-gray-500 mt-2">{shop.description}</Text>
        <Text className="text-sm text-gray-500 mt-1">Phone: {shop.phone}</Text>

        <Pressable className="mt-4 bg-primary py-2 rounded-full items-center">
          <Text className="text-white font-semibold text-sm">Edit Shop Info</Text>
        </Pressable>
      </View>
    </View>
  );
}
