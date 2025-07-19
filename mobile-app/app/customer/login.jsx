import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import axios from 'axios';

export default function CustomerLogin() {
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
      const response = await axios.post(`${BACKEND_URL}/api/customers/auth/login`, {
        phone_number: phoneOrEmail,
        password,
      });
      
      const data = response.data;
      await AsyncStorage.setItem('token', data.token);
      router.push('/customer/home');
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Unknown error';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 px-4 bg-white">
      {/* Back button */}
      <Pressable onPress={() => router.push('/')} className="mt-10 ml-4 mb-4 w-10">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>

      {/* Login form */}
      <View className="flex-1 justify-center items-center w-full">
        <Text className="text-xl font-bold mb-4">Customer Login</Text>
        <TextInput
          placeholder="Phone Number"
          className="border w-full mb-3 px-4 py-2 rounded"
          value={phoneOrEmail}
          onChangeText={setPhoneOrEmail}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          className="border w-full mb-3 px-4 py-2 rounded"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <Pressable
          className={`py-3 px-8 rounded ${loading ? 'bg-gray-400' : 'bg-primary'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-center">{loading ? 'Logging in...' : 'Login'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
