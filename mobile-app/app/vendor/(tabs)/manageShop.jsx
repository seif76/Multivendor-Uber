import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

export default function ManageShopScreen() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState('');

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
      const response = await axios.get(`${BACKEND_URL}/api/vendor/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.data;
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

  const pickImage = async () => {
    try {
      setImageError('');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        setImageError('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        setImage({
          uri: selectedImage.uri,
          name: selectedImage.fileName || 'shop_front_photo.jpg',
          type: 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setImageError('Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!form.shop_name || !form.shop_location || !form.owner_name || !form.phone_number) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      let requestBody;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      if (image && image.uri) {
        // User picked a new image - send file in FormData
        const formData = new FormData();
        formData.append('shop_name', form.shop_name);
        formData.append('shop_location', form.shop_location);
        formData.append('owner_name', form.owner_name);
        formData.append('phone_number', form.phone_number);
        formData.append('shop_front_photo', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        });
        requestBody = formData;
      } else {
        // No new image - send only text fields, do NOT include shop_front_photo
        const formData = new FormData();
        formData.append('shop_name', form.shop_name);
        formData.append('shop_location', form.shop_location);
        formData.append('owner_name', form.owner_name);
        formData.append('phone_number', form.phone_number);
        requestBody = formData;
      }

      // Don't set Content-Type for FormData, let axios set it
      const res = await axios.put(`${BACKEND_URL}/api/vendor/update-profile`, requestBody, { headers });

      Alert.alert('Success', 'Shop information updated successfully!');
      setEditMode(false);
      setImage(null);
      fetchVendorProfile();
    } catch (error) {
      console.error('Error updating shop:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update shop information';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setImage(null);
    setImageError('');
    // Reset form to original values
    setForm({
      shop_name: shop?.shop_name || '',
      shop_location: shop?.shop_location || '',
      owner_name: shop?.owner_name || '',
      phone_number: shop?.phone_number || '',
      shop_front_photo: shop?.shop_front_photo || '',
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f9d58" />
        <Text className="text-gray-600 mt-4">Loading shop information...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-200 bg-white">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Manage Shop</Text>
            <Text className="text-gray-500 mt-1">Update your shop information</Text>
          </View>
          <TouchableOpacity
            onPress={() => editMode ? cancelEdit() : setEditMode(true)}
            className={`px-6 py-2 rounded-full ${editMode ? 'bg-red-500' : 'bg-primary'}`}
          >
            <Text className="text-white font-semibold text-base">
              {editMode ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Banner Image */}
        <View className="w-full h-48 md:h-64 relative bg-gray-100">
          <Image
            source={{
              uri: image?.uri || form.shop_front_photo || 'https://via.placeholder.com/800x300.png?text=No+Image',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {editMode && (
            <TouchableOpacity
              onPress={pickImage}
              className="absolute bottom-4 right-6 bg-black/70 rounded-full p-3"
              style={{ elevation: 4 }}
            >
              <Ionicons name="camera" size={28} color="white" />
            </TouchableOpacity>
          )}
        </View>
        {imageError ? (
          <View className="px-6 py-2 bg-red-50 border-b border-red-200">
            <Text className="text-red-600 text-sm text-center">{imageError}</Text>
          </View>
        ) : null}
        {editMode && (
          <View className="px-6 py-2 bg-blue-50 border-b border-blue-200">
            <Text className="text-blue-700 text-sm text-center font-medium">
              Tap the camera icon to change the shop front photo
            </Text>
          </View>
        )}

        {/* Form Section */}
        <ScrollView className="flex-1 px-6 pt-8" keyboardShouldPersistTaps="handled">
          <SectionHeader title="Shop Information" />
          <View className="border-t border-gray-200 mt-2 mb-6" />
          <FormField
            label="Shop Name"
            value={form.shop_name}
            editable={editMode}
            onChangeText={(val) => handleChange('shop_name', val)}
            placeholder="Enter your shop name"
            icon="storefront"
            required
          />
          <Divider />
          <FormField
            label="Location"
            value={form.shop_location}
            editable={editMode}
            onChangeText={(val) => handleChange('shop_location', val)}
            placeholder="Enter shop location"
            icon="location"
            required
          />
          <Divider />
          <FormField
            label="Owner Name"
            value={form.owner_name}
            editable={editMode}
            onChangeText={(val) => handleChange('owner_name', val)}
            placeholder="Enter owner name"
            icon="person"
            required
          />
          <Divider />
          <FormField
          className={`${editMode ? 'border-2 border-gray-200 rounded-xl p-4 mb-10 pl-12 text-gray-800 bg-gray-50 text-base' : 'bg-gray-50 border-2 border-gray-200 rounded-xl  p-4 pl-12'}`}
            label="Phone Number"
            value={form.phone_number}
            editable={editMode}
            onChangeText={(val) => handleChange('phone_number', val)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            icon="call"
            required
          />
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Save Button (fixed at bottom) */}
        {editMode && (
          <View className="absolute left-0 right-0 bottom-0 mt-2 px-6 pb-8 pt-4 bg-white border-t border-gray-200" style={{ ...Platform.select({ android: { elevation: 8 } }) }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className={`w-full py-4 rounded-xl items-center ${saving ? 'bg-gray-400' : 'bg-primary'}`}
            >
              {saving ? (
                <View className="flex-row mt-2 items-center justify-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-bold ml-3 text-lg">Saving Changes...</Text>
                </View>
              ) : (
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text className="text-white font-bold ml-2 text-lg">Save Changes</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
    </TouchableWithoutFeedback>
    
  );
}

function SectionHeader({ title }) {
  return (
    <Text className="text-xl font-bold text-gray-800 mb-2 mt-2">{title}</Text>
  );
}

function Divider() {
  return <View className="border-b border-gray-200 my-2" />;
}

// Enhanced Form Field Component with icons and better styling
function FormField({ label, value, editable, onChangeText, placeholder, keyboardType = 'default', icon, required }) {
  return (
    <View className="mb-2">
      <View className="flex-row items-center mb-1">
        <Text className="text-gray-700 font-semibold text-base">{label}</Text>
        {required && <Text className="text-red-500 ml-1">*</Text>}
      </View>
      {editable ? (
        <View className="relative">
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            className="border-2 border-gray-200 rounded-xl p-4 pl-12 text-gray-800 bg-gray-50 text-base"
            placeholderTextColor="#9ca3af"
          />
          <View className="absolute left-4 top-4">
            <Ionicons name={icon} size={20} color="#6b7280" />
          </View>
        </View>
      ) : (
        <View className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 pl-12">
          <View className="absolute left-4 top-4">
            <Ionicons name={icon} size={20} color="#6b7280" />
          </View>
          <Text className="text-gray-800 font-medium text-base">
            {value || <Text className="text-gray-400">Not provided</Text>}
          </Text>
        </View>
      )}
    </View>
  );
}


