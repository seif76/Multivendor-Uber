import axios from 'axios';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image, Text, TextInput, TouchableOpacity,
  View, Alert, ActivityIndicator, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import mime from "mime";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const VEHICLE_TYPES = ['motorcycle','car', 'van'];

export default function DeliverymanRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
  });

  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    vehicle_type: 'motorcycle',
    color: '',
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [driverLicensePhoto, setDriverLicensePhoto] = useState(null);
  const [nationalIdPhoto, setNationalIdPhoto] = useState(null);
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const primaryColor = "#20df20";

  const isBicycle = vehicleData.vehicle_type === 'bicycle';

  const handleChange = (key, value) => setForm({ ...form, [key]: value });
  const handleVehicleChange = (key, value) => {
    setVehicleData({ ...vehicleData, [key]: value });
    // clear driver license photo when switching to bicycle
    if (key === 'vehicle_type' && value === 'bicycle') {
      setDriverLicensePhoto(null);
    }
  };

  const pickImage = async (setter) => {
    setImageError('');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photos.');
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
  
    const requiredFields = ['name', 'email', 'password', 'phone_number', 'gender'];
    const missingFields = requiredFields.filter(field => !form[field]);
    if (missingFields.length > 0) {
      setImageError(`Missing required fields: ${missingFields.join(', ')}`);
      setUploading(false);
      return;
    }
  
    const requiredVehicleFields = isBicycle
      ? ['make', 'model', 'color']
      : ['make', 'model', 'year', 'license_plate', 'color'];
    const missingVehicleFields = requiredVehicleFields.filter(field => !vehicleData[field]);
    if (missingVehicleFields.length > 0) {
      setImageError(`Missing vehicle fields: ${missingVehicleFields.join(', ')}`);
      setUploading(false);
      return;
    }
  
    if (!nationalIdPhoto) {
      setImageError('National ID photo is required.');
      setUploading(false);
      return;
    }
  
    const formData = new FormData();
  
    // personal fields
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
  
    // vehicle fields — send as flat keys, not nested
    // ← your backend uses multer which may not parse vehicleData[key] correctly
    
    Object.entries(vehicleData).forEach(([key, value]) => {
      if (key === 'year' && isBicycle) {
        formData.append('vehicleData[year]', '2000'); // placeholder for bicycle
      } else if (key === 'license_plate' && isBicycle) {
        formData.append('vehicleData[license_plate]', 'N/A'); // placeholder for bicycle
      } else if (value) {
        formData.append(`vehicleData[${key}]`, value);
      }
    });
  
    const appendFile = (fieldName, file) => {
      if (!file) return;
      const newImageUri = file.uri;
      const fileName = newImageUri.split("/").pop();
      const fileType = mime.getType(newImageUri) || 'image/jpeg'; // ← fallback
      formData.append(fieldName, { uri: newImageUri, type: fileType, name: fileName });
    };

    appendFile('profile_photo', profilePhoto);
    appendFile('driver_license_photo', driverLicensePhoto);
    appendFile('national_id_photo', nationalIdPhoto);
  
    
  
    try {
      await axios.post(`${BACKEND_URL}/api/deliveryman/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        transformRequest: (data) => data,
      });
      Alert.alert('Success', 'Registration successful!');
      router.push('/deliveryMan/login');
    } catch (err) {
      console.log('Registration error:', err.response?.data || err.message);
      setImageError('Registration failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const renderInput = (label, key, placeholder, keyboardType = 'default', iconName = null, isVehicle = false) => (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {label} <Text className="text-red-400">*</Text>
      </Text>
      <View className="relative">
        <TextInput
          className={`w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-900 ${
            iconName ? 'pl-10 pr-4' : 'px-4'
          }`}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          value={isVehicle ? vehicleData[key] : form[key]}
          onChangeText={(val) => isVehicle ? handleVehicleChange(key, val) : handleChange(key, val)}
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
    <View className="flex-1 bg-white">
      {/* App Bar */}
      <View className="flex-row items-center bg-white p-4 pb-3 justify-between border-b border-gray-200 pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 text-center text-gray-900">Deliveryman Registration</Text>
        <View className="w-10" />
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
        enableAutomaticScroll={true}
      >
        <View className="space-y-6">

          {/* ── Profile Photo ── */}
          <View>
            <Text className="text-gray-900 text-[22px] font-bold pb-3 pt-2">Profile Photo</Text>
            <View className="items-center">
              <TouchableOpacity
                onPress={() => pickImage(setProfilePhoto)}
                className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center"
              >
                {profilePhoto?.uri ? (
                  <Image source={{ uri: profilePhoto.uri }} className="w-28 h-28 rounded-full" />
                ) : (
                  <Ionicons name="camera-outline" size={44} color="#6b7280" />
                )}
              </TouchableOpacity>
              <Text className="text-gray-500 text-sm mt-2">Optional</Text>
            </View>
          </View>

          {/* ── Documents ── */}
          <View>
            <Text className="text-gray-900 text-[22px] font-bold pb-3 pt-2">Documents</Text>
            <View className="flex-row gap-4">
              {/* National ID */}
              <View className="flex-1 items-center gap-2">
                <TouchableOpacity
                  onPress={() => pickImage(setNationalIdPhoto)}
                  className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  {nationalIdPhoto?.uri ? (
                    <Image source={{ uri: nationalIdPhoto.uri }} className="w-full h-28 rounded-lg" resizeMode="cover" />
                  ) : (
                    <Ionicons name="id-card-outline" size={44} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 text-sm">National ID <Text className="text-red-400">*</Text></Text>
              </View>

              {/* Driver License — hidden for bicycle */}
              {!isBicycle && (
                <View className="flex-1 items-center gap-2">
                  <TouchableOpacity
                    onPress={() => pickImage(setDriverLicensePhoto)}
                    className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    {driverLicensePhoto?.uri ? (
                      <Image source={{ uri: driverLicensePhoto.uri }} className="w-full h-28 rounded-lg" resizeMode="cover" />
                    ) : (
                      <Ionicons name="document-text-outline" size={44} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                  <Text className="text-gray-600 text-sm">Driver License <Text className="text-red-400">*</Text></Text>
                </View>
              )}
            </View>
          </View>

          {/* Error */}
          {imageError ? (
            <Text className="text-red-500 text-sm text-center">{imageError}</Text>
          ) : null}

          {/* ── Personal Information ── */}
          <View className="space-y-4">
            <Text className="text-gray-900 text-[22px] font-bold pb-1 pt-2">Personal Information</Text>

            {renderInput('Full Name', 'name', 'Enter your full name')}
            {renderInput('Email', 'email', 'example@email.com', 'email-address')}

            {/* Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Password <Text className="text-red-400">*</Text>
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-900 pl-10 pr-4"
                  placeholder="********"
                  placeholderTextColor="#9CA3AF"
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

            {/* Gender */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Gender <Text className="text-red-400">*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowGenderModal(true)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex-row justify-between items-center"
              >
                <Text className={`capitalize ${!form.gender ? 'text-gray-400' : 'text-gray-900'}`}>
                  {form.gender || 'Select gender...'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Vehicle Information ── */}
          <View className="space-y-4">
            <Text className="text-gray-900 text-[22px] font-bold pb-1 pt-2">Vehicle Information</Text>

            {/* Vehicle Type Toggle */}
            <View className="flex-row flex-wrap gap-2">
              {VEHICLE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleVehicleChange('vehicle_type', type)}
                  className={`py-2.5 px-4 rounded-lg border capitalize ${
                    vehicleData.vehicle_type === type
                      ? 'border-transparent'
                      : 'bg-white border-gray-200'
                  }`}
                  style={[
                    { minWidth: '45%' },
                    vehicleData.vehicle_type === type ? { backgroundColor: primaryColor } : {}
                  ]}
                >
                  <Text className={`text-center text-sm font-medium capitalize ${
                    vehicleData.vehicle_type === type ? 'text-black' : 'text-gray-600'
                  }`}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">{renderInput('Make', 'make', 'e.g. Honda', 'default', null, true)}</View>
              <View className="flex-1">{renderInput('Model', 'model', 'e.g. CB150', 'default', null, true)}</View>
            </View>

            {!isBicycle && (
              <View className="flex-row gap-3">
                <View className="flex-1">{renderInput('Year', 'year', 'e.g. 2022', 'numeric', null, true)}</View>
                <View className="flex-1">{renderInput('License Plate', 'license_plate', 'e.g. ABC-1234', 'default', null, true)}</View>
              </View>
            )}

            {renderInput('Color', 'color', 'e.g. Red', 'default', null, true)}
          </View>

          {/* ── Register Button ── */}
          <View className="pt-2 pb-8">
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
            <Link href="/deliveryMan/login" asChild>
              <Text className="font-semibold" style={{ color: primaryColor }}>Login</Text>
            </Link>
          </View>

        </View>
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
            <TouchableOpacity
              onPress={() => setShowGenderModal(false)}
              className="p-4 border-t border-gray-200"
            >
              <Text className="text-center text-base font-medium" style={{ color: primaryColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}
