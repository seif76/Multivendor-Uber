import { FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { DeliverymanAuthContext } from '../../../context/DeliverymanAuthContex';

export default function DeliverymanHome() {

  const context = useContext(DeliverymanAuthContext);

  if (!context) {
    console.warn("DeliverymanAuthContext is undefined — you forget to wrap with the provider");
    return null;
  }

  const { isDeliverymanVerified, loading } = context;

  if (loading) return <Text>Loading...</Text>;
  if (!isDeliverymanVerified) return <Text>Redirecting...</Text>;
  
  return (
    <ScrollView className="flex-1 bg-white p-5 pt-14">
      <Text className="text-2xl font-bold text-blue-600 mb-6">Welcome Deliveryman</Text>

      {/* Available Orders */}
      <Pressable className="bg-blue-600 p-5 rounded-xl mb-4 flex-row items-center justify-between">
        <Text className="text-white text-lg font-semibold">Available Orders</Text>
        <Ionicons name="list-outline" size={26} color="white" />
      </Pressable>

      {/* Active Deliveries */}
      <Pressable className="bg-green-600 p-5 rounded-xl mb-4 flex-row items-center justify-between">
        <Text className="text-white text-lg font-semibold">Active Deliveries</Text>
        <FontAwesome5 name="truck" size={24} color="white" />
      </Pressable>

      {/* Delivery History */}
      <Pressable className="bg-purple-600 p-5 rounded-xl mb-4 flex-row items-center justify-between">
        <Text className="text-white text-lg font-semibold">Delivery History</Text>
        <Ionicons name="time-outline" size={26} color="white" />
      </Pressable>

      {/* Wallet Balance */}
      <View className="bg-blue-100 p-5 rounded-xl mb-4">
        <Text className="text-lg font-semibold text-blue-600 mb-2">Wallet Balance</Text>
        <Text className="text-2xl font-bold text-blue-600">$850</Text>
      </View>

      {/* Request Payout */}
      <Pressable className="bg-yellow-500 p-5 rounded-xl mb-4 flex-row items-center justify-between">
        <Text className="text-white text-lg font-semibold">Request Payout</Text>
        <MaterialIcons name="account-balance-wallet" size={26} color="white" />
      </Pressable>

      {/* Vehicle Status */}
      <View className="bg-gray-100 p-5 rounded-xl mb-4">
        <Text className="text-lg font-semibold text-gray-800 mb-2">Vehicle Status</Text>
        <Text className="text-base text-gray-600">Toyota Corolla - ABC-123</Text>
        <Text className="text-sm text-green-600 font-semibold mt-1">✓ Online & Available</Text>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">Quick Actions</Text>
        <View className="flex-row justify-between">
          <Pressable className="w-[48%] bg-blue-100 rounded-xl py-4 items-center">
            <FontAwesome name="map-marker" size={24} color="#3b82f6" />
            <Text className="text-blue-700 font-semibold mt-2">Update Location</Text>
          </Pressable>
          <Pressable className="w-[48%] bg-green-100 rounded-xl py-4 items-center">
            <FontAwesome name="cog" size={24} color="#22c55e" />
            <Text className="text-green-700 font-semibold mt-2">Settings</Text>
          </Pressable>
        </View>
      </View>

      {/* Support Section */}
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
    </ScrollView>
  );
}
