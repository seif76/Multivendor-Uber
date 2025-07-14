import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function OrdersScreen() {
  const orders = [
    { id: '1', customer: 'John Doe', total: '250 EGP', status: 'Pending' },
    { id: '2', customer: 'Sarah Ali', total: '400 EGP', status: 'Completed' },
    { id: '3', customer: 'Mohamed Nabil', total: '180 EGP', status: 'Cancelled' },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600';
      case 'Completed':
        return 'text-green-600';
      case 'Cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold text-gray-800 mb-4">Orders</Text>

      {orders.map((order) => (
        <View key={order.id} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 mb-4 p-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-semibold">Order #{order.id}</Text>
              <Text className="text-sm text-gray-600">Customer: {order.customer}</Text>
              <Text className={`text-sm mt-1 font-medium ${statusColor(order.status)}`}>Status: {order.status}</Text>
            </View>
            <Text className="text-lg font-bold text-primary">{order.total}</Text>
          </View>

          <Pressable className="mt-4 bg-primary py-2 px-4 rounded-full items-center">
            <Text className="text-white font-semibold text-sm">View Details</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
