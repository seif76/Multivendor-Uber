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
          <Text className="text-primary font-semibold">See All</Text>
        </Pressable>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
         {vendors.slice(0, 5).map((vendor) => (
           <Pressable 
             key={vendor.id} 
             onPress={() => handleVendorPress(vendor)}
             className="w-48 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mr-4"
           >
             <View className="relative">
               <Image
                 source={getVendorImage(vendor)}
                 className="w-full h-32"
                 resizeMode="cover"
               />
               {vendor.vendor_status === 'Active' && (
                 <View className="absolute top-3 right-3 bg-primary px-2 py-1 rounded-full">
                   <Text className="text-white text-xs font-bold">Open</Text>
                 </View>
               )}
               <View className="absolute bottom-3 left-3 bg-white/95 px-2 py-1 rounded-full">
                 <View className="flex-row items-center">
                   <Ionicons name="star" size={12} color="#fbbf24" />
                   <Text className="text-xs font-semibold text-gray-800 ml-1">4.5</Text>
                 </View>
               </View>
             </View>
             
             <View className="p-4">
               <Text className="font-bold text-base text-gray-900 mb-1" numberOfLines={1}>
                 {vendor.shop_name || vendor.name || 'Store'}
               </Text>
               <Text className="text-sm text-gray-500 mb-2" numberOfLines={1}>
                 {vendor.shop_location || vendor.category || 'Location'}
               </Text>
               
               <View className="flex-row items-center justify-between">
                 <View className="flex-row items-center">
                   <Ionicons 
                     name={vendor.vendor_status === 'Active' ? "checkmark-circle" : "close-circle"} 
                     size={16} 
                     color={vendor.vendor_status === 'Active' ? "#22c55e" : "#ef4444"} 
                   />
                   <Text className={`text-xs font-medium ml-1 ${vendor.vendor_status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                     {vendor.vendor_status === 'Active' ? 'Open Now' : 'Closed'}
                   </Text>
                 </View>
                 <Pressable className="bg-primary p-2 rounded-full">
                   <Ionicons name="arrow-forward" size={14} color="white" />
                 </Pressable>
               </View>
             </View>
           </Pressable>
         ))}
      </ScrollView>
    </View>
  );
}
