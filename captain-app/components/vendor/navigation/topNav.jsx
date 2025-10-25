import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

export default function VendorTopNavbar({ onProfilePress }) {
  return (
    <View className="w-full h-16 bg-primary flex-row items-center justify-between px-4">
      {/* Profile icon on the LEFT */}
      <Pressable onPress={onProfilePress}>
        <Ionicons name="menu" size={28} color="white" />
      </Pressable>

      <Text className="text-white font-semibold text-lg">Vendor Panel</Text>

      {/* Dummy spacer to balance */}
      <View style={{ width: 28 }} />
    </View>
  );
}
