import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    // The correct endpoint for getting the current customer info is likely /api/customer/me
    // (based on standard REST and your backend structure)
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/customers/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-lg text-gray-500">Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-red-500">{error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-500">No user data found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-3xl font-bold mb-8">My Profile</Text>
      <View className="flex-row mb-4 items-center">
        <Text className="text-lg text-gray-700 font-semibold mr-2">Name:</Text>
        <Text className="text-lg text-gray-600">{user.name || 'N/A'}</Text>
      </View>
      <View className="flex-row mb-4 items-center">
        <Text className="text-lg text-gray-700 font-semibold mr-2">Email:</Text>
        <Text className="text-lg text-gray-600">{user.email || 'N/A'}</Text>
      </View>
      {/* Add more fields as needed */}
      <Text className="mt-10 text-base text-gray-400">(This is a dynamic profile page.)</Text>
    </View>
  );
}


