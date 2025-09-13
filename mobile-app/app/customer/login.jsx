import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View, Image, ActivityIndicator, TouchableWithoutFeedback, Keyboard   } from 'react-native';
import axios from 'axios';

export default function CustomerLogin() {
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL || "http://test:5000";
  const BACKEND_URL_EAS = Constants.expoConfig.extra.EXPO_PUBLIC_BACKEND_URL || "http://test:5000";

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!phoneOrEmail || !password) {
      setError('Please enter phone and password');
      return;
    }
    setLoading(true);
    
    // Debug: Log the backend URL
   // alert('BACKEND_URL:'+ BACKEND_URL);
   // alert('BACKEND_URL_EAS:'+ BACKEND_URL_EAS);
    //alert('Full URL:', `${BACKEND_URL}/api/customers/auth/login`);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/customers/auth/login`, {
        phone_number: phoneOrEmail,
        password,
      });
      const data = response.data;
      await AsyncStorage.setItem('token', data.token);
      router.push('/customer/home');
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View className="flex-1 bg-white px-4 justify-center">
      {/* Back button */}
      <Pressable onPress={() => router.push('/')} className="absolute top-10 left-4 w-10 z-10">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>
      {/* Logo and Heading */}
      <View className="items-center mb-6 mt-10">
        <Image source={require('../../assets/images/Elnaizak-logo.jpeg')} className="w-20 h-20 mb-2 rounded-full" />
        <Text className="text-3xl font-extrabold text-primary mb-1">Welcome Back</Text>
        <Text className="text-gray-500 text-base">Login to your customer account</Text>
      </View>
      {/* Login Card */}
      <View className="bg-white rounded-3xl shadow-xl px-6 py-8 w-full max-w-md mx-auto">
        {error ? (
          <View className="bg-red-100 border border-red-300 rounded-lg px-3 py-2 mb-4">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        ) : null}
        <TextInput
          placeholder="Phone Number"
          className="border border-gray-300 w-full  mb-4 px-4 py-3 pb-4 rounded-xl bg-gray-50 text-base"
          value={phoneOrEmail}
          onChangeText={setPhoneOrEmail}
          keyboardType="phone-pad"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />
        <View className="relative mb-4">
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            className="border border-gray-300 w-full px-4 py-3 rounded-xl bg-gray-50 text-base pr-12"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
          <Pressable
            className="absolute right-3 top-3"
            onPress={() => setShowPassword((v) => !v)}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#888" />
          </Pressable>
        </View>
        <Pressable
          className={`py-3 rounded-xl items-center ${loading ? 'bg-gray-400' : 'bg-primary'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-bold">Login</Text>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/customer/register')} className="mt-6 items-center">
          <Text className="text-gray-600">Don't have an account? <Text className="text-primary font-semibold">Register</Text></Text>
        </Pressable>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
}
