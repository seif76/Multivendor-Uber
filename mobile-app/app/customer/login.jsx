import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

export default function CustomerLogin() {
    const router = useRouter();
  return (
    <>
    <Pressable onPress={() => router.push('/')} className="mt-10 ml-4 mb-4 w-10">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>
    <View className="flex-1 bg-white px-6 justify-center">

     
      {/* Logo */}
      <View className="items-center mb-8">
        <Image
          source={require('../../assets/images/Elnaizak-logo.jpeg')} 
          className="w-28 h-28"
          resizeMode="contain"
        />
      </View>

      {/* Heading */}
      <Text className="text-2xl font-bold text-center mb-6 text-primary">Welcome Back</Text>

      {/* Inputs */}
      <TextInput
        placeholder="Phone or Email"
        className="border border-gray-300 rounded px-4 py-3 mb-4"
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        className="border border-gray-300 rounded px-4 py-3 mb-2"
        placeholderTextColor="#888"
      />

      {/* Forgot Password */}
      <View className="mb-6 items-end">
        <Link href="/forgot-password" asChild>
          <Text className="text-blue-600">Forgot Password?</Text>
        </Link>
      </View>

      {/* Login Button */}
      <Pressable className="bg-primary py-3 rounded items-center mb-4">
        <Text className="text-white font-bold text-lg">Login</Text>
      </Pressable>

      {/* Register Link */}
      <View className="flex-row justify-center mt-2">
        <Text className="text-gray-600">Do not have an account? </Text>
        <Link href="/customer/register" asChild>
          <Text className="text-blue-600 font-semibold">Register</Text>
        </Link>
      </View>
    </View>
    </>
  );
}
