import { useEffect, useState, useContext } from 'react';
import { ScrollView, ActivityIndicator, Text, View, Pressable, Image } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Import contexts for data needed outside the dashboard API call
import { VendorAuthContext } from '../../../context/VendorAuthContext'; 
import { useWallet } from '../../../context/customer/WalletContext'; 

// --- Configuration Constants (Derived from HTML/Tailwind Config) ---
const PRIMARY_COLOR = "#2ECC71";
const PRIMARY_LIGHT = "rgba(46, 204, 113, 0.1)";
const TEXT_PRIMARY = "#34495E";
const TEXT_SECONDARY = "#7f8c9a";
const BORDER_COLOR = "#ECF0F1";
const CARD_LIGHT = "#FFFFFF";
const BACKGROUND_LIGHT = "#f6f8f6";

// Accent Colors
const BLUE_ACCENT = "#3498DB";
const RED_ACCENT = "#E74C3C";
const ORANGE_ACCENT = "#F39C12";


// --- Component ---
export default function VendorDashboard() { 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const authContext = useContext(VendorAuthContext);
  const { wallet } = useWallet();

  const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
             throw new Error('Authentication token missing. Please log in again.');
        }
        if (!BACKEND_URL) {
             throw new Error('Backend URL configuration is missing.');
        }

        const res = await axios.get(`${BACKEND_URL}/api/vendor/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        setError(`Failed to load dashboard data. Please check your connection.`); 
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dummy sales chart data (Last 7 Days)
  const salesChartData = [
    { label: 'Sat', value: 120 },
    { label: 'Sun', value: 150 },
    { label: 'Mon', value: 90 },
    { label: 'Tue', value: 200 },
    { label: 'Wed', value: 170 },
    { label: 'Thu', value: 220 },
    { label: 'Fri', value: 180 },
  ];
  
  // Data for the recent orders and top products lists (using fetched data as fallback)
  const recentOrders = data?.recentOrders || [
      { id: 1254, time: '5 minutes ago', total: 150.00, status: 'Pending Approval', statusColor: ORANGE_ACCENT },
      { id: 1253, time: '1 hour ago', total: 85.00, status: 'Out for Delivery', statusColor: BLUE_ACCENT },
  ];

  const topProducts = data?.topProducts || [
      { id: 1, name: 'Margherita Pizza', category: 'Baked Goods', count: 25, imgUrl: 'https://via.placeholder.com/150/2ECC71/FFFFFF?text=Product+1' },
      { id: 2, name: 'Fresh Orange Juice', category: 'Beverages', count: 18, imgUrl: 'https://via.placeholder.com/150/3498DB/FFFFFF?text=Product+2' },
  ];

  // --- Check Context States ---
  if (!authContext) {
    console.warn("VendorAuthContext is undefined — you forgot to wrap with the provider");
    return null;
  }
  
  if (authContext.loading || loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: BACKGROUND_LIGHT }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="text-gray-500 mt-4">Loading Dashboard...</Text>
      </View>
    );
  }

  // If error occurred during fetch
  if (error) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: BACKGROUND_LIGHT }}>
        <Text className="text-red-500 text-center p-4">{error}</Text>
        <Pressable 
          onPress={() => router.replace('/vendor/login')}
          className="mt-4 p-3 rounded-md"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
            <Text className="text-white font-bold">Go to Login</Text>
        </Pressable>
      </View>
    );
  }
  
  // Check verification state if data load was successful but verification status is key
  if (authContext.isVendorVerified === false) {
      return <Text>Redirecting to Verification...</Text>;
  }

  if (!data) return null;


  // --- Helper Components for Structure ---

  // Component to render individual bars in the sales chart
  const BarChartItem = ({ label, value, maxValue }) => {
    const heightPercentage = Math.round((value / maxValue) * 100);
    const MAX_CHART_HEIGHT_PX = 192; // h-48 = 192px

    return (
      <View className="flex h-full w-full flex-col items-center justify-end gap-2" style={{ flex: 1 }}>
        <View 
          className="w-4/5 rounded-t-md" 
          style={{ 
            height: (heightPercentage / 100) * MAX_CHART_HEIGHT_PX, 
            backgroundColor: PRIMARY_COLOR,
            width: '80%'
          }}
        />
        <Text className="text-xs" style={{ color: TEXT_SECONDARY }}>{label}</Text>
      </View>
    );
  };
  
  // Helper for Timeframe buttons
  const TimeframeButton = ({ label, isActive }) => {
    const activeStyle = isActive ? { backgroundColor: CARD_LIGHT, color: PRIMARY_COLOR, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 } : { color: TEXT_SECONDARY };

    return (
        <Pressable className="flex h-full grow items-center justify-center overflow-hidden rounded-md px-2" style={activeStyle}>
            {/* FIX: Wrap label string */}
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: isActive ? PRIMARY_COLOR : TEXT_SECONDARY }}>{label}</Text>
        </Pressable>
    );
  };

  // Helper for Quick Action links
  const QuickActionButton = ({ iconName, label, onPress, isLast = false }) => {
    return (
        <Pressable 
            className="flex-row items-center gap-4 p-4" 
            style={{ borderBottomWidth: isLast ? 0 : 1, borderColor: BORDER_COLOR }}
            onPress={onPress}
        >
            <Ionicons name={iconName} size={24} color={TEXT_SECONDARY} />
            {/* FIX: Wrap label string */}
            <Text className="flex-1 font-medium" style={{ color: TEXT_PRIMARY }}>{label}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color={TEXT_SECONDARY} />
        </Pressable>
    );
  };

  // Helper for Recent Order items
  const RecentOrderItem = ({ order }) => (
    <Pressable 
        className="flex-row items-center gap-4 rounded-lg p-3 bg-white border" 
        style={{ borderColor: BORDER_COLOR }}
        onPress={() => router.push(`/vendor/orders/${order.id}`)}
    >
        <View className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: PRIMARY_LIGHT }}>
            <Ionicons name="bag-handle-outline" size={24} color={PRIMARY_COLOR} />
        </View>
        <View className="flex-1">
            {/* FIX: Ensure string interpolation for Order # is wrapped */}
            <Text className="font-bold" style={{ color: TEXT_PRIMARY }}>
                <Text>Order #</Text>{order.id}
            </Text>
            <Text className="text-xs" style={{ color: TEXT_SECONDARY }}>{order.time}</Text>
        </View>
        <View className="items-end">
            {/* FIX: Ensure string interpolation for total is wrapped */}
            <Text className="font-bold" style={{ color: TEXT_PRIMARY }}>
                <Text>$</Text>{order.total.toFixed(2)}
            </Text>
            <Text className="text-xs" style={{ color: order.statusColor || TEXT_SECONDARY }}>{order.status}</Text>
        </View>
    </Pressable>
  );

  // Helper for Top Product items
  const TopProductItem = ({ product }) => (
    <Pressable 
        className="flex-row items-center gap-4 rounded-lg p-3 bg-white border" 
        style={{ borderColor: BORDER_COLOR }}
        onPress={() => router.push(`/vendor/products/${product.id}`)} 
    >
        <Image 
            source={{ uri: product.imgUrl }}
            className="h-16 w-16 rounded-lg" 
            style={{ resizeMode: 'cover' }}
        />
        <View className="flex-1">
            <Text className="font-bold" style={{ color: TEXT_PRIMARY }}>{product.name}</Text>
            <Text className="text-xs" style={{ color: TEXT_SECONDARY }}>{product.category}</Text>
        </View>
        {/* FIX: Ensure string interpolation for count is wrapped */}
        <Text className="font-bold" style={{ color: TEXT_PRIMARY }}>
            {product.count}<Text> orders</Text>
        </Text>
    </Pressable>
  );

  
  // Determine the maximum sales value for chart scaling
  const maxSalesValue = Math.max(...salesChartData.map(d => d.value));


  // --- Main Render Function (Replicating LTR Design) ---
  return (
    <View className="flex-1" style={{ backgroundColor: BACKGROUND_LIGHT, direction: 'ltr' }}>
      
      {/* Header (Top Bar) */}
      <View 
        className="flex-row items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b" 
        style={{ borderColor: BORDER_COLOR }}
      >
        <View className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: PRIMARY_LIGHT }}>
          <Ionicons name="rocket-outline" size={24} color={PRIMARY_COLOR} />
        </View>
        <Text className="text-lg font-bold flex-1 text-center" style={{ color: TEXT_PRIMARY }}>Dashboard</Text>
        <Pressable className="flex w-10 items-center justify-end h-10" onPress={() => router.push('/vendor/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={TEXT_PRIMARY} />
        </Pressable>
      </View>

      <ScrollView className="p-4 space-y-6" contentContainerStyle={{ paddingBottom: 20 }}> 
        
        {/* Dashboard Title */}
        <Text className="text-3xl font-bold leading-tight text-left pt-2" style={{ color: TEXT_PRIMARY }}>Dashboard</Text>

        {/* Timeframe Selector */}
        <View className="flex-row">
          <View className="flex h-12 flex-1 items-center justify-center rounded-lg p-1 flex-row" style={{ backgroundColor: BORDER_COLOR }}>
            <TimeframeButton label="Today" isActive={false} />
            <TimeframeButton label="This Week" isActive={false} />
            <TimeframeButton label="This Month" isActive={true} />
          </View>
        </View>
        
        {/* Sales Summary Cards */}
        <View className="flex-row flex-wrap gap-4">
          {/* Total Sales */}
          <View 
            className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-4 bg-white border" 
            style={{ borderColor: BORDER_COLOR }}
          >
            <Text className="text-sm font-medium" style={{ color: TEXT_SECONDARY }}>Total Sales</Text>
            <Text className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
                {/* FIX: Ensure string interpolation is wrapped */}
                <Text>$</Text>{data.salesSummary?.totalSales?.toFixed(2) || '0.00'}
            </Text>
          </View>
          {/* Total Orders */}
          <View 
            className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-4 bg-white border" 
            style={{ borderColor: BORDER_COLOR }}
          >
            <Text className="text-sm font-medium" style={{ color: TEXT_SECONDARY }}>Total Orders</Text>
            <Text className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
              {data.salesSummary?.totalOrders?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>

        {/* Order Status Cards */}
        <View>
          <Text className="text-lg font-bold pb-3 pt-2" style={{ color: TEXT_PRIMARY }}>Order Status</Text>
          <View className="flex-row flex-wrap justify-between gap-3">
            {([
              { key: 'delivered', count: data.orderStatus?.delivered || 0, label: 'Delivered', icon: 'checkmark-done-circle-outline', color: PRIMARY_COLOR, lightBg: PRIMARY_LIGHT },
              { key: 'cancelled', count: data.orderStatus?.cancelled || 0, label: 'Cancelled', icon: 'close-circle-outline', color: RED_ACCENT, lightBg: 'rgba(231, 76, 60, 0.1)' },
              { key: 'shipping', count: data.orderStatus?.shipping || 0, label: 'Out for Delivery', icon: 'car-outline', color: BLUE_ACCENT, lightBg: 'rgba(52, 152, 219, 0.1)' },
              { key: 'pending', count: data.orderStatus?.pending || 0, label: 'Pending Approval', icon: 'hourglass-outline', color: ORANGE_ACCENT, lightBg: 'rgba(243, 156, 18, 0.1)' },
            ]).map((status) => (
              <View 
                key={status.key} 
                className="flex flex-col items-center justify-center gap-2 rounded-lg p-4 bg-white border w-[48%]" 
                style={{ borderColor: BORDER_COLOR }}
              >
                <View className="flex items-center justify-center size-10 rounded-full" style={{ backgroundColor: status.lightBg }}>
                  <Ionicons name={status.icon} size={24} color={status.color} />
                </View>
                <Text className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>{status.label}</Text>
                {/* FIX: Ensure count and 'orders' string are wrapped */}
                <Text className="text-xs" style={{ color: TEXT_SECONDARY }}>{status.count.toLocaleString()}<Text> orders</Text></Text>
              </View>
            ))}
          </View>
        </View>

        {/* Wallet and Quick Actions */}
        <View className="space-y-4">
          {/* Wallet Card */}
          <View className="flex flex-col gap-4 rounded-lg p-5 bg-white border" style={{ borderColor: BORDER_COLOR }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm" style={{ color: TEXT_SECONDARY }}>Wallet Balance</Text>
                <Text className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
                  {/* FIX: Ensure string interpolation is wrapped */}
                  <Text>$</Text>{(wallet?.balance || data.wallet?.balance || 0).toFixed(2)}
                </Text>
              </View>
              <MaterialIcons name="account-balance-wallet" size={40} color={PRIMARY_COLOR} />
            </View>
            <Pressable 
              className="flex w-full items-center justify-center rounded-md h-12" 
              style={{ backgroundColor: PRIMARY_COLOR }}
              onPress={() => router.push('/vendor/wallet?action=withdraw')}
            >
              <Text className="text-white text-base font-bold">Request Payout</Text>
            </Pressable>
          </View>

          {/* Quick Actions (List style) */}
          <View className="flex flex-col rounded-lg bg-white border" style={{ borderColor: BORDER_COLOR }}>
            <QuickActionButton 
              iconName="storefront-outline" 
              label="Edit Shop" 
              onPress={() => router.push('/vendor/manageShop')} 
            />
            <QuickActionButton 
              iconName="receipt-outline" 
              label="View Orders" 
              onPress={() => router.push('/vendor/orders')} 
            />
            <QuickActionButton 
              iconName="add-circle-outline" 
              label="Add Product" 
              onPress={() => router.push('/vendor/add-product')} 
              isLast={true}
            />
          </View>
        </View>

        {/* Sales Chart (Last 7 Days) */}
        <View className="rounded-lg p-4 bg-white border" style={{ borderColor: BORDER_COLOR }}>
          <Text className="text-lg font-bold mb-4" style={{ color: TEXT_PRIMARY }}>Last 7 Days Sales</Text>
          <View className="flex-row h-48 items-end justify-between gap-2">
            {salesChartData.map((d, index) => (
              <BarChartItem 
                key={index} 
                label={d.label} 
                value={d.value} 
                maxValue={maxSalesValue} 
              />
            ))}
          </View>
        </View>

        {/* Recent Orders List */}
        <View>
          <Text className="text-lg font-bold mb-3 pt-2" style={{ color: TEXT_PRIMARY }}>Recent Orders</Text>
          <View className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <RecentOrderItem 
                key={order.id} 
                order={order} 
              />
            ))}
          </View>
        </View>

        {/* Top Products List */}
        <View>
          <Text className="text-lg font-bold mb-3 pt-2" style={{ color: TEXT_PRIMARY }}>Top Products</Text>
          <View className="flex flex-col gap-3">
            {topProducts.map((product, index) => (
              <TopProductItem 
                key={product.id || index} 
                product={product} 
              />
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}