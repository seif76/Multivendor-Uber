import { View, Text, Pressable } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function QuickActions() {
  const router = useRouter();
  return (
    <View className="flex-row justify-between mb-4">
      <Pressable className="flex-1 bg-primary rounded-xl p-3 mx-1 items-center" onPress={() => router.push('/vendor/(tabs)/add-product')}>
        <FontAwesome5 name="plus" size={18} color="white" />
        <Text className="text-white mt-1 text-xs font-semibold">Add Product</Text>
      </Pressable>
      <Pressable className="flex-1 bg-green-600 rounded-xl p-3 mx-1 items-center" onPress={() => router.push('/vendor/orders')}>
        <Ionicons name="receipt-outline" size={20} color="white" />
        <Text className="text-white mt-1 text-xs font-semibold">View Orders</Text>
      </Pressable>
      <Pressable className="flex-1 bg-yellow-500 rounded-xl p-3 mx-1 items-center" onPress={() => router.push('/vendor/wallet')}>
        <MaterialIcons name="account-balance-wallet" size={20} color="white" />
        <Text className="text-white mt-1 text-xs font-semibold">Request Payout</Text>
      </Pressable>
      <Pressable className="flex-1 bg-blue-500 rounded-xl p-3 mx-1 items-center" onPress={() => router.push('/vendor/manageShop')}>
        <FontAwesome5 name="edit" size={18} color="white" />
        <Text className="text-white mt-1 text-xs font-semibold">Edit Store</Text>
      </Pressable>
    </View>
  );
} 