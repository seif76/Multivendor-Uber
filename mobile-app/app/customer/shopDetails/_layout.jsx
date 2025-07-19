import { Slot } from 'expo-router';
import FloatingCartButton from '../../../components/customer/custom/shop/FloatingCartButton';
import { CartProvider } from '../../../context/customer/CartContext';
import { CustomerAuthProvider } from '../../../context/customer/CustomerAuthContext';

export default function RootLayout() {
  return ( 
    <CustomerAuthProvider>
    <CartProvider>
      <Slot />
      <FloatingCartButton />
    </CartProvider>
    </CustomerAuthProvider>
  );
}
