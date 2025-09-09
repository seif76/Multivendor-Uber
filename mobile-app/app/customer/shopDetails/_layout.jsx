import { Slot } from 'expo-router';
import FloatingCartButton from '../../../components/customer/custom/shop/FloatingCartButton';

export default function RootLayout() {
  return ( 
    <>
      <Slot />
      <FloatingCartButton />
    </>
  );
}
