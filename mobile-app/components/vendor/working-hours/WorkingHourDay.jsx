import React from 'react';
import { View, Text, Pressable } from 'react-native';
import WorkingHourInterval from './WorkingHourInterval';

export default function WorkingHourDay({ day, day_of_week, intervals, onAdd, onEdit, onDelete }) {
  return (
    <View className="mb-6 bg-white rounded-2xl  p-4 border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-primary">{day}</Text>
        <Pressable onPress={() => onAdd(day_of_week)} className="bg-primary px-3 py-1 rounded-xl">
          <Text className="text-white font-bold">+</Text>
        </Pressable>
      </View>
      {intervals.length === 0 ? (
        <Text className="text-gray-400">Closed</Text>
      ) : (
        intervals.map(interval => (
          <WorkingHourInterval
            key={interval.id}
            interval={interval}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
} 