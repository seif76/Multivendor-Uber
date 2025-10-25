import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View } from 'react-native';

export default function ProductSearchBar({ value, onChange }) {
  return (
    <View className="flex-row items-center bg-gray-100 p-2 px-4 rounded-xl mb-4">
      <AntDesign name="search1" size={18} color="gray" />
      <TextInput
        placeholder="Search products..."
        value={value}
        onChangeText={onChange}
        className="ml-2 flex-1 text-sm text-black"
      />
    </View>
  );
}
