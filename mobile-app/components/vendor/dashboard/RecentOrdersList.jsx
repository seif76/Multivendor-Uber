import { View, Text } from 'react-native';

export default function RecentOrdersList({ recentOrders }) {
  return (
    <View className="bg-white rounded-xl shadow p-4 mb-4">
      <Text className="text-lg font-bold text-primary mb-2">Recent Orders</Text>
      {recentOrders.map((order) => (
        <View key={order.id} className="flex-row justify-between mb-2">
          <Text className="font-semibold text-gray-800">{order.id}</Text>
          <Text className="text-gray-600">{order.customer?.name || order.customer_id}</Text>
          <Text className="text-gray-600">{order.status}</Text>
          <Text className="text-primary">${order.total}</Text>
        </View>
      ))}
    </View>
  );
} 