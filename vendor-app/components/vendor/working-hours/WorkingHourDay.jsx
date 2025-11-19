import React from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import WorkingHourInterval from './WorkingHourInterval';

export default function WorkingHourDay({ day, day_of_week, intervals, onToggle, onAdd, onEdit, onDelete }) {
  const dayIsActive = intervals.length > 0;
  
  return (
    // Background and border locked to light theme colors
    <View className={`mb-4 bg-white rounded-xl shadow-sm overflow-hidden border ${dayIsActive ? 'border-primary/50' : 'border-gray-100'}`}>
      
      {/* Day Header with Toggle Switch */}
      <View className="flex-row justify-between items-center p-4">
        {/* Text colors locked to light theme colors */}
        <Text className={`text-lg font-bold ${dayIsActive ? 'text-gray-800' : 'text-gray-500'}`}>
          {day}
        </Text>
        
        {/* Toggle Switch uses primary color */}
        <Switch
          trackColor={{ false: '#d1d5db', true: '#20df20' }}
          thumbColor="#ffffff"
          ios_backgroundColor="#d1d5db"
          onValueChange={() => onToggle(day_of_week, dayIsActive)}
          value={dayIsActive}
        />
      </View>
      
      {/* Content Section */}
      <View className="border-t border-gray-100 px-4 py-3">
        {dayIsActive ? (
          <>
            {intervals.map(interval => (
              <WorkingHourInterval
                key={interval.id}
                interval={interval}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {/* "Add Another" Button */}
            <Pressable 
                onPress={() => onAdd(day_of_week)} 
                className="mt-2 border border-primary/50 border-dashed rounded-lg p-2 items-center"
            >
                <Text className="text-primary font-bold">Add Another Interval (+)</Text>
            </Pressable>
          </>
        ) : (
          // Day is Closed: Show "Closed" message
          <Text className="text-center text-gray-500 font-medium py-1">Closed</Text>
        )}
      </View>
    </View>
  );
}