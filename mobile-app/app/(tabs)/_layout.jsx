import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB', // Tailwind's blue-600
        tabBarInactiveTintColor: '#9CA3AF', // Tailwind's gray-400
        tabBarStyle: {
          backgroundColor: '#ffffff',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'Test',
        }}
      />
    </Tabs>
  );
}
