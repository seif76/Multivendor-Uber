import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import LanguageSwitcher from '../../../components/customer/custom/LanguageSwitcher';
import { useRouter } from 'expo-router';

export default function VendorProfile() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const fetchVendorProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const decoded = jwtDecode(token);

      const res = await axios.get(`${BACKEND_URL}/api/vendor/get-by-phone?phone_number=${decoded?.phone_number}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVendor(res.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching vendor profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

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
            router.push('/vendor/login');
            // Navigate to login or home page
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#007233" />
        <Text className="mt-4 text-lg text-gray-500">{t('common.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-lg text-red-500">{t('common.error')}</Text>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-lg text-gray-500">No vendor data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header Section */}
      <View className="bg-white pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-800">Vendor Profile</Text>
          <Pressable className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <Ionicons name="settings-outline" size={20} color="#6b7280" />
          </Pressable>
        </View>
        
        {/* Profile Header Card */}
        <View className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6">
          <View className="flex-row items-center">
            <View className="relative">
              {vendor.info?.logo ? (
                <Image
                  source={{ uri: vendor.info.logo }}
                  className="w-16 h-16 rounded-full border-3 border-white/30"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center border-3 border-white/30">
                  <Ionicons name="storefront" size={32} color="white" />
                </View>
              )}
              <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></View>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-black text-xl font-bold">{vendor.user?.name || 'Vendor'}</Text>
              <Text className="text-gray-600 text-sm">{vendor.info?.shop_name || 'No shop name'}</Text>
              <View className="flex-row items-center mt-1">
                <View className="w-2 h-2 bg-green-400 rounded-full mr-2"></View>
                <Text className="text-gray-600 text-xs">{vendor.user?.vendor_status || 'Active'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 -mt-4">
        {/* Quick Stats */}
        <View className="flex-row space-x-3 mb-6">
          <View className="flex-1 bg-white rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-xs">Total Orders</Text>
                <Text className="text-gray-800 text-lg font-bold">156</Text>
              </View>
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="bag-outline" size={16} color="#3b82f6" />
              </View>
            </View>
          </View>
          
          <View className="flex-1 bg-white rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-xs">Earnings</Text>
                <Text className="text-gray-800 text-lg font-bold">$3,250</Text>
              </View>
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                <Ionicons name="cash-outline" size={16} color="#10b981" />
              </View>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View className="bg-white rounded-2xl p-6 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Personal Information</Text>
          
          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={16} color="#3b82f6" />
                </View>
                <Text className="text-gray-600 text-sm">Full Name</Text>
              </View>
              <Text className="text-gray-800 font-medium">{vendor.user?.name || 'N/A'}</Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="mail-outline" size={16} color="#10b981" />
                </View>
                <Text className="text-gray-600 text-sm">Email</Text>
              </View>
              <Text className="text-gray-800 font-medium">{vendor.user?.email || 'N/A'}</Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="call-outline" size={16} color="#8b5cf6" />
                </View>
                <Text className="text-gray-600 text-sm">Phone</Text>
              </View>
              <Text className="text-gray-800 font-medium">{vendor.user?.phone_number || 'N/A'}</Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-pink-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-circle-outline" size={16} color="#ec4899" />
                </View>
                <Text className="text-gray-600 text-sm">Gender</Text>
              </View>
              <Text className="text-gray-800 font-medium">
                {vendor.user?.gender ? vendor.user.gender.charAt(0).toUpperCase() + vendor.user.gender.slice(1) : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Shop Information */}
        <View className="bg-white rounded-2xl p-6 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Shop Information</Text>
          
          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="storefront-outline" size={16} color="#f97316" />
                </View>
                <Text className="text-gray-600 text-sm">Shop Name</Text>
              </View>
              <Text className="text-gray-800 font-medium">{vendor.info?.shop_name || 'N/A'}</Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="location-outline" size={16} color="#6366f1" />
                </View>
                <Text className="text-gray-600 text-sm">Location</Text>
              </View>
              <Text className="text-gray-800 font-medium">{vendor.info?.shop_location || 'N/A'}</Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-yellow-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={16} color="#eab308" />
                </View>
                <Text className="text-gray-600 text-sm">Owner</Text>
              </View>
              <Text className="text-gray-800 font-medium">{vendor.info?.owner_name || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View className="bg-white rounded-2xl p-6 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Account</Text>
          
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* <Pressable className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="create-outline" size={16} color="#f97316" />
              </View>
              <Text className="text-gray-800 font-medium">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable> */}
          <Pressable
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
            onPress={() => router.push('/vendor/EditVendorProfile')}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="create-outline" size={16} color="#f97316" />
              </View>
              <Text className="text-gray-800 font-medium">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-checkmark-outline" size={16} color="#6366f1" />
              </View>
              <Text className="text-gray-800 font-medium">Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-yellow-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={16} color="#eab308" />
              </View>
              <Text className="text-gray-800 font-medium">Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="help-circle-outline" size={16} color="#6b7280" />
              </View>
              <Text className="text-gray-800 font-medium">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable 
          onPress={handleLogout}
          className="bg-white rounded-2xl p-6 mb-8"
        >
          <View className="flex-row items-center justify-center">
            <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={16} color="#ef4444" />
            </View>
            <Text className="text-red-600 font-semibold">Logout</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
