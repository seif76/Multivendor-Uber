import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function SalesChart({ salesChartData }) {
  const labels = salesChartData.map((d) => d.label);
  const values = salesChartData.map((d) => d.value);
  return (
    <View className="bg-white rounded-xl shadow p-4 mb-4">
      <Text className="text-lg font-bold text-primary mb-2">Sales (Last 7 Days)</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={Dimensions.get('window').width - 48}
        height={180}
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(15, 157, 88, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(60,60,60,${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '5', strokeWidth: '2', stroke: '#0f9d58' },
        }}
        bezier
        style={{ borderRadius: 16 }}
      />
    </View>
  );
} 