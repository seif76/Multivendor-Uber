import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VendorSideNav({ visible, onClose }) {
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const menuItems = [
    { icon: 'home', label: 'Home', type: MaterialIcons, route: '/vendor/home' },
    { icon: 'storefront', label: 'My Shop', type: MaterialIcons, route: '/vendor/manageShop' },
    { icon: 'inventory', label: 'Products', type: MaterialIcons, route: '/vendor/products' },
    { icon: 'receipt', label: 'Orders', type: MaterialIcons, route: '/vendor/orders' },
    { icon: 'wallet', label: 'Wallet', type: MaterialCommunityIcons, route: '/vendor/wallet' },
    { icon: 'headset', label: 'Support Chat', type: MaterialCommunityIcons, route: '/vendor/chat' },
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
    const fetchVendor = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${BACKEND_URL}/api/vendor/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setVendor(data.vendor || data);
        } else {
          console.error('Error:', data.error);
        }
      } catch (err) {
        console.error('Fetch vendor error:', err.message);
      }
    };

    if (visible) fetchVendor();
  }, [visible]);

  if (!visible) return null;

  return (
    <SafeAreaView className="absolute top-0 left-0 w-[70%] h-full bg-white z-50 ">
      <View className="flex-1 p-5">
        {/* Close */}
        <TouchableOpacity onPress={onClose} className="self-end mb-4">
          <MaterialCommunityIcons name="close" size={24} color="#000" />
        </TouchableOpacity>

        {/* Profile */}
        <View className="items-center mb-6">
          <FontAwesome5 name="user-circle" size={64} color="#999" />
          <Text className="mt-2 font-semibold text-lg">
            {vendor ? vendor.name : 'Loading...'}
          </Text>
          <Pressable onPress={()=> router.push('/vendor/profile') } className="bg-primary py-2 px-4 rounded-2xl " >
          <Text className="text-white">{ 'View Profile'}</Text>
          </Pressable>
        </View>

        {/* Menu Items */}
        {menuItems.map(({ icon, label, type: Icon, route }, i) => (
          <TouchableOpacity
            key={i}
            className="flex-row items-center py-3 space-x-4"
            onPress={() => handleNavigate(route)}
          >
            <Icon name={icon} size={20} color="#007233" />
            <Text className="text-gray-800">{label}</Text>
          </TouchableOpacity>
        ))}

        {/* Switch Role */}
        <TouchableOpacity className="mt-auto rounded-full bg-primary p-3 items-center justify-center">
          <Text className="text-white font-semibold">Switch Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
