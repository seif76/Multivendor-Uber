// import { Pressable, Text, TextInput, View } from 'react-native';

// export default function VendorLogin() {
//   return (
//     <View className="flex-1 justify-center items-center px-4 bg-white">
//       <Text className="text-xl font-bold mb-4">Vendor Login</Text>
//       <TextInput
//         placeholder="Phone or Email"
//         className="border w-full mb-3 px-4 py-2 rounded"
//       />
//       <TextInput
//         placeholder="Password"
//         secureTextEntry
//         className="border w-full mb-3 px-4 py-2 rounded"
//       />
//       <Pressable className="bg-blue-600 py-3 px-8 rounded">
//         <Text className="text-white">Login</Text>
//       </Pressable>
//     </View>
//   );
// }

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';


export default function VendorLogin() {
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
      const response = await fetch(`${BACKEND_URL}/api/vendor/auth/login`, {
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
      router.push('/vendor/home');
    } catch (error) {
      Alert.alert('Error', error.message);
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
        <Text className="text-xl font-bold mb-4">Vendor Login</Text>
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

