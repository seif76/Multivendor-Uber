import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VendorProfile() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  

  const fetchVendorProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const decoded = jwtDecode(token);
      //if (!token) return;

      const res = await axios.get(`${BACKEND_URL}/api/vendor/get-by-phone?phone_number=${decoded?.phone_number}`, {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });

      setVendor(res.data);
    } catch (err) {
      console.error('Error fetching vendor profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f9d58" />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Failed to load profile.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-bold text-primary mb-6 text-center">
        Vendor Profile
      </Text>

      {/* Profile Card */}
      <View className="bg-primary/10 p-5 rounded-2xl mb-6">
        <View className="flex-row items-center space-x-4">
          <Image
            source={{
              uri: vendor.info?.shop_front_photo
                ? `${BACKEND_URL}/uploads/${vendor.info.shop_front_photo}`
                : 'https://via.placeholder.com/150',
            }}
            className="w-20 h-20 mr-4 rounded-xl border border-primary"
          />
          <View>
            <Text className="text-xl font-semibold">{vendor.user?.name}</Text>
            <Text className="text-gray-600">{vendor.user?.phone_number}</Text>
            <Text className="text-xs text-white bg-green-600 px-2 py-1 mt-1 rounded-full w-fit">
              {vendor.user?.vendor_status}
            </Text>
          </View>
        </View>
      </View>

      {/* Info Sections */}
      <View className="mb-6 space-y-4">
        <View className="bg-gray-50 p-4 mb-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-primary mb-2">User Info</Text>
          <Text className="text-sm">📛 Name: {vendor.user?.name}</Text>
          <Text className="text-sm">👤 Gender: {vendor.user?.gender || 'N/A'}</Text>
          <Text className="text-sm">📧 Email: {vendor.user?.email || 'N/A'}</Text>
          <Text className="text-sm">📱 Phone: {vendor.user?.phone_number}</Text>
        </View>

        <View className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-primary mb-2">Shop Info</Text>
          <Text className="text-sm">🏪 Shop: {vendor.info?.shop_name}</Text>
          <Text className="text-sm">📍 Location: {vendor.info?.shop_location}</Text>
          <Text className="text-sm">👤 Owner: {vendor.info?.owner_name}</Text>
          <Text className="text-sm">📞 Phone: {vendor.info?.phone_number}</Text>
        </View>
      </View>

      {/* Documents */}
      <Text className="text-lg font-semibold text-primary mb-3">Documents</Text>
      <View className="flex-row flex-wrap gap-4 justify-between">
        {vendor.info?.passport_photo && (
          <Image
            source={{ uri: `${BACKEND_URL}/uploads/${vendor.info.passport_photo}` }}
            className="w-[31%] h-28 rounded-md border"
          />
        )}
        {vendor.info?.license_photo && (
          <Image
            source={{ uri: `${BACKEND_URL}/uploads/${vendor.info.license_photo}` }}
            className="w-[31%] h-28 rounded-md border"
          />
        )}
        {vendor.info?.shop_front_photo && (
          <Image
            source={{ uri: `${BACKEND_URL}/uploads/${vendor.info.shop_front_photo}` }}
            className="w-[31%] h-28 rounded-md border"
          />
        )}
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}
