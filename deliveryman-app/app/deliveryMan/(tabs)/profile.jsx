import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../context/LanguageContext';

// Enable animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DeliverymanProfile() {
  const [deliveryman, setDeliveryman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/deliveryman/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeliveryman(res.data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === key ? null : key);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          router.replace('/');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!deliveryman) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text>No data found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6f8f6]">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Profile Card */}
        <View className="bg-white p-4 shadow-sm">
          <View className="flex-row items-center gap-4">
            {deliveryman.profile_photo ? (
              <Image
                source={{ uri: deliveryman.profile_photo }}
                className="h-16 w-16 rounded-full border border-gray-300"
              />
            ) : (
              <View className="h-16 w-16 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="bicycle" size={28} color="#777" />
              </View>
            )}

            <View className="flex-1">
              <Text className="text-lg font-bold text-[#333]">
                {deliveryman.name}
              </Text>
              <Text className="text-sm text-gray-500">
                {deliveryman.phone_number || 'N/A'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/deliveryMan/EditProfilePage')}
              className="p-2 rounded-full bg-[#4CAF50]/10"
            >
              <Ionicons name="create-outline" size={22} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Info */}
        <View className="mt-4 mx-4 bg-white rounded-xl shadow-md overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center gap-4 px-4 py-3 border-b border-gray-200"
            onPress={() => toggleSection('personal')}
          >
            <View className="size-10 items-center justify-center rounded-lg bg-[#4CAF50]/10">
              <Ionicons name="person-outline" size={22} color="#4CAF50" />
            </View>
            <Text className="flex-1 font-medium text-[#333]">Personal Information</Text>
            <Ionicons
              name={expandedSection === 'personal' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>

          {expandedSection === 'personal' && (
            <View className="px-5 py-4 space-y-3">
              {[
                { label: 'Name', value: deliveryman.name },
                { label: 'Email', value: deliveryman.email },
                { label: 'Phone', value: deliveryman.phone_number },
                { label: 'Gender', value: deliveryman.gender },
                { label: 'Status', value: deliveryman.deliveryman_status },
              ].map((item, i) => (
                <Text key={i} className="text-gray-700">
                  <Text className="font-medium">{item.label}:</Text>{' '}
                  {item.value || 'N/A'}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Vehicle Info */}
        {deliveryman.delivery_vehicle && (
          <View className="mt-4 mx-4 bg-white rounded-xl shadow-md overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center gap-4 px-4 py-3 border-b border-gray-200"
              onPress={() => toggleSection('vehicle')}
            >
              <View className="size-10 items-center justify-center rounded-lg bg-[#4CAF50]/10">
                <Ionicons name="car-outline" size={22} color="#4CAF50" />
              </View>
              <Text className="flex-1 font-medium text-[#333]">Vehicle Information</Text>
              <Ionicons
                name={expandedSection === 'vehicle' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>

            {expandedSection === 'vehicle' && (
              <View className="px-5 py-4 space-y-3">
                <Text>Make: {deliveryman.delivery_vehicle.make}</Text>
                <Text>Model: {deliveryman.delivery_vehicle.model}</Text>
                <Text>Year: {deliveryman.delivery_vehicle.year}</Text>
                <Text>Plate: {deliveryman.delivery_vehicle.license_plate}</Text>
                <Text>Color: {deliveryman.delivery_vehicle.color}</Text>
              </View>
            )}
          </View>
        )}

        {/* Logout */}
        <View className="px-4 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 rounded-lg bg-red-500/10 py-3"
          >
            <Ionicons name="log-out-outline" size={20} color="#E53935" />
            <Text className="text-red-500 font-bold">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
