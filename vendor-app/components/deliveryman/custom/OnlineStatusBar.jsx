

import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function OnlineStatusBar({ isOnline, setIsOnline }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);

    if (isOnline) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, setIsOnline]);

  if (!visible && isOnline) return null;

  return (
    <View
      className={`absolute z-[49] bottom-[90px] left-4 right-4 px-4 py-4 rounded-lg ${
        isOnline ? 'bg-green-100' : 'bg-red-100'
      }`}
      
    >
      <Text
        className={`text-center font-semibold text-lg ${
          isOnline ? 'text-green-700' : 'text-red-700'
        }`}
      >
        {isOnline ? 'Online' : 'Offline'}
      </Text>
    </View>
  );
}

