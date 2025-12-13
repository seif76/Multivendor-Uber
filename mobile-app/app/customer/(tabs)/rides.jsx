import { View, Text, Alert } from 'react-native';
import { useEffect } from 'react';

export default function Rides() {
  useEffect(() => {
    Alert.alert('Coming Soon!');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Rides Page (Coming Soon)</Text>
    </View>
  );
}
