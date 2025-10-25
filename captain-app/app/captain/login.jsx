import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View, Image } from 'react-native';


export default function CaptainLogin() {
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneOrEmail || !password) {
      Alert.alert('Validation', 'Please enter phone and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/captain/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneOrEmail, // backend expects phone_number field
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.error || 'Unknown error');
        setLoading(false);
        return;
      }
      // alert ("token is :" + data.token ) 

      // Save token in AsyncStorage
      await AsyncStorage.setItem('token', data.token);

      // Navigate to captain home or dashboard (replace with your route)
      router.push('/captain/home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-4 justify-center">
      {/* Back button */}
      <Pressable onPress={() => router.push('/')} className="absolute top-10 left-4 w-10 z-10">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>
      {/* Logo and Heading */}
      <View className="items-center mb-6 mt-10">
        <Image source={require('../../assets/images/Elnaizak-logo.jpeg')} className="w-20 h-20 mb-2 rounded-full" />
        <Text className="text-3xl font-extrabold text-primary mb-1">Welcome Back</Text>
        <Text className="text-gray-500 text-base">Login to your captain account</Text>
      </View>
      {/* Login Card */}
      <View className="bg-white rounded-3xl shadow-xl px-6 py-8 w-full max-w-md mx-auto">
        <TextInput
          placeholder="Phone Number"
          className="border border-gray-300 w-full mb-4 px-4 py-3 rounded-xl bg-gray-50 text-base"
          value={phoneOrEmail}
          onChangeText={setPhoneOrEmail}
          keyboardType="phone-pad"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />
        <View className="relative mb-4">
          <TextInput
            placeholder="Password"
            secureTextEntry
            className="border border-gray-300 w-full px-4 py-3 rounded-xl bg-gray-50 text-base pr-12"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
        </View>
        <Pressable
          className={`py-3 rounded-xl items-center ${loading ? 'bg-gray-400' : 'bg-primary'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-lg font-bold">{loading ? 'Logging in...' : 'Login'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
