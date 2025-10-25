import { Slot } from 'expo-router';
import { CartProvider } from '../../context/customer/CartContext';
import { CustomerAuthProvider } from '../../context/customer/CustomerAuthContext';
import { WalletProvider } from '../../context/customer/WalletContext';
import { HomeProvider } from '../../context/customer/HomeContext';
import { LanguageProvider } from '../../context/LanguageContext';

export default function CustomerLayout() {
  return (
    <LanguageProvider>
      <CustomerAuthProvider>
        <WalletProvider>
          <HomeProvider>
            <CartProvider>
              <Slot />
            </CartProvider>
          </HomeProvider>
        </WalletProvider>
      </CustomerAuthProvider>
    </LanguageProvider>
  );
}
