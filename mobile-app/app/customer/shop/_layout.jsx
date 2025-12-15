import { Slot } from 'expo-router';
import { CartProvider } from '../../../context/customer/CartContext';
import { CustomerAuthProvider } from '../../../context/customer/CustomerAuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <CustomerAuthProvider>
    <CartProvider>
      <Slot />
    </CartProvider>
    </CustomerAuthProvider>
    </SafeAreaProvider>
  );
}
