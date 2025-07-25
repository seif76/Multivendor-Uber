import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View, Image } from 'react-native';

export default function DeliveryManLogin() {
  const router = useRouter();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <View className="flex-1 bg-white px-4 justify-center">
      {/* Back button */}
      <Pressable onPress={() => router.push('/')} className="mt-10 ml-4 mb-4 w-10">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>
      {/* Logo and Heading */}
      <View className="items-center mb-6 mt-10">
        <Image source={require('../../assets/images/Elnaizak-logo.jpeg')} className="w-20 h-20 mb-2 rounded-full" />
        <Text className="text-3xl font-extrabold text-primary mb-1">Welcome Back</Text>
        <Text className="text-gray-500 text-base">Login to your deliveryman account</Text>
      </View>
      {/* Login Card */}
      <View className="bg-white rounded-3xl shadow-xl px-6 py-8 w-full max-w-md mx-auto">
        <TextInput
          placeholder="Phone or Email"
          className="border border-gray-300 w-full mb-4 px-4 py-3 rounded-xl bg-gray-50 text-base"
          value={phoneOrEmail}
          onChangeText={setPhoneOrEmail}
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
