import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeliverymanProfile() {
  const [deliveryman, setDeliveryman] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  

  const fetchDeliverymanProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const decoded = jwtDecode(token);

      const res = await axios.get(`${BACKEND_URL}/api/deliveryman/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeliveryman(res.data);
    } catch (err) {
      console.error('Error fetching deliveryman profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverymanProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!deliveryman) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Failed to load profile.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-bold text-blue-600 mb-6 text-center">
        Deliveryman Profile
      </Text>

      {/* Profile Card */}
      <View className="bg-blue-50 p-5 rounded-2xl mb-6">
        <View className="flex-row items-center space-x-4">
          <Image
            source={{
              uri: deliveryman.profile_photo
                ? deliveryman.profile_photo
                : 'https://via.placeholder.com/150',
            }}
            className="w-20 h-20 mr-4 rounded-xl border border-blue-600"
          />
          <View>
            <Text className="text-xl font-semibold">{deliveryman.name}</Text>
            <Text className="text-gray-600">{deliveryman.phone_number}</Text>
            <Text className="text-xs text-white bg-blue-600 px-2 py-1 mt-1 rounded-full w-fit">
              {deliveryman.deliveryman_status}
            </Text>
          </View>
        </View>
      </View>

      {/* Personal Info Section */}
      <View className="mb-6 space-y-4">
        <View className="bg-gray-50 p-4 mb-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-blue-600 mb-2">Personal Information</Text>
          <Text className="text-sm">📛 Name: {deliveryman.name}</Text>
          <Text className="text-sm">👤 Gender: {deliveryman.gender || 'N/A'}</Text>
          <Text className="text-sm">📧 Email: {deliveryman.email || 'N/A'}</Text>
          <Text className="text-sm">📱 Phone: {deliveryman.phone_number}</Text>
        </View>

        {/* Vehicle Information */}
        {deliveryman.delivery_vehicle && (
          <View className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <Text className="text-lg font-semibold text-blue-600 mb-2">Vehicle Information</Text>
            <Text className="text-sm">🚗 Make: {deliveryman.delivery_vehicle.make}</Text>
            <Text className="text-sm">🚙 Model: {deliveryman.delivery_vehicle.model}</Text>
            <Text className="text-sm">📅 Year: {deliveryman.delivery_vehicle.year}</Text>
            <Text className="text-sm">🔢 License Plate: {deliveryman.delivery_vehicle.license_plate}</Text>
            <Text className="text-sm">🎨 Color: {deliveryman.delivery_vehicle.color}</Text>
            <Text className="text-sm">🚛 Type: {deliveryman.delivery_vehicle.vehicle_type}</Text>
          </View>
        )}
      </View>

      {/* Documents Section */}
      <Text className="text-lg font-semibold text-blue-600 mb-3">Documents</Text>
      <View className="flex-row flex-wrap gap-4 justify-between mb-6 ">
        {deliveryman.delivery_vehicle?.driver_license_photo && (
          <View className="items-center ">
            <Image
              source={{ uri: deliveryman.delivery_vehicle.driver_license_photo }}
              className="w-full h-28 rounded-md border"
            />
            <Text className="text-xs text-gray-600 mt-1">Driver License</Text>
          </View>
        )}
        {deliveryman.delivery_vehicle?.national_id_photo && (
          <View className="items-center">
            <Image
              source={{ uri: deliveryman.delivery_vehicle.national_id_photo }}
              className="w-full h-28 rounded-md border"
            />
            <Text className="text-xs text-gray-600 mt-1">National ID</Text>
          </View>
        )}
        {deliveryman.profile_photo && (
          <View className="items-center">
            <Image
              source={{ uri: deliveryman.profile_photo }}
              className="w-full h-28 rounded-md border"
            />
            <Text className="text-xs text-gray-600 mt-1">Profile Photo</Text>
          </View>
        )}
      </View>

      {/* Stats Section */}
      <View className="bg-blue-50 p-4 rounded-xl mb-6">
        <Text className="text-lg font-semibold text-blue-600 mb-3">Delivery Stats</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">127</Text>
            <Text className="text-sm text-gray-600">Total Deliveries</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">4.8</Text>
            <Text className="text-sm text-gray-600">Rating</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-yellow-600">$2,450</Text>
            <Text className="text-sm text-gray-600">Earnings</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="space-y-3 mb-6">
        <View className="bg-white border border-blue-200 p-4 rounded-xl">
          <Text className="text-blue-600 font-semibold text-center">Edit Profile</Text>
        </View>
        <View className="bg-white border border-blue-200 p-4 rounded-xl">
          <Text className="text-blue-600 font-semibold text-center">Update Vehicle Info</Text>
        </View>
        <View className="bg-white border border-red-200 p-4 rounded-xl">
          <Text className="text-red-600 font-semibold text-center">Logout</Text>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}
