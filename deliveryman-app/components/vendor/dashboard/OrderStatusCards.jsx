import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const statusMeta = {
  Pending: { color: 'bg-yellow-100', icon: 'clock-o' },
  Processing: { color: 'bg-blue-100', icon: 'cogs' },
  Delivered: { color: 'bg-green-100', icon: 'check-circle' },
  Cancelled: { color: 'bg-red-100', icon: 'times-circle' },
};

export default function OrderStatusCards({ orderStatus }) {
  return (
    <View className="flex-row justify-between mb-4">
      {Object.entries(orderStatus).map(([status, count]) => (
        <View key={status} className={`flex-1 mx-1 rounded-xl p-3 px-1 items-center ${statusMeta[status]?.color || 'bg-gray-100'}`}> 
          <FontAwesome name={statusMeta[status]?.icon || 'question'} size={20} color="#0f9d58" />
          <Text className="font-bold text-lg text-primary mt-1">{count}</Text>
          <Text className="text-xs text-gray-700">{status}</Text>
        </View>
      ))}
    </View>
  );
} 