import { Slot } from 'expo-router';
import { CartProvider } from '../../context/customer/CartContext';
import { CustomerAuthProvider } from '../../context/customer/CustomerAuthContext';
import { WalletProvider } from '../../context/customer/WalletContext';
import { HomeProvider } from '../../context/customer/HomeContext';

export default function CustomerLayout() {
  return (
    <CustomerAuthProvider>
      <WalletProvider>
        <HomeProvider>
          <CartProvider>
            <Slot />
          </CartProvider>
        </HomeProvider>
      </WalletProvider>
    </CustomerAuthProvider>
  );
}
