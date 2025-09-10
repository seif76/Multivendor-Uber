import { FontAwesome } from '@expo/vector-icons';
import { Slot, Tabs, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import DeliverymanSideNav from '../../../components/deliveryman/navigation/sideNav';
import DeliverymanTopNavbar from '../../../components/deliveryman/navigation/topNav';
import { DeliverymanAuthProvider } from '../../../context/DeliverymanAuthContext';
import OnlineStatusBar from '../../../components/deliveryman/custom/OnlineStatusBar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function DeliverymanLayout() {
  const segments = useSegments();
  const [showTabs, setShowTabs] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  useEffect(() => {
    const current = segments[segments.length - 1];
    setShowTabs(current !== 'login' && current !== 'register'); // hide tabs on login/register
  //  alert(platform?.OS);
  }, [segments]);

  if (!showTabs) {
    return <Slot />; // only show login/register screen
  }

  return (
    <DeliverymanAuthProvider>
          

      <View className={`flex-1 bg-white  `}>      
        <SafeAreaView 
        edges={Platform.OS === 'android' ? ['top'] : []}
        className={`flex-1 bg-white `}>

          {/* Deliveryman Top Navbar */}
      <DeliverymanTopNavbar onProfilePress={() => setMenuOpen(true)} isOnline={isOnline} setIsOnline={setIsOnline} />

      {/* Sidebar */}
      <DeliverymanSideNav visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <OnlineStatusBar isOnline={isOnline} setIsOnline={setIsOnline} />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#3b82f6', // Blue color for deliveryman
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
            name="wallet"
            options={{
              title: 'Wallet',
              tabBarIcon: ({ color }) => <FontAwesome name="dollar" size={22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <FontAwesome name="user" size={22} color={color} />,
            }}
          />
          
          {/* Hidden screens */}
          <Tabs.Screen name="inbox" options={{ tabBarItemStyle: { display: 'none' } }} />
        </Tabs>
        </SafeAreaView>
      
      </View>

    </DeliverymanAuthProvider>
  );
}
