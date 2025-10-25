import { Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export default function CustomerHomeScreen() {
  return (
    <View className="flex-1 bg-white">
      {/* Top Navbar */}
      <View className="flex-row justify-between items-center px-4 py-4 bg-white shadow">
        <Pressable>
          <FontAwesome name="user-circle" size={30} color="#0f9d58" />
        </Pressable>
        <View className="flex-row items-center space-x-2">
          <Entypo name="location-pin" size={20} color="#0f9d58" />
          <Text className="text-gray-700 font-semibold">Cairo, Egypt</Text>
        </View>
        <Pressable>
          <MaterialIcons name="notifications-none" size={24} color="#333" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Ride/Delivery Selection */}
        <View className="px-4 py-3">
          <Text className="text-lg font-bold mb-3 text-gray-800">How can we help you today?</Text>
          <View className="flex-row justify-between">
            <Pressable className="w-[48%] bg-primary rounded-xl py-4 items-center">
              <FontAwesome name="car" size={28} color="#fff" />
              <Text className="text-white font-semibold mt-2">Book a Ride</Text>
            </Pressable>
            <Pressable className="w-[48%] bg-primary rounded-xl py-4 items-center">
              <FontAwesome name="truck" size={28} color="#fff" />
              <Text className="text-white font-semibold mt-2">Send a Package</Text>
            </Pressable>
          </View>
        </View>

        {/* Categories */}
        <View className="px-4 py-2">
          <Text className="text-lg font-bold mb-3 text-gray-800">Shop by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
            {[
              { icon: 'shopping-bag', label: 'Fashion' },
              { icon: 'laptop', label: 'Electronics' },
              { icon: 'cutlery', label: 'Food' },
              { icon: 'home', label: 'Home' },
              { icon: 'heartbeat', label: 'Health' },
            ].map(({ icon, label }, i) => (
              <View key={i} className="items-center bg-gray-100 px-4 py-3 rounded-xl">
                <FontAwesome name={icon} size={24} color="#0f9d58" />
                <Text className="mt-2 text-sm">{label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Featured Vendors */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Featured Stores</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="w-40 bg-white rounded-lg shadow p-3">
                <Image
                  source={{ uri: 'https://via.placeholder.com/100' }}
                  className="w-full h-24 rounded"
                />
                <Text className="mt-2 font-semibold">Vendor {i}</Text>
                <Text className="text-xs text-gray-500">4.5 ★</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Best Deals */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Best Deals</Text>
          {[1, 2].map((i) => (
            <View key={i} className="flex-row items-center mb-4 bg-gray-100 rounded-lg p-3">
              <Image
                source={{ uri: 'https://via.placeholder.com/80' }}
                className="w-20 h-20 rounded-lg"
              />
              <View className="ml-4">
                <Text className="font-semibold text-gray-800">Product {i}</Text>
                <Text className="text-green-600 font-bold mt-1">$19.99</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Wallet Banner */}
        <View className="mx-4 mt-6 bg-green-100 p-4 rounded-xl">
          <Text className="text-green-800 font-bold">Wallet Balance: $120.50</Text>
          <Text className="text-green-700 text-sm mt-1">Tap to view transactions</Text>
        </View>

        {/* Quick Support */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Need Help?</Text>
          <View className="flex-row justify-between">
            <Pressable className="w-[48%] bg-pink-100 rounded-xl py-4 items-center">
              <FontAwesome name="headphones" size={24} color="#d63384" />
              <Text className="text-pink-700 font-semibold mt-2">Live Support</Text>
            </Pressable>
            <Pressable className="w-[48%] bg-yellow-100 rounded-xl py-4 items-center">
              <FontAwesome name="exclamation-triangle" size={24} color="#e67e22" />
              <Text className="text-yellow-700 font-semibold mt-2">Report Issue</Text>
            </Pressable>
          </View>
        </View>

        {/* Spacer */}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
