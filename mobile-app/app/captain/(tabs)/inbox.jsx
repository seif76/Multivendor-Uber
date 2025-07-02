import { ScrollView, Text, View } from 'react-native';

export default function InboxScreen() {
  const dummyNotifications = [
    { id: 1, message: 'Your ride has been completed successfully.', time: 'Just now' },
    { id: 2, message: 'You received a new order.', time: '10 mins ago' },
    { id: 3, message: 'Weekly report is now available.', time: '1 hour ago' },
  ];

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-green-600 mb-4">Notifications</Text>
      {dummyNotifications.map((note) => (
        <View key={note.id} className="bg-gray-100 p-3 rounded mb-2">
          <Text className="text-base font-medium">{note.message}</Text>
          <Text className="text-sm text-gray-500">{note.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
