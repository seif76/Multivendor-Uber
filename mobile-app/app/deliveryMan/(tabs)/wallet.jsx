import { FontAwesome } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function DeliverymanWallet() {
  return (
    <ScrollView className="flex-1 bg-white p-4 pt-8">
      <Text className="text-2xl font-bold text-blue-600 mb-6">Wallet</Text>
      
      {/* Balance Card */}
      <View className="bg-blue-100 p-6 rounded-xl mb-6 shadow-sm">
        <Text className="text-lg font-medium text-blue-800 mb-2">Current Balance</Text>
        <Text className="text-4xl font-bold text-blue-600">$850.50</Text>
        <Text className="text-sm text-blue-600 mt-2">Available for withdrawal</Text>
      </View>

      {/* Quick Actions */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</Text>
        <View className="flex-row justify-between space-x-4">
          <Pressable className="flex-1 bg-green-600 p-4 rounded-xl items-center">
            <FontAwesome name="plus" size={20} color="white" />
            <Text className="text-white font-semibold mt-2">Add Money</Text>
          </Pressable>
          <Pressable className="flex-1 bg-yellow-500 p-4 rounded-xl items-center">
            <FontAwesome name="arrow-up" size={20} color="white" />
            <Text className="text-white font-semibold mt-2">Withdraw</Text>
          </Pressable>
        </View>
      </View>

      {/* Transaction History */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</Text>
        
        {/* Transaction Items */}
        <View className="space-y-3">
          <View className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <FontAwesome name="truck" size={16} color="#22c55e" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-800">Delivery Payment</Text>
                  <Text className="text-sm text-gray-500">Order #12345</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-bold text-green-600">+$25.00</Text>
                <Text className="text-xs text-gray-500">Today</Text>
              </View>
            </View>
          </View>

          <View className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <FontAwesome name="arrow-up" size={16} color="#3b82f6" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-800">Withdrawal</Text>
                  <Text className="text-sm text-gray-500">Bank Transfer</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-bold text-red-500">-$100.00</Text>
                <Text className="text-xs text-gray-500">Yesterday</Text>
              </View>
            </View>
          </View>

          <View className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <FontAwesome name="truck" size={16} color="#22c55e" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-800">Delivery Payment</Text>
                  <Text className="text-sm text-gray-500">Order #12344</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-bold text-green-600">+$18.50</Text>
                <Text className="text-xs text-gray-500">2 days ago</Text>
              </View>
            </View>
          </View>

          <View className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <FontAwesome name="gift" size={16} color="#8b5cf6" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-800">Bonus</Text>
                  <Text className="text-sm text-gray-500">Weekly bonus</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-bold text-green-600">+$50.00</Text>
                <Text className="text-xs text-gray-500">3 days ago</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* View All Transactions */}
      <Pressable className="bg-gray-100 p-4 rounded-xl items-center">
        <Text className="text-blue-600 font-semibold">View All Transactions</Text>
      </Pressable>
    </ScrollView>
  );
}
