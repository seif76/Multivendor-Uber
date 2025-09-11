import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, Pressable, Alert } from 'react-native';
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

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            // Navigate to login or home page
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header with gradient background */}
      <View className="bg-primary pt-12 pb-8 px-6">
        <Text className="text-2xl font-bold text-white text-center mb-2">{t('profile.title')}</Text>
        <Text className="text-white/80 text-center text-sm">Manage your account settings</Text>
      </View>

      <View className="px-6 -mt-6">
        {/* Profile Card */}
        <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          {/* Profile Photo Section */}
          <View className="items-center mb-6">
            <View className="relative">
              {user.profile_photo ? (
                <Image
                  source={{ uri: user.profile_photo }}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 items-center justify-center border-4 border-white shadow-lg">
                  <Ionicons name="person" size={40} color="#007233" />
                </View>
              )}
              <Pressable className="absolute -bottom-1 -right-1 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="camera" size={16} color="white" />
              </Pressable>
            </View>
            <Text className="text-xl font-bold text-gray-800 mt-3">{user.name || 'User'}</Text>
            <Text className="text-gray-500 text-sm">{user.email || 'No email'}</Text>
          </View>

          {/* Profile Information */}
          <View className="space-y-4">
            <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="person-outline" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm font-medium">Full Name</Text>
                <Text className="text-gray-800 text-base font-semibold">{user.name || 'N/A'}</Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="mail-outline" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm font-medium">Email Address</Text>
                <Text className="text-gray-800 text-base font-semibold">{user.email || 'N/A'}</Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="call-outline" size={20} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm font-medium">Phone Number</Text>
                <Text className="text-gray-800 text-base font-semibold">{user.phone_number || 'N/A'}</Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
              <View className="w-10 h-10 bg-pink-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="person-circle-outline" size={20} color="#ec4899" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm font-medium">Gender</Text>
                <Text className="text-gray-800 text-base font-semibold">
                  {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Settings</Text>
          
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Edit Profile Button */}
          <Pressable className="flex-row items-center p-4 bg-gray-50 rounded-2xl mb-3">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="create-outline" size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 text-base font-semibold">Edit Profile</Text>
              <Text className="text-gray-500 text-sm">Update your personal information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          {/* Privacy Settings */}
          <Pressable className="flex-row items-center p-4 bg-gray-50 rounded-2xl mb-3">
            <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="shield-checkmark-outline" size={20} color="#6366f1" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 text-base font-semibold">Privacy & Security</Text>
              <Text className="text-gray-500 text-sm">Manage your privacy settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          {/* Notifications */}
          <Pressable className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
            <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="notifications-outline" size={20} color="#eab308" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 text-base font-semibold">Notifications</Text>
              <Text className="text-gray-500 text-sm">Manage notification preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Logout Section */}
        <View className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <Pressable 
            onPress={handleLogout}
            className="flex-row items-center justify-center p-4 bg-red-50 rounded-2xl border border-red-200"
          >
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </View>
            <Text className="text-red-600 text-base font-semibold">Logout</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}


