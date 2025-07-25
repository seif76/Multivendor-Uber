import { View, Text } from 'react-native';

export default function NotificationsList({ notifications }) {
  return (
    <View className="bg-white rounded-xl shadow p-4 mb-4">
      <Text className="text-lg font-bold text-primary mb-2">Notifications</Text>
      {notifications.map((notif) => (
        <View key={notif.id} className="flex-row justify-between mb-2">
          <Text className="text-gray-700">{notif.message}</Text>
          <Text className="text-xs text-gray-400">{notif.date}</Text>
        </View>
      ))}
    </View>
  );
} 