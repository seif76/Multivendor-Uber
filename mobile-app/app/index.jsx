import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import "../global.css";

export default function RoleSelector() {
  const roles = [
    { name: 'Captain', path: '/captain/login' },
    { name: 'Customer', path: '/customer/login' },
    { name: 'Vendor', path: '/vendor/login' },
    { name: 'Deliveryman', path: '/deliveryMan/login' },
  ];

  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      <Text className="text-2xl font-bold mb-6">Select Your Role</Text>
      {roles.map((role) => (
        <Link key={role.name} href={role.path} asChild>
          <Pressable className="bg-blue-600 mb-3 w-full py-3 rounded-lg items-center">
            <Text className="text-white text-lg">{role.name}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
