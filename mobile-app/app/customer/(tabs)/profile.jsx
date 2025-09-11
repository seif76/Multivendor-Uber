import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import LanguageSwitcher from '../../../components/customer/custom/LanguageSwitcher';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const { t, isRTL } = useLanguage();

  useEffect(() => {
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
        <Text className="mt-4 text-lg text-gray-500">{t('common.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-red-500">{t('common.error')}</Text>
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
    <ScrollView className="flex-1 bg-gray-50" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <View className="p-4">
        <Text className="text-3xl font-bold mb-8 text-center">{t('profile.title')}</Text>
        
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        {/* Profile Photo */}
        <View className="mb-6 items-center">
          {user.profile_photo ? (
            <Image
              source={{ uri: user.profile_photo }}
              style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 8 }}
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-2">
              <Ionicons name="person" size={60} color="#a3a3a3" />
            </View>
          )}
        </View>
        
        <View className="w-full bg-white rounded-2xl shadow p-6">
          <View className="flex-row mb-3 items-center w-full">
            <Text className="text-lg text-gray-700 font-semibold mr-2 w-28">Name:</Text>
            <Text className="text-lg text-gray-600 flex-1">{user.name || 'N/A'}</Text>
          </View>
          <View className="flex-row mb-3 items-center w-full">
            <Text className="text-lg text-gray-700 font-semibold mr-2 w-28">Email:</Text>
            <Text className="text-lg text-gray-600 flex-1">{user.email || 'N/A'}</Text>
          </View>
          <View className="flex-row mb-3 items-center w-full">
            <Text className="text-lg text-gray-700 font-semibold mr-2 w-28">Phone:</Text>
            <Text className="text-lg text-gray-600 flex-1">{user.phone_number || 'N/A'}</Text>
          </View>
          <View className="flex-row mb-3 items-center w-full">
            <Text className="text-lg text-gray-700 font-semibold mr-2 w-28">Gender:</Text>
            <Text className="text-lg text-gray-600 flex-1">{user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}


