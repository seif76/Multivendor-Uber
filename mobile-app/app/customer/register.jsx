

import axios from 'axios';
import Constants from 'expo-constants';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
    profile_photo: '',
  });
  const router = useRouter();
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;


  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/customers/register`, form);
      alert('Success', 'Registration successful!');
      router.push('/customer/login');
    } catch (err) {
      alert(err);
     // Alert.alert('Error', err?.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView className="bg-white flex-1 px-6 pt-12 pb-20">
      <View className="items-center mb-6 mt-4">
        <Image source={require('../../assets/images/Elnaizak-logo.jpeg')} className="w-20 h-20 mb-2 rounded-full" />
        <Text className="text-3xl font-extrabold text-primary mb-1">Create Your Account</Text>
        <Text className="text-gray-500 text-base">Register as a customer</Text>
      </View>
      <View className="bg-white rounded-3xl shadow-xl px-6 py-8 w-full max-w-md mx-auto">
        {form.profile_photo !== '' && (
          <Image
            source={{ uri: form.profile_photo }}
            className="w-24 h-24 rounded-full self-center mb-5 border border-green-500"
          />
        )}
        {[
          { label: 'Full Name', key: 'name', keyboard: 'default' },
          { label: 'Email', key: 'email', keyboard: 'email-address' },
          { label: 'Password', key: 'password', secure: true },
          { label: 'Phone Number', key: 'phone_number', keyboard: 'phone-pad' },
          { label: 'Profile Photo URL', key: 'profile_photo' },
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
        <TouchableOpacity
          onPress={handleRegister}
          className="bg-green-600 py-4 rounded-xl"
        >
          <Text className="text-center text-white font-bold text-lg">Register</Text>
        </TouchableOpacity>
        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-600">Already have an account? </Text>
          <Link href="/customer/login" asChild>
            <Text className="text-primary font-semibold">Login</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
