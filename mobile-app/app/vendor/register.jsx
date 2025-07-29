import axios from 'axios';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

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
  });
  const [logo, setLogo] = useState(null);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);
  const [shopFrontPhoto, setShopFrontPhoto] = useState(null);
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  // Use the same pickImage logic as customer registration
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logo && logo.uri) {
      formData.append('logo', {
        uri: logo.uri,
        name: logo.name || 'logo.jpg',
        type: logo.type || 'image/jpeg',
      });
    }
    if (passportPhoto && passportPhoto.uri) {
      formData.append('passport_photo', {
        uri: passportPhoto.uri,
        name: passportPhoto.name || 'passport.jpg',
        type: passportPhoto.type || 'image/jpeg',
      });
    }
    if (licensePhoto && licensePhoto.uri) {
      formData.append('license_photo', {
        uri: licensePhoto.uri,
        name: licensePhoto.name || 'license.jpg',
        type: licensePhoto.type || 'image/jpeg',
      });
    }
    if (shopFrontPhoto && shopFrontPhoto.uri) {
      formData.append('shop_front_photo', {
        uri: shopFrontPhoto.uri,
        name: shopFrontPhoto.name || 'shopfront.jpg',
        type: shopFrontPhoto.type || 'image/jpeg',
      });
    }
    try {
      await axios.post(`${BACKEND_URL}/api/vendor/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Registration successful!');
      router.push('/vendor/login');
    } catch (err) {
      setImageError('Registration failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView className="bg-white flex-1 px-6 pt-12 pb-20">
      <Text className="text-3xl font-bold text-green-600 mb-6 text-center">Vendor Registration</Text>

      {/* Logo Picker - required */}
      <View className="items-center mb-6">
        <TouchableOpacity
          onPress={() => pickImage(setLogo)}
          className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-green-600 items-center justify-center mb-2"
          activeOpacity={0.7}
        >
          {logo && logo.uri ? (
            <Image
              source={{ uri: logo.uri }}
              style={{ width: 112, height: 112, borderRadius: 56 }}
            />
          ) : (
            <Ionicons name="image" size={44} color="#22c55e" />
          )}
        </TouchableOpacity>
        <Text className="text-xs text-green-700 font-semibold mt-1 text-center">Logo (required)</Text>
      </View>

      {/* Image Pickers - styled like customer registration */}
      <View className="flex-row justify-between mb-6">
        {[{
          label: 'Passport Photo',
          image: passportPhoto,
          setter: setPassportPhoto,
        }, {
          label: 'License Photo',
          image: licensePhoto,
          setter: setLicensePhoto,
        }, {
          label: 'Shop Front Photo',
          image: shopFrontPhoto,
          setter: setShopFrontPhoto,
        }].map(({ label, image, setter }, idx) => (
          <View key={label} className="items-center flex-1 mx-1">
            <TouchableOpacity
              onPress={() => pickImage(setter)}
              className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-green-400 items-center justify-center mb-2"
              activeOpacity={0.7}
            >
              {image && image.uri ? (
                <Image
                  source={{ uri: image.uri }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : (
                <Ionicons name="camera" size={36} color="#22c55e" />
              )}
            </TouchableOpacity>
            <Text className="text-xs text-primary font-semibold mt-1 text-center">{label}</Text>
          </View>
        ))}
      </View>
      {imageError ? <Text className="text-red-500 text-xs mb-4 text-center">{imageError}</Text> : null}

      {/* Form Fields */}
      {[ 
        { label: 'Full Name', key: 'name', keyboard: 'default' },
        { label: 'Email', key: 'email', keyboard: 'email-address' },
        { label: 'Password', key: 'password', secure: true },
        { label: 'Phone Number', key: 'phone_number', keyboard: 'phone-pad' },
        { label: 'Shop Name', key: 'shop_name', keyboard: 'default' },
        { label: 'Shop Location', key: 'shop_location', keyboard: 'default' },
        { label: 'Owner Name', key: 'owner_name', keyboard: 'default' },
      ].map(({ label, key, keyboard, secure }) => (
        <View key={key} className="mb-5">
          <Text className="mb-2 text-gray-700 font-medium">{label}</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-green-500"
            placeholder={label}
            keyboardType={keyboard}
            secureTextEntry={secure}
            value={form[key]}
            onChangeText={(val) => handleChange(key, val)}
          />
        </View>
      ))}

      {/* Gender Picker */}
      <View className="mb-6">
        <Text className="mb-2 text-gray-700 font-medium">Gender</Text>
        <View className="flex-row space-x-4">
          {['male', 'female'].map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => handleChange('gender', g)}
              className={`flex-1 mx-2 py-3 rounded-xl border ${
                form.gender === g ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'
              }`}
            >
              <Text className={`text-center text-base font-medium ${
                form.gender === g ? 'text-white' : 'text-gray-800'
              }`}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Register Button */}
      <TouchableOpacity
        onPress={handleRegister}
        className="bg-green-600 py-4 rounded-xl"
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-bold text-lg">Register</Text>
        )}
      </TouchableOpacity>
      {/* Login Link */}
      <View className="flex-row justify-center mt-2">
        <Text className="text-gray-600">Already have an account? </Text>
        <Link href="/vendor/login" asChild>
          <Text className="text-primary font-semibold">Login</Text>
        </Link>
      </View>
    </ScrollView>
  );
} 