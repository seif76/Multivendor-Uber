import { View, Text } from 'react-native';

export default function ReviewsList({ reviews }) {
  return (
    <View className="bg-white rounded-xl shadow p-4 mb-4">
      <Text className="text-lg font-bold text-primary mb-2">Latest Reviews</Text>
      {reviews.map((rev) => (
        <View key={rev.id} className="mb-2">
          <Text className="font-semibold text-gray-800">{rev.product}</Text>
          <Text className="text-yellow-500">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</Text>
          <Text className="text-gray-600 italic">"{rev.comment}"</Text>
        </View>
      ))}
    </View>
  );
} 