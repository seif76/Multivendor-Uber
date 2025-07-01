import { Link } from 'expo-router';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

export default function CustomerRegister() {
  return (
    <View className="flex-1 bg-white px-6 justify-center">
      {/* Logo */}
      <View className="items-center mb-6">
        <Image
          source={require('../../assets/images/Elnaizak-logo.jpeg')} // Update the path if needed
          className="w-24 h-24"
          resizeMode="contain"
        />
      </View>

      {/* Heading */}
      <Text className="text-2xl font-bold text-center mb-4 text-primary">Create Customer Account</Text>

      {/* Full Name */}
      <TextInput
        placeholder="Full Name"
        className="border border-gray-300 rounded px-4 py-3 mb-3"
        placeholderTextColor="#888"
      />

      {/* Phone */}
      <TextInput
        placeholder="Phone Number"
        keyboardType="phone-pad"
        className="border border-gray-300 rounded px-4 py-3 mb-3"
        placeholderTextColor="#888"
      />

      {/* Email */}
      <TextInput
        placeholder="Email Address"
        keyboardType="email-address"
        className="border border-gray-300 rounded px-4 py-3 mb-3"
        placeholderTextColor="#888"
      />

      {/* Password */}
      <TextInput
        placeholder="Password"
        secureTextEntry
        className="border border-gray-300 rounded px-4 py-3 mb-4"
        placeholderTextColor="#888"
      />

      {/* Register Button */}
      <Pressable className="bg-primary py-3 rounded items-center mb-4">
        <Text className="text-white font-bold text-lg">Register</Text>
      </Pressable>

      {/* Already have an account */}
      <View className="flex-row justify-center mt-2">
        <Text className="text-gray-600">Already have an account? </Text>
        <Link href="/customer/login" asChild>
          <Text className="text-blue-600 font-semibold">Login</Text>
        </Link>
      </View>
    </View>
  );
}
