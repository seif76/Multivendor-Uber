import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';

export default function EditProfilePage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/customers/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setUser(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setPhoneNumber(data.phone_number || '');
        setGender(data.gender || '');
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    try {
      const updates = { name, email, gender };
      const token = await AsyncStorage.getItem('token');

      await axios.put(
        `${BACKEND_URL}/api/customers/edit`,
        { phone_number, updates },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-10">
      {/* Header Section */}
      <View className="flex-row items-center mb-8">
        <Pressable
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-100 mr-3"
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-800">Edit Profile</Text>
      </View>

      {/* Form Section */}
      <View className="space-y-5">
        {/* Full Name */}
        <View>
          <Text className="text-gray-600 mb-1 font-medium">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            className="border border-gray-300 rounded-2xl px-4 py-3 text-gray-800 bg-gray-50"
          />
        </View>

        {/* Email */}
        <View>
          <Text className="text-gray-600 mb-1 font-medium">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            className="border border-gray-300 rounded-2xl px-4 py-3 text-gray-800 bg-gray-50"
          />
        </View>

        {/* Phone Number */}
        <View>
          <Text className="text-gray-600 mb-1 font-medium">Phone Number</Text>
          <TextInput
            value={phone_number}
            editable={false}
            className="border border-gray-300 rounded-2xl px-4 py-3 text-gray-400 bg-gray-100"
          />
        </View>

        {/* Gender */}
        <View>
          <Text className="text-gray-600 mb-2 font-medium">Gender</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setGender('Male')}
              className={`flex-1 border rounded-2xl px-4 py-3 items-center ${
                gender === 'Male' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <Text
                className={`font-medium ${
                  gender === 'Male' ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                Male
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setGender('Female')}
              className={`flex-1 border rounded-2xl px-4 py-3 items-center ${
                gender === 'Female' ? 'border-pink-500 bg-pink-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <Text
                className={`font-medium ${
                  gender === 'Female' ? 'text-pink-600' : 'text-gray-700'
                }`}
              >
                Female
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        onPress={handleSave}
        className="bg-primary rounded-2xl p-4 mt-10 mb-10 items-center shadow-sm"
      >
        <Text className="text-white font-semibold text-base">Save Changes</Text>
      </Pressable>
    </ScrollView>
  );
}
