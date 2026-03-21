import { useEffect, useState, useContext, useCallback } from 'react';
import {
  ScrollView,
  ActivityIndicator,
  Text,
  View,
  Pressable,
  Image,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { VendorAuthContext } from '../../../context/VendorAuthContext';
import { useWallet } from '../../../context/customer/WalletContext';

// ─── Colors ───
const PRIMARY_COLOR = '#2ECC71';
const PRIMARY_LIGHT = 'rgba(46, 204, 113, 0.1)';
const TEXT_PRIMARY = '#34495E';
const TEXT_SECONDARY = '#7f8c9a';
const BORDER_COLOR = '#ECF0F1';
const BACKGROUND_LIGHT = '#f6f8f6';
const BLUE_ACCENT = '#3498DB';
const RED_ACCENT = '#E74C3C';
const ORANGE_ACCENT = '#F39C12';

const TIMEFRAMES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const STATUS_CONFIG = [
  {
    key: 'delivered',
    label: 'Delivered',
    icon: 'checkmark-done-circle-outline',
    color: PRIMARY_COLOR,
    lightBg: PRIMARY_LIGHT,
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    icon: 'close-circle-outline',
    color: RED_ACCENT,
    lightBg: 'rgba(231, 76, 60, 0.1)',
  },
  {
    key: 'shipped',
    label: 'Out for Delivery',
    icon: 'car-outline',
    color: BLUE_ACCENT,
    lightBg: 'rgba(52, 152, 219, 0.1)',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: 'hourglass-outline',
    color: ORANGE_ACCENT,
    lightBg: 'rgba(243, 156, 18, 0.1)',
  },
];

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('month');

  const router = useRouter();
  const authContext = useContext(VendorAuthContext);
  const { wallet } = useWallet();

  const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;

  // ─────────────────────────────────────────────
  //  Fetch
  // ─────────────────────────────────────────────

  const fetchData = useCallback(async (selectedTimeframe = timeframe) => {
    try {
      setError('');
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing. Please log in again.');
      if (!BACKEND_URL) throw new Error('Backend URL configuration is missing.');

      const res = await axios.get(
        `${BACKEND_URL}/api/vendor/dashboard/summary?timeframe=${selectedTimeframe}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard data. Please check your connection.');
      console.error('Dashboard fetch error:', err.message);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData(timeframe);
      setLoading(false);
    };
    init();
  }, []);

  const handleTimeframeChange = async (newTimeframe) => {
    setTimeframe(newTimeframe);
    setLoading(true);
    await fetchData(newTimeframe);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(timeframe);
    setRefreshing(false);
  };

  // ─────────────────────────────────────────────
  //  Guards
  // ─────────────────────────────────────────────

  if (!authContext) return null;

  if (authContext.loading || (loading && !data)) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: BACKGROUND_LIGHT }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="text-gray-500 mt-4">Loading Dashboard...</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: BACKGROUND_LIGHT }}>
        <Ionicons name="cloud-offline-outline" size={48} color={TEXT_SECONDARY} />
        <Text className="text-gray-500 text-center mt-4 mb-6">{error}</Text>
        <Pressable
          onPress={() => { setLoading(true); fetchData(timeframe).finally(() => setLoading(false)); }}
          className="px-6 py-3 rounded-lg"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <Text className="text-white font-bold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (authContext.isVendorVerified === false) return <Text>Redirecting to Verification...</Text>;
  if (!data) return null;

  // ─────────────────────────────────────────────
  //  Computed values
  // ─────────────────────────────────────────────

  const chartData = data.chartData || [];
  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);
  const walletBalance = wallet?.balance ?? data.wallet?.balance ?? 0;

  // ─────────────────────────────────────────────
  //  Sub-components
  // ─────────────────────────────────────────────

  const TimeframeButton = ({ item }) => {
    const isActive = timeframe === item.key;
    return (
      <Pressable
        onPress={() => handleTimeframeChange(item.key)}
        className="flex h-full grow items-center justify-center overflow-hidden rounded-md px-2"
        style={
          isActive
            ? { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }
            : {}
        }
      >
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: isActive ? PRIMARY_COLOR : TEXT_SECONDARY }}>
          {item.label}
        </Text>
      </Pressable>
    );
  };

  const BarChartItem = ({ label, value, maxValue }) => {
    const MAX_HEIGHT = 160;
    const barHeight = maxValue > 0 ? Math.max((value / maxValue) * MAX_HEIGHT, 4) : 4;
    const isMax = value === maxValue && value > 0;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: MAX_HEIGHT + 24 }}>
        {value > 0 && (
          <Text style={{ fontSize: 9, color: TEXT_SECONDARY, marginBottom: 2 }}>
            ${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)}
          </Text>
        )}
        <View
          style={{
            width: '70%',
            height: barHeight,
            backgroundColor: isMax ? PRIMARY_COLOR : 'rgba(46,204,113,0.45)',
            borderRadius: 4,
          }}
        />
        <Text style={{ fontSize: 10, color: TEXT_SECONDARY, marginTop: 4 }}>{label}</Text>
      </View>
    );
  };

  const QuickActionButton = ({ iconName, label, onPress, isLast = false }) => (
    <Pressable
      className="flex-row items-center gap-4 p-4"
      style={{ borderBottomWidth: isLast ? 0 : 1, borderColor: BORDER_COLOR }}
      onPress={onPress}
    >
      <Ionicons name={iconName} size={24} color={TEXT_SECONDARY} />
      <Text className="flex-1 font-medium" style={{ color: TEXT_PRIMARY }}>{label}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color={TEXT_SECONDARY} />
    </Pressable>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: { bg: 'rgba(243,156,18,0.1)', text: ORANGE_ACCENT },
      confirmed: { bg: 'rgba(52,152,219,0.1)', text: BLUE_ACCENT },
      shipped: { bg: 'rgba(52,152,219,0.1)', text: BLUE_ACCENT },
      delivered: { bg: PRIMARY_LIGHT, text: PRIMARY_COLOR },
      cancelled: { bg: 'rgba(231,76,60,0.1)', text: RED_ACCENT },
    };
    const c = colors[status] || { bg: '#f0f0f0', text: TEXT_SECONDARY };
    return (
      <View style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: c.text, textTransform: 'capitalize' }}>
          {status}
        </Text>
      </View>
    );
  };

  const RecentOrderItem = ({ order }) => (
    <Pressable
      className="flex-row items-center gap-4 rounded-lg p-3 bg-white border"
      style={{ borderColor: BORDER_COLOR }}
      onPress={() => router.push(`/vendor/orders/${order.id}`)}
    >
      <View
        className="flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: PRIMARY_LIGHT }}
      >
        <Ionicons name="bag-handle-outline" size={22} color={PRIMARY_COLOR} />
      </View>
      <View className="flex-1">
        <Text className="font-bold" style={{ color: TEXT_PRIMARY }}>
          Order #{order.id}
        </Text>
        <Text style={{ fontSize: 12, color: TEXT_SECONDARY }}>{order.customer}</Text>
        <Text style={{ fontSize: 11, color: TEXT_SECONDARY }}>{order.time}</Text>
      </View>
      <View className="items-end gap-1">
        <Text className="font-bold" style={{ color: TEXT_PRIMARY }}>
          ${parseFloat(order.total).toFixed(2)}
        </Text>
        <StatusBadge status={order.status} />
      </View>
    </Pressable>
  );

  const TopProductItem = ({ product }) => (
    <Pressable
      className="flex-row items-center gap-4 rounded-lg p-3 bg-white border"
      style={{ borderColor: BORDER_COLOR }}
      onPress={() => router.push(`/vendor/products/${product.id}`)}
    >
      {product.imgUrl ? (
        <Image
          source={{ uri: product.imgUrl }}
          style={{ width: 56, height: 56, borderRadius: 8, resizeMode: 'cover' }}
        />
      ) : (
        <View
          style={{
            width: 56, height: 56, borderRadius: 8,
            backgroundColor: PRIMARY_LIGHT,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="cube-outline" size={24} color={PRIMARY_COLOR} />
        </View>
      )}
      <View className="flex-1">
        <Text className="font-bold" numberOfLines={1} style={{ color: TEXT_PRIMARY }}>
          {product.name}
        </Text>
        <Text style={{ fontSize: 12, color: TEXT_SECONDARY }}>
          ${product.revenue?.toFixed(2) || '0.00'} revenue
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-bold" style={{ color: PRIMARY_COLOR }}>
          {product.count}
        </Text>
        <Text style={{ fontSize: 11, color: TEXT_SECONDARY }}>sold</Text>
      </View>
    </Pressable>
  );

  // ─────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────

  return (
    <View className="flex-1" style={{ backgroundColor: BACKGROUND_LIGHT }}>

      {/* Header */}
      <View
        className="flex-row items-center bg-white p-4 pb-3 justify-between border-b"
        style={{ borderColor: BORDER_COLOR }}
      >
        <View
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: PRIMARY_LIGHT }}
        >
          <Ionicons name="rocket-outline" size={22} color={PRIMARY_COLOR} />
        </View>
        <Text className="text-lg font-bold flex-1 text-center" style={{ color: TEXT_PRIMARY }}>
          Dashboard
        </Text>
        <Pressable onPress={() => router.push('/vendor/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={TEXT_PRIMARY} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY_COLOR} />}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold pt-2 mb-4" style={{ color: TEXT_PRIMARY }}>
          Dashboard
        </Text>

        {/* Timeframe Selector */}
        <View
          className="flex-row h-12 rounded-lg p-1 mb-5"
          style={{ backgroundColor: BORDER_COLOR }}
        >
          {TIMEFRAMES.map((item) => (
            <TimeframeButton key={item.key} item={item} />
          ))}
        </View>

        {/* Loading overlay for timeframe change */}
        {loading && data && (
          <View className="items-center mb-4">
            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
          </View>
        )}

        {/* Sales Summary Cards */}
        <View className="flex-row gap-4 mb-5">
          <View
            className="flex-1 rounded-lg p-4 bg-white border"
            style={{ borderColor: BORDER_COLOR }}
          >
            <Text style={{ fontSize: 13, color: TEXT_SECONDARY }}>Total Sales</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: TEXT_PRIMARY }}>
              ${data.salesSummary?.total?.toFixed(2) || '0.00'}
            </Text>
            <Text style={{ fontSize: 11, color: TEXT_SECONDARY, marginTop: 2 }}>
              {TIMEFRAMES.find((t) => t.key === timeframe)?.label}
            </Text>
          </View>
          <View
            className="flex-1 rounded-lg p-4 bg-white border"
            style={{ borderColor: BORDER_COLOR }}
          >
            <Text style={{ fontSize: 13, color: TEXT_SECONDARY }}>Total Orders</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: TEXT_PRIMARY }}>
              {data.salesSummary?.totalOrders?.toLocaleString() || '0'}
            </Text>
            <Text style={{ fontSize: 11, color: TEXT_SECONDARY, marginTop: 2 }}>
              {TIMEFRAMES.find((t) => t.key === timeframe)?.label}
            </Text>
          </View>
        </View>

        {/* Order Status Cards */}
        <Text className="text-lg font-bold mb-3" style={{ color: TEXT_PRIMARY }}>
          Order Status
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-5">
          {STATUS_CONFIG.map((status) => (
            <View
              key={status.key}
              className="flex flex-col items-center justify-center gap-2 rounded-lg p-4 bg-white border"
              style={{ borderColor: BORDER_COLOR, width: '47%' }}
            >
              <View
                className="flex items-center justify-center size-10 rounded-full"
                style={{ backgroundColor: status.lightBg }}
              >
                <Ionicons name={status.icon} size={22} color={status.color} />
              </View>
              <Text className="text-sm font-bold text-center" style={{ color: TEXT_PRIMARY }}>
                {status.label}
              </Text>
              <Text style={{ fontSize: 12, color: TEXT_SECONDARY }}>
                {(data.orderStatus?.[status.key] || 0).toLocaleString()} orders
              </Text>
            </View>
          ))}
        </View>

        {/* Wallet Card */}
        <View
          className="rounded-lg p-5 bg-white border mb-3"
          style={{ borderColor: BORDER_COLOR }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text style={{ fontSize: 13, color: TEXT_SECONDARY }}>Wallet Balance</Text>
              <Text className="text-2xl font-bold mt-1" style={{ color: TEXT_PRIMARY }}>
                ${parseFloat(walletBalance).toFixed(2)}
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

        {/* Quick Actions */}
        <View
          className="flex flex-col rounded-lg bg-white border mb-5"
          style={{ borderColor: BORDER_COLOR }}
        >
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
            isLast
          />
        </View>

        {/* Last 7 Days Sales Chart */}
        <View
          className="rounded-lg p-4 bg-white border mb-5"
          style={{ borderColor: BORDER_COLOR }}
        >
          <Text className="text-lg font-bold mb-1" style={{ color: TEXT_PRIMARY }}>
            Last 7 Days Sales
          </Text>
          <Text style={{ fontSize: 12, color: TEXT_SECONDARY, marginBottom: 12 }}>
            Daily revenue breakdown
          </Text>
          {chartData.length > 0 ? (
            <View style={{ flexDirection: 'row', height: 184, alignItems: 'flex-end', gap: 4 }}>
              {chartData.map((d, index) => (
                <BarChartItem
                  key={index}
                  label={d.label}
                  value={d.value}
                  maxValue={maxChartValue}
                />
              ))}
            </View>
          ) : (
            <View className="items-center py-8">
              <Text style={{ color: TEXT_SECONDARY }}>No sales data yet</Text>
            </View>
          )}
        </View>

        {/* Recent Orders */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold" style={{ color: TEXT_PRIMARY }}>
              Recent Orders
            </Text>
            <Pressable onPress={() => router.push('/vendor/orders')}>
              <Text style={{ fontSize: 13, color: PRIMARY_COLOR, fontWeight: '600' }}>
                View All
              </Text>
            </Pressable>
          </View>
          {data.recentOrders?.length > 0 ? (
            <View style={{ gap: 10 }}>
              {data.recentOrders.map((order) => (
                <RecentOrderItem key={order.id} order={order} />
              ))}
            </View>
          ) : (
            <View
              className="rounded-lg p-6 bg-white border items-center"
              style={{ borderColor: BORDER_COLOR }}
            >
              <Ionicons name="bag-outline" size={32} color={TEXT_SECONDARY} />
              <Text style={{ color: TEXT_SECONDARY, marginTop: 8 }}>No orders yet</Text>
            </View>
          )}
        </View>

        {/* Top Products */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold" style={{ color: TEXT_PRIMARY }}>
              Top Products
            </Text>
            <Pressable onPress={() => router.push('/vendor/products')}>
              <Text style={{ fontSize: 13, color: PRIMARY_COLOR, fontWeight: '600' }}>
                View All
              </Text>
            </Pressable>
          </View>
          {data.topProducts?.length > 0 ? (
            <View style={{ gap: 10 }}>
              {data.topProducts.map((product) => (
                <TopProductItem key={product.id} product={product} />
              ))}
            </View>
          ) : (
            <View
              className="rounded-lg p-6 bg-white border items-center"
              style={{ borderColor: BORDER_COLOR }}
            >
              <Ionicons name="cube-outline" size={32} color={TEXT_SECONDARY} />
              <Text style={{ color: TEXT_SECONDARY, marginTop: 8 }}>No product sales yet</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}