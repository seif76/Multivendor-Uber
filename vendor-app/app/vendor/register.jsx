import axios from 'axios';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import mime from "mime";

export default function VendorRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
    shop_name: '',
    shop_location: '',
    owner_name: '',
    category: '',
  });

  const [logo, setLogo] = useState(null);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);
  const [shopFrontPhoto, setShopFrontPhoto] = useState(null);
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [securePassword, setSecurePassword] = useState(true);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const primaryColor = "#20df20";

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSelectCategory = (categoryName) => {
    handleChange('category', categoryName);
    setIsDropdownOpen(false);
  };

  const selectedCategoryName =
    categories.find((c) => c.name === form.category)?.name || 'Select a category...';

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/category`);
      let categoriesArray = [];
      if (Array.isArray(response.data)) {
        categoriesArray = response.data;
      } else if (response.data && Array.isArray(response.data.categories)) {
        categoriesArray = response.data.categories;
      } else if (response.data && Array.isArray(response.data.data)) {
        categoriesArray = response.data.data;
      }
      setCategories(categoriesArray);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setImageError('Failed to load shop categories. Please try again.');
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const pickImage = async (setter) => {
    setImageError('');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setImageError('Permission to access media library is required!');
        Alert.alert('Permission required', 'Please allow access to your photos to select a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setter({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
      } else {
        setter(null);
      }
    } catch (err) {
      setImageError('Failed to pick image.');
    }
  };

  const handleRegister = async () => {
    setUploading(true);
    setImageError('');

    if (!logo || !logo.uri) {
      setImageError('Logo is required.');
      setUploading(false);
      return;
    }

    const requiredFields = ['name', 'email', 'password', 'phone_number', 'shop_name', 'shop_location', 'owner_name', 'gender', 'category'];
    const missingFields = requiredFields.filter(field =>
      form[field] === null || form[field] === undefined || form[field] === ''
    );

    if (missingFields.length > 0) {
      setImageError(`Missing required fields: ${missingFields.join(', ')}`);
      setUploading(false);
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    const appendFile = (fieldName, file) => {
      if (!file) return;
      const newImageUri = file.uri;
      const fileName = newImageUri.split("/").pop();
      const fileType = mime.getType(newImageUri);
      formData.append(fieldName, { uri: newImageUri, type: fileType, name: fileName });
    };
    
    appendFile("logo", logo);
    appendFile('passport_photo', passportPhoto);
    appendFile('license_photo', licensePhoto);
    appendFile('shop_front_photo', shopFrontPhoto);

    try {
      await axios.post(`${BACKEND_URL}/api/vendor/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Registration successful!');
      router.push('/vendor/login');
    } catch (err) {
      setImageError('Registration failed: ' + (err.response?.data?.error || 'A user with this email or phone may already exist.'));
      console.error("Registration Error:", err.response?.data || err.message);
    } finally {
      setUploading(false);
    }
  };

  const renderInput = (label, key, placeholder, keyboardType = 'default', iconName = null) => (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      <View className="relative">
        <TextInput
          className={`w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 ${
            iconName ? 'pl-10 pr-4' : 'px-4'
          }`}
          style={{ focus: { borderColor: primaryColor } }}
          placeholder={placeholder}
          keyboardType={keyboardType}
          value={form[key]}
          onChangeText={(val) => handleChange(key, val)}
        />
        {iconName && (
          <View className="absolute left-3 top-0 bottom-0 justify-center">
            <Ionicons name={iconName} size={20} color="#9CA3AF" />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View  className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* App Bar */}
      <View className="flex-row items-center bg-white p-4 pb-3 justify-between sticky top-0 z-10 border-b border-gray-200 pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 text-center text-gray-900">New Store Registration</Text>
        <View className="w-10" />
      </View>
      <KeyboardAwareScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}        // ← key prop for Android
      extraScrollHeight={20}        // ← extra space above keyboard
      enableAutomaticScroll={true}
    >
      <ScrollView className="flex-1"  contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled"  >
        <View className="space-y-6">

          {/* Visual Identity Section */}
          <View>
            <Text className="text-gray-900 text-[22px] font-bold pb-3 pt-2">Visual Identity</Text>
            <View className="flex-row gap-4">
              <View className="flex-1 items-center gap-2">
                <TouchableOpacity
                  onPress={() => pickImage(setLogo)}
                  className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center"
                >
                  {logo && logo.uri ? (
                    <Image source={{ uri: logo.uri }} className="w-28 h-28 rounded-full" />
                  ) : (
                    <Ionicons name="camera-outline" size={44} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 text-sm">Logo (Required)</Text>
              </View>
              <View className="flex-1 items-center gap-2">
                <TouchableOpacity
                  onPress={() => pickImage(setShopFrontPhoto)}
                  className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  {shopFrontPhoto && shopFrontPhoto.uri ? (
                    <Image source={{ uri: shopFrontPhoto.uri }} className="w-full h-28 rounded-lg" resizeMode="cover" />
                  ) : (
                    <Ionicons name="image-outline" size={44} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 text-sm">Shop Front Photo</Text>
              </View>
            </View>
          </View>

          {/* Legal & Verification Section */}
          <View className="mt-4">
            <Text className="text-gray-900 text-[22px] font-bold pb-3 pt-2">Legal & Verification</Text>
            <View className="flex-row gap-4">
              <View className="flex-1 items-center gap-2">
                <TouchableOpacity
                  onPress={() => pickImage(setLicensePhoto)}
                  className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  {licensePhoto && licensePhoto.uri ? (
                    <Image source={{ uri: licensePhoto.uri }} className="w-full h-28 rounded-lg" resizeMode="cover" />
                  ) : (
                    <Ionicons name="document-text-outline" size={44} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 text-sm">License Photo</Text>
              </View>
              <View className="flex-1 items-center gap-2">
                <TouchableOpacity
                  onPress={() => pickImage(setPassportPhoto)}
                  className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  {passportPhoto && passportPhoto.uri ? (
                    <Image source={{ uri: passportPhoto.uri }} className="w-full h-28 rounded-lg" resizeMode="cover" />
                  ) : (
                    <Ionicons name="person-outline" size={44} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 text-sm">Owner's ID Photo</Text>
              </View>
            </View>
          </View>

          {/* Error Message */}
          {imageError ? (
            <Text className="text-red-500 text-sm text-center">{imageError}</Text>
          ) : null}

          {/* Form Fields */}
          <View className="space-y-4">
            {renderInput('Full Name', 'name', 'Enter your full name')}
            {renderInput('Email', 'email', 'example@email.com', 'email-address')}

            {/* Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
              <View className="relative">
                <TextInput
                  className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 pl-10 pr-4"
                  style={{ focus: { borderColor: primaryColor } }}
                  placeholder="********"
                  secureTextEntry={securePassword}
                  value={form.password}
                  onChangeText={(val) => handleChange('password', val)}
                />
                <TouchableOpacity
                  className="absolute left-3 top-0 bottom-0 justify-center"
                  onPress={() => setSecurePassword(prev => !prev)}
                >
                  <Ionicons name={securePassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {renderInput('Phone Number', 'phone_number', 'Enter phone number', 'phone-pad')}
            {renderInput('Shop Name', 'shop_name', 'Enter your shop name')}
            {renderInput('Shop Location', 'shop_location', 'Select location on map', 'default', 'location-outline')}
            {renderInput('Owner Name', 'owner_name', "Enter the owner's name")}

            {/* Category Dropdown */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-1">Shop Category</Text>
              <TouchableOpacity
                className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-gray-50 flex-row justify-between items-center"
                onPress={() => setIsDropdownOpen((prev) => !prev)}
              >
                <Text className={`text-base ${form.category === '' ? 'text-gray-400' : 'text-gray-900'}`}>
                  {selectedCategoryName}
                </Text>
                <Ionicons name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color="gray" />
              </TouchableOpacity>
              {isDropdownOpen && (
              <View className="border border-gray-300 rounded-xl mt-1 bg-white" style={{ maxHeight: 200, overflow: 'scroll' }}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item.id.toString()}
                    className="px-4 py-3 border-b border-gray-200"
                    onPress={() => handleSelectCategory(item.name)}
                  >
                    <Text className="text-base text-gray-800">{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            </View>

            {/* Gender */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Gender</Text>
              <TouchableOpacity
                onPress={() => setShowGenderModal(true)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg"
              >
                <Text className={`capitalize ${!form.gender ? 'text-gray-400' : 'text-gray-900'}`}>
                  {form.gender || 'Select gender...'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <View className="pt-4 pb-8">
            <TouchableOpacity
              onPress={handleRegister}
              className="w-full py-3 px-4 rounded-lg shadow-md"
              style={{ backgroundColor: primaryColor }}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-center text-black font-bold text-lg">Register</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center mt-2 pb-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/vendor/login" asChild>
              <Text className="font-semibold" style={{ color: primaryColor }}>Login</Text>
            </Link>
          </View>

        </View>
      </ScrollView>
      </KeyboardAwareScrollView>

      {/* Gender Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/50 p-4"
          activeOpacity={1}
          onPressOut={() => setShowGenderModal(false)}
        >
          <View
            className="w-full max-w-sm bg-white rounded-lg shadow-lg"
            onStartShouldSetResponder={() => true}
          >
            <Text className="text-lg font-bold text-gray-900 p-4 border-b border-gray-200">Select Gender</Text>
            <View>
              {[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }].map(item => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    handleChange('gender', item.value);
                    setShowGenderModal(false);
                  }}
                  className="p-4 border-b border-gray-100"
                >
                  <Text className="text-base text-gray-800">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowGenderModal(false)}
              className="p-4 border-t border-gray-200"
            >
              <Text className="text-center text-base font-medium" style={{ color: primaryColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
     

    </View >
  );
}