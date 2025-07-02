import { FontAwesome } from '@expo/vector-icons';
import { Slot, Tabs, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import OnlineStatusBar from '../../../components/captain/custom/OnlineStatusBar';
import TopNavbar from '../../../components/captain/navigation/TopNavbar';
import SideNav from '../../../components/captain/navigation/sideNav';

export default function CaptainLayout() {
    const segments = useSegments();
    const [showTabs, setShowTabs] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
  
    useEffect(() => {
      const current = segments[segments.length - 1];
      setShowTabs(current !== 'login'); // hide tabs if on /captain/login
    }, [segments]);
  
    if (!showTabs) {
      return <Slot />; // render screen without tab bar
    }
  return (
    <View className="flex-1 relative">
    <TopNavbar  
      onProfilePress={() => setMenuOpen(true)} 
      isOnline={isOnline}
      setIsOnline={setIsOnline}
    />
    <SideNav visible={menuOpen} onClose={() => setMenuOpen(false)} />
    <OnlineStatusBar isOnline={isOnline} />
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
    </View>
  );
}
