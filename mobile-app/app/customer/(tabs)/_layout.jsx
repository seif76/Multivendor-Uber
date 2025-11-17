import { FontAwesome } from '@expo/vector-icons';
import { Slot, Tabs, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { CustomerAuthProvider } from '../../../context/customer/CustomerAuthContext';
import { WalletProvider } from '../../../context/customer/WalletContext';
import { HomeProvider } from '../../../context/customer/HomeContext';
import { CartProvider } from '../../../context/customer/CartContext';
import { useLanguage } from '../../../context/LanguageContext';
import { MaterialIcons } from '@expo/vector-icons'; // Expo's built-in icons


export default function CustomerLayout() {
  const segments = useSegments();
  const [showTabs, setShowTabs] = useState(true);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const current = segments[segments.length - 1];
    setShowTabs(current !== 'login' && current !== 'register'); // hide tabs on login/register
  }, [segments]);

  if (!showTabs) {
    return (
      <CustomerAuthProvider>
        <WalletProvider>
          <HomeProvider>
            <Slot />
          </HomeProvider>
        </WalletProvider>
      </CustomerAuthProvider>
    );
  }

  return (
    <CustomerAuthProvider>
      <CartProvider>
        <WalletProvider>
          <HomeProvider>
          <View className="flex-1 bg-white">
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#0f9d58',
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: t('navigation.home'),
              tabBarIcon: ({ color }) => <FontAwesome name="home" size={22} color={color} />,
            }}
          />
         
          <Tabs.Screen
            name="orders"
            options={{
              title: t('navigation.orders'),
              tabBarIcon: ({ color }) => <MaterialIcons name="receipt-long" size={30} color={color}/>,
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: t('navigation.chat'),
              tabBarIcon: ({ color }) => <FontAwesome name="comments" size={22} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: t('navigation.profile'),
              tabBarIcon: ({ color }) => <FontAwesome name="user" size={22} color={color} />,
            }}
          />
           <Tabs.Screen
            name="wallet"
            options={{
              title: t('navigation.wallet'),
              tabBarIcon: ({ color }) => <FontAwesome name="money" size={22} color={color} />,
            }}
          />
         <Tabs.Screen name="orders/[orderId]" options={{ tabBarItemStyle: { display: 'none' } }} />

        </Tabs>
          </View>
          </HomeProvider>
        </WalletProvider>
      </CartProvider>
    </CustomerAuthProvider>
  );
} 