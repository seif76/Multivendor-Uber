import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View, Pressable, Alert, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import { useRouter } from 'expo-router';

// Enable smooth expand animation (required for Android)
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function VendorProfile() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState('personal'); // Default to expanding Personal
  
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const { t, isRTL } = useLanguage(); // Kept for DataRow values and Alerts
  const router = useRouter();

  const primaryColor = "#007233"; // Your brand color
  const lightPrimary = "#0072331A"; // Primary color with 10% opacity for backgrounds

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

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === key ? null : key);
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout') || 'Logout',
      t('profile.logoutConfirm') || 'Are you sure you want to log out?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.logout') || 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            router.push('/vendor/login');
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  // --- Render Functions ---

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={primaryColor} />
        <Text className="mt-4 text-lg text-gray-500">{t('common.loading') || 'Loading...'}</Text>
      </View>
    );
  }

  if (error || !vendor) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-red-500">{t('common.error') || 'Error loading data.'}</Text>
      </View>
    );
  }

  // Helper function to render data rows inside expandable sections
  const DataRow = ({ iconName, label, value }) => (
    <View className="flex-row items-center">
      <Ionicons name={iconName} size={18} color={primaryColor} />
      <Text className="ml-3 text-gray-700 font-medium flex-1">
        {label}: <Text className="font-normal text-gray-800">{value || 'N/A'}</Text>
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#f6f8f6]" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Profile Card Header */}
        <View className="bg-white p-4 shadow-sm pt-8">
          <View className="flex-row items-center gap-4">
            {/* Logo/Image */}
            {vendor.info?.logo ? (
              <Image
                source={{ uri: vendor.info.logo }}
                className="h-16 w-16 rounded-full border border-gray-300"
              />
            ) : (
              <View className="h-16 w-16 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="storefront" size={28} color="#777" />
              </View>
            )}
            {/* Vendor Info */}
            <View className="flex-1">
              {/* NOTE: Vendor name/info remains dynamically driven */}
              <Text className="text-lg font-bold text-[#333]">{vendor.info?.shop_name || vendor.user?.name || 'Vendor'}</Text>
              <Text className="text-sm text-gray-500">{vendor.user?.phone_number || 'N/A'}</Text>
              <View className="flex-row items-center mt-1">
                <View className={`w-2 h-2 ${vendor.user?.vendor_status === 'Active' ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`}></View>
                <Text className="text-gray-600 text-xs">{vendor.user?.vendor_status || 'Active'}</Text>
              </View>
            </View>
            {/* Edit Profile Button REMOVED */}
          </View>
        </View>
        
        {/* --- Quick Stats --- */}
        <View className="flex-row gap-3 mt-4 mx-4">
          <View className="flex-1 bg-white rounded-xl shadow-md p-4">
            <View className="flex-row items-center justify-between">
              <View>
                {/* HARDCODED: Total Orders */}
                <Text className="text-gray-500 text-xs">Total Orders</Text>
                <Text className="text-gray-800 text-lg font-bold">156</Text> 
              </View>
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="bag-outline" size={16} color="#3b82f6" />
              </View>
            </View>
          </View>
          
          <View className="flex-1 bg-white rounded-xl shadow-md p-4">
            <View className="flex-row items-center justify-between">
              <View>
                 {/* HARDCODED: Earnings */}
                <Text className="text-gray-500 text-xs">Earnings</Text>
                <Text className="text-gray-800 text-lg font-bold">$3,250</Text> 
              </View>
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                <Ionicons name="cash-outline" size={16} color="#10b981" />
              </View>
            </View>
          </View>
        </View>

        {/* --- Personal Information (Expandable) --- */}
        <View className="mt-4 mx-4 bg-white rounded-xl shadow-md overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center gap-4 px-4 py-3 border-b border-gray-200"
            onPress={() => toggleSection('personal')}
            activeOpacity={1}
          >
            <View className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: lightPrimary }}>
              <Ionicons name="person-circle-outline" size={22} color={primaryColor} />
            </View>
            {/* HARDCODED: Personal Information */}
            <Text className="flex-1 text-[#333] font-medium">Personal Information</Text>
            <Ionicons
              name={expandedSection === 'personal' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>

          {expandedSection === 'personal' && (
            <View className="px-5 py-4 space-y-3">
              <DataRow iconName="person-outline" label={t('profile.fullName') || 'Full Name'} value={vendor.user?.name} />
              <DataRow iconName="mail-outline" label={t('profile.email') || 'Email'} value={vendor.user?.email} />
              <DataRow iconName="call-outline" label={t('profile.phone') || 'Phone'} value={vendor.user?.phone_number} />
              <DataRow
                iconName="male-female-outline"
                label={t('profile.gender') || 'Gender'}
                value={
                  vendor.user?.gender 
                  ? vendor.user.gender.charAt(0).toUpperCase() + vendor.user.gender.slice(1) 
                  : 'N/A'
                }
              />
            </View>
          )}
        </View>

        {/* --- Shop Information (Expandable) --- */}
        <View className="mt-4 mx-4 bg-white rounded-xl shadow-md overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center gap-4 px-4 py-3 border-b border-gray-200"
            onPress={() => toggleSection('shop')}
            activeOpacity={1}
          >
            <View className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: lightPrimary }}>
              <Ionicons name="storefront-outline" size={22} color={primaryColor} />
            </View>
            {/* HARDCODED: Shop Information */}
            <Text className="flex-1 text-[#333] font-medium">Shop Information</Text>
            <Ionicons
              name={expandedSection === 'shop' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>

          {expandedSection === 'shop' && (
            <View className="px-5 py-4 space-y-3">
              <DataRow iconName="business-outline" label={t('profile.shopName') || 'Shop Name'} value={vendor.info?.shop_name} />
              <DataRow iconName="location-outline" label={t('profile.location') || 'Location'} value={vendor.info?.shop_location} />
              <DataRow iconName="person-outline" label={t('profile.owner') || 'Owner'} value={vendor.info?.owner_name} />
              <DataRow iconName="pricetag-outline" label={t('profile.shopCategory') || 'Category'} value={vendor.info?.category_name} />
            </View>
          )}
        </View>

        {/* --- Menu Options --- */}
        <View className="mt-4 mx-4 bg-white rounded-xl shadow-md overflow-hidden">
          {/* Edit Profile */}
          <TouchableOpacity
            className="flex-row items-center justify-between gap-4 px-4 py-3 border-b border-gray-200"
            onPress={() => router.push('/vendor/EditVendorProfile')}
            activeOpacity={1}
          >
            <View className="flex-row items-center flex-1">
              <View className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: lightPrimary }}>
                <Ionicons name="create-outline" size={22} color={primaryColor} />
              </View>
               {/* HARDCODED: Edit Profile */}
              <Text className="ml-4 text-gray-800 font-medium">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          {/* Privacy & Security */}
          <TouchableOpacity
            className="flex-row items-center justify-between gap-4 px-4 py-3 border-b border-gray-200"
            onPress={() => toggleSection('security')}
            activeOpacity={1}
          >
            <View className="flex-row items-center flex-1">
              <View className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: lightPrimary }}>
                <Ionicons name="shield-checkmark-outline" size={22} color={primaryColor} />
              </View>
              {/* HARDCODED: Privacy & Security */}
              <Text className="ml-4 text-gray-800 font-medium">Privacy & Security</Text>
            </View>
            <Ionicons
              name={expandedSection === 'security' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
          {expandedSection === 'security' && (
              <View className="px-5 py-3">
                  <Text className="text-gray-700">Manage your account and data security settings.</Text>
              </View>
          )}
          
          {/* Help & Support */}
          <TouchableOpacity
            className="flex-row items-center justify-between gap-4 px-4 py-3" 
            onPress={() => toggleSection('support')}
            activeOpacity={1}
          >
            <View className="flex-row items-center flex-1">
              <View className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: lightPrimary }}>
                <Ionicons name="help-circle-outline" size={22} color={primaryColor} />
              </View>
              {/* HARDCODED: Help & Support */}
              <Text className="ml-4 text-gray-800 font-medium">Help & Support</Text>
            </View>
            <Ionicons
              name={expandedSection === 'support' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
          {expandedSection === 'support' && (
              <View className="px-5 py-3">
                  <Text className="text-gray-700">Contact us or view FAQs for assistance.</Text>
              </View>
          )}
        </View>

        {/* --- Logout Button --- */}
        <View className="px-4 mt-6 mb-10">
          <TouchableOpacity
            className="flex-row w-full items-center justify-center gap-2 rounded-xl py-3"
            style={{ backgroundColor: '#FFEDED' }} // Light red background
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#E53935" />
            <Text className="text-red-500 font-bold">{t('common.logout') || 'Logout'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}