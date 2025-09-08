import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useHome } from '../../../context/customer/HomeContext';

export default function VendorList() {
  const router = useRouter();
  const { vendors, loading, error } = useHome();


  const handleVendorPress = (vendor) => {
    // Navigate to vendor shop page
    router.push(`/customer/shopDetails/${vendor.phone_number}`);
  };

  const getVendorImage = (vendor) => {
    // Use vendor logo if available, otherwise use default
    if (vendor.logo) {
      return { uri: vendor.logo };
    }
    return require('../../../assets/images/Elnaizak-logo.jpeg');
  };

  if (loading) {
    return (
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">Featured Stores</Text>
        <View className="flex-row items-center justify-center py-8">
          <ActivityIndicator size="small" color="#10b981" />
          <Text className="text-gray-600 ml-2">Loading stores...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">Featured Stores</Text>
        <View className="bg-red-50 p-4 rounded-lg">
          <Text className="text-red-800 text-sm text-center">{error}</Text>
        </View>
      </View>
    );
  }

  if (!vendors || vendors.length === 0) {
    return (
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">Featured Stores</Text>
        <View className="bg-gray-50 p-6 rounded-lg">
          <Text className="text-gray-500 text-center">No stores available at the moment</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-800">Featured Stores</Text>
        <Pressable onPress={() => router.push('/customer/shop/shop')}>
          <Text className="text-green-600 font-semibold">See All</Text>
        </Pressable>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
        {vendors.slice(0, 5).map((vendor) => (
          <Pressable 
            key={vendor.id} 
            onPress={() => handleVendorPress(vendor)}
            className="w-40 bg-white rounded-lg shadow-sm border border-gray-100 p-3 mr-3"
          >
            <View className="relative">
              <Image
                source={getVendorImage(vendor)}
                className="w-full h-24 rounded-lg"
                resizeMode="cover"
              />
              {vendor.vendor_status === 'Active' && (
                <View className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">Open</Text>
                </View>
              )}
            </View>
            
            <View className="mt-2">
              <Text className="font-semibold text-gray-800" numberOfLines={1}>
                {vendor.shop_name || vendor.name || 'Store'}
              </Text>
              <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
                {vendor.shop_location || 'Location'}
              </Text>
              
              <View className="flex-row items-center mt-2">
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text className="text-xs text-gray-600 ml-1">4.5</Text>
                <Text className="text-xs text-gray-400 ml-1">•</Text>
                <Text className="text-xs text-gray-500 ml-1">Active</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
