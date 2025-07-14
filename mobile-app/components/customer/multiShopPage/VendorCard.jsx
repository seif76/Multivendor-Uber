import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function VendorCard({ vendor }) {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <Pressable
      className="bg-white rounded-xl shadow mb-5 overflow-hidden border border-gray-100"
      onPress={() => navigation.navigate('VendorDetails', { vendorId: vendor.id })}
    >
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
        }}
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="font-bold text-lg">
          {vendor.vendor_info?.shop_name || 'Unnamed Shop'}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          {vendor.vendor_info?.shop_location || 'No location available'}
        </Text>
        <Pressable
          onPress={() => router.push(`/customer/shopDetails/${vendor.vendor_info.phone_number}`)}
          className="mt-3 bg-primary py-2 rounded-lg items-center"
        >
          <Text className="text-white font-semibold text-sm">View Shop</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
