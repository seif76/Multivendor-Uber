import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function CaptainLogin() {
  const router = useRouter();

  return (
    <View className="flex-1 px-4 bg-white">
      {/* Top Navigation Arrow */}
      <Pressable onPress={() => router.push('/')} className="mt-12 mb-4 w-10">
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>

      {/* Login Form */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl font-bold mb-4">Captain Login</Text>
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
    </View>
  );
}
