import { Slot } from 'expo-router';
import { CartProvider } from '../../../context/customer/CartContext';
import { CustomerAuthProvider } from '../../../context/customer/CustomerAuthContext';
import { SafeAreaProvider  , SafeAreaView} from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
<SafeAreaProvider>
      <CustomerAuthProvider>
        <CartProvider>
          {/* flex: 1 is crucial here so the view doesn't collapse */}
          <SafeAreaView style={{ flex: 1 }}>
            <Slot />
          </SafeAreaView>
        </CartProvider>
      </CustomerAuthProvider>
    </SafeAreaProvider>
  );
}
