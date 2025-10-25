import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';

export default function DeliverymanHome() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tabs home
    router.replace('/deliveryMan/(tabs)/home');
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-blue-600 font-semibold">Loading...</Text>
    </View>
  );
}
