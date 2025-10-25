import { View, Text } from 'react-native';

export default function TopProductsList({ topProducts }) {
  return (
    <View className="bg-white rounded-xl shadow p-4 mb-4">
      <Text className="text-lg font-bold text-primary mb-2">Top Products</Text>
      {topProducts.map((prod) => (
        <View key={prod.id} className="flex-row justify-between mb-2">
          <Text className="font-semibold text-gray-800">{prod.name}</Text>
          <Text className="text-primary">{prod.sales} sales</Text>
        </View>
      ))}
    </View>
  );
} 