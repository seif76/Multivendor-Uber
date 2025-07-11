import { Pressable, Text, TextInput, View } from 'react-native';

export default function DeliveryManLogin() {
  return (
    <View className="flex-1 justify-center items-center px-4 bg-white">
      <Text className="text-xl font-bold mb-4">DeliveryMan Login</Text>
      <TextInput
        placeholder="Phone or Email"
        className="border w-full mb-3 px-4 py-2 rounded"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        className="border w-full mb-3 px-4 py-2 rounded"
      />
      <Pressable className="bg-blue-600 py-3 px-8 rounded">
        <Text className="text-white">Login</Text>
      </Pressable>
    </View>
  );
}
