import { Slot } from 'expo-router';
import FloatingCartButton from '../../../components/customer/custom/shop/FloatingCartButton';
import { CartProvider } from '../../../context/customer/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Slot />
      <FloatingCartButton />
    </CartProvider>
  );
}
