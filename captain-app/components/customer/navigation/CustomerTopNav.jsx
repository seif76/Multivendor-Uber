import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

export default function CustomerTopNav() {

  

  return (
    <View className="flex-row justify-between items-center px-4 py-4 bg-white shadow">
      <Pressable>
        <FontAwesome name="user-circle" size={30} color="#0f9d58" />
      </Pressable>

      <View className="flex-row items-center space-x-2">
        <FontAwesome name="location-arrow" size={18} color="#0f9d58" />
        <View>
          <Pressable>
            <FontAwesome name="angle-down" size={16} color="#666" />
          </Pressable>
        </View>
      </View>

      <Pressable>
        <MaterialIcons name="notifications-none" size={24} color="#333" />
      </Pressable>
    </View>
  );
}
