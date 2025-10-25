import React from 'react';
import { View, Text, Pressable } from 'react-native';

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export default function WorkingHourInterval({ interval, onEdit, onDelete }) {
  return (
    <View className="flex-row items-center mb-2">
      <Text className="flex-1 text-base text-gray-800">
        {formatTime(interval.open_time)} - {formatTime(interval.close_time)}
      </Text>
      <Pressable onPress={() => onEdit(interval)} className="mr-2 bg-yellow-400 px-3 py-1 rounded-xl">
        <Text className="text-white font-bold">Edit</Text>
      </Pressable>
      <Pressable onPress={() => onDelete(interval)} className="bg-red-500 px-3 py-1 rounded-xl">
        <Text className="text-white font-bold">Delete</Text>
      </Pressable>
    </View>
  );
} 