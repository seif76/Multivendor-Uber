import { FontAwesome } from '@expo/vector-icons';
import { Slot, Tabs, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import TopNavbar from '../../../components/captain/navigation/TopNavbar';

export default function CaptainLayout() {
    const segments = useSegments();
    const [showTabs, setShowTabs] = useState(true);
  
    useEffect(() => {
      const current = segments[segments.length - 1];
      setShowTabs(current !== 'login'); // hide tabs if on /captain/login
    }, [segments]);
  
    if (!showTabs) {
      return <Slot />; // render screen without tab bar
    }
  return (
    <>
    <TopNavbar />
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0f9d58',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="map" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <FontAwesome name="dollar" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <FontAwesome name="envelope" size={22} color={color} />,
        }}
      />
    </Tabs>
    </>
  );
}
