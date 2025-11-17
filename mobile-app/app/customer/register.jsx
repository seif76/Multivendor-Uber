

import axios from 'axios';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, KeyboardAvoidingView ,Platform , TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
  });
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const pickImage = async () => {
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
        const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
  
        setImage({
          uri: asset.uri,
          name: fileName,
          type: 'image/jpeg', // you can also infer from extension
        });
      }
    } catch (err) {
      setImageError('Failed to pick image.');
      console.error('ImagePicker error:', err);
    }
  };
  

  const handleRegister = async () => {
    setUploading(true);
    setImageError('');
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (image?.uri) {
      formData.append('profile_photo', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      });
    }
    try {
      await axios.post(`${BACKEND_URL}/api/customers/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Registration successful!');
      router.push('/customer/login');
    } catch (err) {
      setImageError('Registration failed: ' + (err.response?.data?.error || err.message));
      console.error('Registration error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView className="bg-white flex-1 px-6 pt-12 pb-20">
      <Text className="text-3xl font-bold text-green-600 mb-6 text-center">Create Your Account</Text>

      {/* Profile Photo Picker */}
      <View className="items-center mb-5">
        <TouchableOpacity
          onPress={pickImage}
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
        <Text className="text-primary font-semibold mt-1">Pick Profile Photo</Text>
        {imageError ? <Text className="text-red-500 text-xs mt-1">{imageError}</Text> : null}
      </View>

      {/* Form Fields */}
      {[
        { label: 'Full Name', key: 'name', keyboard: 'default' },
        { label: 'Email', key: 'email', keyboard: 'email-address' },
        { label: 'Password', key: 'password', secure: true },
        { label: 'Phone Number', key: 'phone_number', keyboard: 'phone-pad' },
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
        className="bg-green-600 py-4 mb-2 rounded-xl "
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-bold text-lg">Register</Text>
        )}
      </TouchableOpacity>

       {/* Login Link */}
       <View className="flex-row justify-center mb-5 mt-2">
        <Text className="text-gray-600">Already have an account? </Text>
        <Link href="/customer/login" asChild>
          <Text className="text-primary font-semibold">Login</Text>
        </Link>
      </View>

    </ScrollView>
    </KeyboardAvoidingView>
  );
}
