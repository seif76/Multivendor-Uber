import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

export default function DeliverymanTopNavbar({ onProfilePress, isOnline, setIsOnline }) {
  return (
    <View className="w-full h-16 bg-blue-600 flex-row items-center justify-between px-4">
      {/* Profile icon on the LEFT */}
      <Pressable onPress={onProfilePress}>
        <Ionicons name="menu" size={28} color="white" />
      </Pressable>

      <Text className="text-white font-semibold text-lg">Deliveryman Panel</Text>


      <Pressable
        onPress={() => setIsOnline(!isOnline)}
        className={`w-20 h-10 rounded-full absolute right-4 flex-row items-center px-1 ${
          isOnline ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <View
          className={`w-8 h-8 rounded-full justify-center items-center ${
            isOnline ? 'ml-auto bg-gray-800' : 'mr-auto bg-primary'
          }`}
        >
          <MaterialCommunityIcons name="steering" size={22} color="#fff" />
        </View>
      </Pressable>

      {/* Dummy spacer to balance */}
      <View style={{ width: 28 }} />
    </View>
  );
}
