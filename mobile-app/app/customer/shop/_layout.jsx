import { Slot } from 'expo-router';
import { CartProvider } from '../../../context/customer/CartContext';
import { CustomerAuthProvider } from '../../../context/customer/CustomerAuthContext';

export default function RootLayout() {
  return (
    <CustomerAuthProvider>
    <CartProvider>
      <Slot />
    </CartProvider>
    </CustomerAuthProvider>
  );
}
