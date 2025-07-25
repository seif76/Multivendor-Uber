import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Text, View } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import SalesSummaryCard from '../../../components/vendor/dashboard/SalesSummaryCard';
import OrderStatusCards from '../../../components/vendor/dashboard/OrderStatusCards';
import WalletCard from '../../../components/vendor/dashboard/WalletCard';
import QuickActions from '../../../components/vendor/dashboard/QuickActions';
import RecentOrdersList from '../../../components/vendor/dashboard/RecentOrdersList';
import TopProductsList from '../../../components/vendor/dashboard/TopProductsList';
import NotificationsList from '../../../components/vendor/dashboard/NotificationsList';
import ReviewsList from '../../../components/vendor/dashboard/ReviewsList';
import SupportLinks from '../../../components/vendor/dashboard/SupportLinks';
import SalesChart from '../../../components/vendor/dashboard/SalesChart';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await  AsyncStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/vendor/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(JSON.stringify(res.data));
        setData(res.data);
      } catch (err) {
        setError('Failed to load dashboard data' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dummy sales chart data (last 7 days)
  const salesChartData = [
    { label: 'Mon', value: 120  },
    { label: 'Tue', value: 150 },
    { label: 'Wed', value: 90 },
    { label: 'Thu', value: 200 },
    { label: 'Fri', value: 170 },
    { label: 'Sat', value: 220 },
    { label: 'Sun', value: 180 },
  ];

  const handleAction = (action) => {
    // Implement navigation or actions for quick actions
    // e.g., router.push('/vendor/products')
  };

  if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0f9d58" /></View>;
  if (error) return <View className="flex-1 justify-center items-center"><Text className="text-red-500">{error}</Text></View>;
  if (!data) return null;

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4 pt-10">
      <SalesSummaryCard salesSummary={data.salesSummary} />
      <OrderStatusCards orderStatus={data.orderStatus} />
      <WalletCard wallet={data.wallet} />
      <QuickActions onAction={handleAction} />
      <SalesChart salesChartData={salesChartData} />
      <RecentOrdersList recentOrders={data.recentOrders} />
      <TopProductsList topProducts={data.topProducts} />
      <NotificationsList notifications={data.notifications} />
      <ReviewsList reviews={data.reviews} />
      <SupportLinks />
    </ScrollView>
  );
} 