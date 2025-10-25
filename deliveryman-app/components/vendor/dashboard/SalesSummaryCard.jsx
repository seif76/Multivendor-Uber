import { View, Text } from 'react-native';

export default function SalesSummaryCard({ salesSummary }) {
  return (
    <View className="flex-row justify-between mb-4">
      <View className="bg-white rounded-xl shadow p-4 flex-1 mr-2">
        <Text className="text-gray-500 text-xs mb-1">Today</Text>
        <Text className="text-xl font-bold text-primary">${salesSummary.today}</Text>
      </View>
      <View className="bg-white rounded-xl shadow p-4 flex-1 mx-1">
        <Text className="text-gray-500 text-xs mb-1">This Week</Text>
        <Text className="text-xl font-bold text-primary">${salesSummary.week}</Text>
      </View>
      <View className="bg-white rounded-xl shadow p-4 flex-1 ml-2">
        <Text className="text-gray-500 text-xs mb-1">This Month</Text>
        <Text className="text-xl font-bold text-primary">${salesSummary.month}</Text>
      </View>
    </View>
  );
} 