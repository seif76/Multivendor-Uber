import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function VendorCard({ vendor }) {
  const router = useRouter();
  const shopName = vendor.vendor_info?.shop_name || 'Unnamed Shop';
  const shopLocation = vendor.vendor_info?.shop_location || 'No location available';
  const shopLogo = vendor.vendor_info?.logo || 'https://via.placeholder.com/150';

  const goToShop = () => {
    router.push(`/customer/shopDetails/${vendor.vendor_info.phone_number}`);
  };

  return (
    <View>
      <View className="flex-row items-center bg-white py-4 px-2 mb-1 rounded-xl shadow-sm border-b border-gray-100">
        {/* Shop Logo */}
        <Image
          source={{ uri: shopLogo }}
          className="w-14 h-14 rounded-full border-2 border-primary mr-4"
          resizeMode="cover"
        />
        {/* Shop Info */}
        <View className="flex-1 justify-center">
          <Text className="font-bold text-base text-gray-900 mb-1" numberOfLines={1}>{shopName}</Text>
          <Text className="text-gray-500 text-xs" numberOfLines={1}>{shopLocation}</Text>
        </View>
        {/* View Shop Button */}
        <Pressable
          onPress={goToShop}
          className="bg-primary py-2 px-5 rounded-full items-center ml-2"
          style={{ elevation: 1 }}
        >
          <Text className="text-white font-bold text-sm">View Shop</Text>
        </Pressable>
      </View>
    </View>
  );
}
