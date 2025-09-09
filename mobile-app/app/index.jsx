import { Link } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

import "../global.css";

const roles = [
  { name: 'Captain', path: '/captain/home' },
  { name: 'Vendor', path: '/vendor/home' },
  { name: 'Delivery Man', path: '/deliveryMan/(tabs)/home' },
  { name: 'Customer', path: '/customer/home' },
];

export default function RoleSelector() {
  //alert( Constants.expoConfig.extra.GOOGLE_MAPS_API_KEY)
  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      
      {/* Top Centered Image */}
      <Image
        source={require('../assets/images/Elnaizak-logo.jpeg')} // Adjust path as needed
        className="w-32 h-32 mb-6"
        resizeMode="contain"
      />

      <Text className="text-2xl font-bold mb-6">Select Your Role</Text>

      {roles.map((role) => (
        <Link key={role.name} href={role.path} asChild>
          <Pressable className="bg-primary mb-3 w-full py-3 rounded-lg items-center">
            <Text className="text-white text-lg">{role.name}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
