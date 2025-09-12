import { Link } from 'expo-router';
import { Image, Pressable, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import "../global.css";

const roles = [
  { 
    name: 'Customer', 
    path: '/customer/login',
    icon: 'person-outline',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    description: 'Order food & services',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Vendor', 
    path: '/vendor/login',
    icon: 'storefront-outline',
    color: '#10b981',
    bgColor: 'bg-green-50',
    description: 'Manage your store',
    gradient: 'from-green-500 to-green-600'
  },
  { 
    name: 'Delivery Man', 
    path: '/deliveryMan/login',
    icon: 'bicycle-outline',
    color: '#f59e0b',
    bgColor: 'bg-yellow-50',
    description: 'Deliver orders',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  { 
    name: 'Captain', 
    path: '/captain/login',
    icon: 'car-outline',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50',
    description: 'Provide rides',
    gradient: 'from-purple-500 to-purple-600'
  },
];

export default function RoleSelector() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-white pt-16 pb-8 px-6">
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-xl mb-4">
            <Image
              source={require('../assets/images/Elnaizak-logo.jpeg')}
              className="w-20 h-20 rounded-full"
            />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">Welcome to Elnaizak</Text>
          <Text className="text-gray-600 text-center text-base leading-6">
            Choose your account type to get started
          </Text>
        </View>
      </View>

      <View className="px-6 -mt-4">
        {/* Role Selection Cards */}
        <View className="space-y-4 mb-8">
          {roles.map((role, index) => (
            <Link key={role.name} href={role.path} asChild>
              <Pressable className="bg-white rounded-2xl p-6 shadow-lg">
                <View className="flex-row items-center">
                  {/* Icon Container */}
                  <View className={`w-16 h-16 ${role.bgColor} rounded-2xl items-center justify-center mr-4`}>
                    <Ionicons name={role.icon} size={28} color={role.color} />
                  </View>
                  
                  {/* Content */}
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800 mb-1">{role.name}</Text>
                    <Text className="text-gray-600 text-sm">{role.description}</Text>
                  </View>
                  
                  {/* Arrow */}
                  <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                    <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>

        {/* Features Section */}
        <View className="bg-white rounded-2xl p-6 mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4">Why Choose Elnaizak?</Text>
          
          <View className="space-y-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="checkmark" size={16} color="#10b981" />
              </View>
              <Text className="text-gray-700 flex-1">Fast and reliable service</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={16} color="#3b82f6" />
              </View>
              <Text className="text-gray-700 flex-1">Secure and safe transactions</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="star" size={16} color="#8b5cf6" />
              </View>
              <Text className="text-gray-700 flex-1">24/7 customer support</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center pb-8">
          <Text className="text-gray-500 text-sm text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
