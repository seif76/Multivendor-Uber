
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SideNav({ visible, onClose }) {
  const router = useRouter();
  const [captain, setCaptain] = useState(null);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;


  const menuItems = [
    { icon: 'home', label: 'Home', type: MaterialIcons, route: '/captain/home' },
    { icon: 'dashboard', label: 'Dashboard', type: MaterialIcons, route: '/captain/login' },
    { icon: 'bell-outline', label: 'Notifications', type: MaterialCommunityIcons, route: '/captain/inbox' },
    { icon: 'history', label: 'Ride History', type: MaterialCommunityIcons, route: 'RideHistory' },
    { icon: 'wallet', label: 'Wallet', type: MaterialCommunityIcons, route: '/captain/wallet' },
    { icon: 'headset', label: 'Chat', type: MaterialCommunityIcons, route: '/captain/chat' },
    { icon: 'logout', label: 'Logout', type: MaterialCommunityIcons, route: 'Logout' },
  ];

  const handleNavigate = async (route) => {
    if (route === 'Logout') {
      await AsyncStorage.removeItem('token');
      router.push('/');
    } else {
      onClose();
      router.push(route);
    }
  };

  useEffect(() => {
    const fetchCaptain = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${BACKEND_URL}/api/captain/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setCaptain(data.user || data); // Adjust depending on how your response looks
        } else {
          console.error('Error:', data.error);
        }
      } catch (err) {
        console.error('Fetch captain error:', err.message);
      }
    };

    if (visible) fetchCaptain();
  }, [visible]);

  if (!visible) return null;

  return (
    <SafeAreaView className="absolute top-0 left-0 w-[70%] h-full bg-white z-50">
      <View className="flex-1 p-5">
        {/* Close Button */}
        <TouchableOpacity onPress={onClose} className="self-end mb-4">
          <MaterialCommunityIcons name="close" size={24} color="#000" />
        </TouchableOpacity>

        {/* Profile Section */}
        <View className="items-center mb-6">
          <FontAwesome5 name="user-circle" size={64} color="#999" />
          <Text className="mt-2 font-semibold text-lg">
            {captain ? captain.name : 'Loading...'}
          </Text>
          <Text className="text-pink-500">{captain?.phone_number || 'view profile'}</Text>
        </View>

        {/* Navigation Links */}
        {menuItems.map(({ icon, label, type: Icon, route }, i) => (
          <TouchableOpacity
            key={i}
            className="flex-row items-center py-3 space-x-4"
            onPress={() => handleNavigate(route)}
          >
            <Icon name={icon} size={20} color="#000" />
            <Text>{label}</Text>
          </TouchableOpacity>
        ))}

        {/* Bottom Button */}
        <TouchableOpacity className="mt-auto rounded-full bg-primary p-3 items-center justify-center">
          <Text className="text-white font-semibold">Switch to Rider</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
