import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View, Image, ActivityIndicator, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import axios from 'axios';

export default function CustomerLogin() {
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

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
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Background Pattern */}
        <View className="absolute inset-0 opacity-5 dark:opacity-10">
          <View className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full" />
          <View className="absolute top-40 right-8 w-24 h-24 bg-primary rounded-full" />
          <View className="absolute bottom-40 left-8 w-40 h-40 bg-primary rounded-full" />
        </View>

        {/* Back button */}
        <Pressable onPress={() => router.push('/')} className="absolute top-12 left-6 w-10 h-10 bg-white dark:bg-gray-800 rounded-full items-center justify-center z-10 shadow-lg">
          <Ionicons name="arrow-back" size={20} color="#007233" />
        </Pressable>

        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="px-6 py-8">
            {/* Logo and Heading */}
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full items-center justify-center shadow-xl mb-4">
                <Image source={require('../../assets/images/Elnaizak-logo.jpeg')} className="w-20 h-20 rounded-full" />
              </View>
              <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome Back!</Text>
              <Text className="text-gray-600 dark:text-gray-300 text-center text-base leading-6">
                Sign in to continue your journey with us
              </Text>
            </View>

            {/* Login Card */}
            <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl px-6 py-8 mb-6">
              {error ? (
                <View className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 rounded-lg px-4 py-3 mb-6">
                  <View className="flex-row items-center">
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <Text className="text-red-700 dark:text-red-300 text-sm ml-2 flex-1">{error}</Text>
                  </View>
                </View>
              ) : null}

              {/* Phone Number Input */}
              <View className="mb-6">
                <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Phone Number</Text>
                <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-4 border border-gray-200 dark:border-gray-600">
                  <Ionicons name="call-outline" size={20} color="#6b7280" />
                  <TextInput
                    placeholder="Enter your phone number"
                    className="flex-1 ml-3 text-base text-gray-800 dark:text-white"
                    value={phoneOrEmail}
                    onChangeText={setPhoneOrEmail}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Password</Text>
                <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-4 border border-gray-200 dark:border-gray-600">
                  <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
                  <TextInput
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    className="flex-1 ml-3 text-base text-gray-800 dark:text-white"
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    placeholderTextColor="#9ca3af"
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    className="p-1"
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#6b7280" 
                    />
                  </Pressable>
                </View>
              </View>

              {/* Forgot Password */}
              <Pressable className="items-end mb-6">
                <Text className="text-primary font-semibold text-sm">Forgot Password?</Text>
              </Pressable>

              {/* Login Button */}
              <Pressable
                className={`py-4 rounded-2xl items-center shadow-lg ${
                  loading ? 'bg-gray-400' : 'bg-primary'
                }`}
                onPress={handleLogin}
                disabled={loading}
                style={{
                  shadowColor: '#007233',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View className="flex-row items-center">
                    <Text className="text-white text-lg font-bold mr-2">Sign In</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                )}
              </Pressable>
            </View>

            {/* Register Link */}
            <View className="items-center">
              <Text className="text-gray-600 dark:text-gray-300 text-base">
                Don't have an account?{' '}
                <Pressable onPress={() => router.push('/customer/register')}>
                  <Text className="text-primary font-bold">Create Account</Text>
                </Pressable>
              </Text>
            </View>

            {/* Social Login Options */}
            <View className="mt-8">
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                <Text className="mx-4 text-gray-500 dark:text-gray-400 text-sm">Or continue with</Text>
                <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
              </View>
              
              <View className="flex-row justify-center space-x-4">
                <Pressable className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl items-center justify-center shadow-lg border border-gray-200 dark:border-gray-600">
                  <Ionicons name="logo-google" size={24} color="#db4437" />
                </Pressable>
                <Pressable className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl items-center justify-center shadow-lg border border-gray-200 dark:border-gray-600">
                  <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                </Pressable>
                <Pressable className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl items-center justify-center shadow-lg border border-gray-200 dark:border-gray-600">
                  <Ionicons name="logo-apple" size={24} color="#000" />
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}
