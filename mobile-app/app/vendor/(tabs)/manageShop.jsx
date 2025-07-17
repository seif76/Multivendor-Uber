// import React from 'react';
// import { Image, Pressable, Text, View } from 'react-native';

// export default function ManageShopScreen() {
//   const shop = {
//     name: 'Seif’s Sweets',
//     location: 'New Cairo, Egypt',
//     description: 'We sell fresh sweets, cakes, and desserts daily.',
//     phone: '+20 123-456-7890',
//     logo: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
//   };

//   return (
//     <View className="flex-1 bg-white p-4">
//       <Text className="text-xl font-bold mb-4 text-gray-800">Manage Shop</Text>

//       <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
//         <Image source={{ uri: shop.logo }} className="w-full h-40 rounded-lg mb-4" resizeMode="cover" />
//         <Text className="text-lg font-semibold text-black">{shop.name}</Text>
//         <Text className="text-sm text-gray-600 mt-1">{shop.location}</Text>
//         <Text className="text-sm text-gray-500 mt-2">{shop.description}</Text>
//         <Text className="text-sm text-gray-500 mt-1">Phone: {shop.phone}</Text>

//         <Pressable className="mt-4 bg-primary py-2 rounded-full items-center">
//           <Text className="text-white font-semibold text-sm">Edit Shop Info</Text>
//         </Pressable>
//       </View>
//     </View>
//   );
// }

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

export default function ManageShopScreen() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    shop_name: '',
    shop_location: '',
    owner_name: '',
    phone_number: '',
    shop_front_photo: '',
  });

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/vendor/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const vendor = data?.vendor_info;
      setShop(vendor);
      setForm({
        shop_name: vendor?.shop_name || '',
        shop_location: vendor?.shop_location || '',
        owner_name: vendor?.owner_name || '',
        phone_number: vendor?.phone_number || '',
        shop_front_photo: vendor?.shop_front_photo || '',
      });
    } catch (err) {
      console.error('Error fetching vendor profile:', err);
      Alert.alert('Error', 'Failed to load shop info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/vendor/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update shop info');
      Alert.alert('Success', 'Shop updated');
      setEditMode(false);
      fetchVendorProfile(); // refresh
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f9d58" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-6 relative">
      {/* Edit Toggle Button */}
      <Pressable
        className="absolute top-6 right-4 z-10"
        onPress={() => setEditMode(!editMode)}
      >
        <Text className="text-primary font-semibold text-base">
          {editMode ? 'Cancel' : 'Edit'}
        </Text>
      </Pressable>

      <Text className="text-2xl font-bold mb-6 text-gray-800">Manage Shop</Text>

      <Image
        source={{
          uri: form.shop_front_photo || 'https://via.placeholder.com/400x200.png?text=No+Image',
        }}
        className="w-full h-48 rounded-xl mb-6"
        resizeMode="cover"
      />

      {/* Shop Details */}
      <View className="gap-4 pb-10">
        <FormField
          label="Shop Name"
          value={form.shop_name}
          editable={editMode}
          onChangeText={(val) => handleChange('shop_name', val)}
        />

        <FormField
          label="Location"
          value={form.shop_location}
          editable={editMode}
          onChangeText={(val) => handleChange('shop_location', val)}
        />

        <FormField
          label="Owner Name"
          value={form.owner_name}
          editable={editMode}
          onChangeText={(val) => handleChange('owner_name', val)}
        />

        <FormField
          label="Phone Number"
          value={form.phone_number}
          editable={editMode}
          onChangeText={(val) => handleChange('phone_number', val)}
        />

        <FormField
          label="Image URL"
          value={form.shop_front_photo}
          editable={editMode}
          onChangeText={(val) => handleChange('shop_front_photo', val)}
        />
      </View>

      {editMode && (
        <Pressable
          className="mt-6 bg-primary py-3 rounded-full items-center"
          onPress={handleSave}
        >
          <Text className="text-white font-semibold text-base">Save Changes</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ✅ Reusable input or display block
function FormField({ label, value, editable, onChangeText }) {
  return (
    <View>
      <Text className="text-gray-500 mb-1">{label}</Text>
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          className="border border-gray-300 rounded-md p-2 text-black"
        />
      ) : (
        <Text className="text-base text-black font-medium">{value || '-'}</Text>
      )}
    </View>
  );
}


