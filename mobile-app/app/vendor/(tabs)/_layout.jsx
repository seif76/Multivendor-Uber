import { FontAwesome } from '@expo/vector-icons';
import { Slot, Tabs, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import VendorSideNav from '../../../components/vendor/navigation/sideNav';
import VendorTopNavbar from '../../../components/vendor/navigation/topNav';
import { VendorAuthProvider } from '../../../context/VendorAuthContext';

export default function VendorLayout() {
  const segments = useSegments();
  const [showTabs, setShowTabs] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const current = segments[segments.length - 1];
    setShowTabs(current !== 'login' && current !== 'register'); // hide tabs on login/register
  }, [segments]);

  if (!showTabs) {
    return <Slot />; // only show login/register screen
  }
  if (!showTabs) {
    return (
      <VendorAuthProvider>
        <Slot />
      </VendorAuthProvider>
    );
  }

  return (
    <VendorAuthProvider>
      <View className="flex-1 bg-white">
          {/* Vendor Top Navbar */}
      <VendorTopNavbar onProfilePress={() => setMenuOpen(true)} />

      {/* Sidebar */}
      <VendorSideNav visible={menuOpen} onClose={() => setMenuOpen(false)} />
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
              tabBarIcon: ({ color }) => <FontAwesome name="home" size={22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: 'Orders',
              tabBarIcon: ({ color }) => <FontAwesome name="list-alt" size={22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Messages',
              tabBarIcon: ({ color }) => <FontAwesome name="comments" size={22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <FontAwesome name="user" size={22} color={color} />,
            }}
          />
          
          <Tabs.Screen name="categories" options={{ tabBarItemStyle: { display: 'none' } }} />
          <Tabs.Screen name="products" options={{ tabBarItemStyle: { display: 'none' } }} />
          <Tabs.Screen name="add-product" options={{ tabBarItemStyle: { display: 'none' } }} />
          <Tabs.Screen name="working-hours" options={{ tabBarItemStyle: { display: 'none' } }} />
          <Tabs.Screen name="dashboard" options={{ tabBarItemStyle: { display: 'none' } }} />
          <Tabs.Screen name="wallet" options={{ tabBarItemStyle: { display: 'none' } }} />
          <Tabs.Screen name="edit-product" options={{ tabBarItemStyle: { display: 'none' } }} />
          <Tabs.Screen name="manageShop" options={{ tabBarItemStyle: { display: 'none' } }} />
          <Tabs.Screen name="inbox" options={{ tabBarItemStyle: { display: 'none' } }} />
        </Tabs>
      </View>
    </VendorAuthProvider>
  );
}
