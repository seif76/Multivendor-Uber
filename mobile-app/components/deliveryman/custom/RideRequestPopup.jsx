import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { io } from 'socket.io-client';

// ⚠️ Replace with your local IP or production URL
const socket = io('http://192.168.1.22:5000');

export default function RideRequestPopup() {
  const [ride, setRide] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('newRideRequest', (rideData) => {
      console.log('📦 New ride received:', rideData);
      setRide(rideData);
    });

    return () => {
      socket.off('newRideRequest');
    };
  }, []);

  const handleAccept = () => {
    console.log('✅ Ride accepted');
    setRide(null);
  };

  const handleDecline = () => {
    console.log('❌ Ride declined');
    setRide(null);
  };

  if (!ride) return null;

  return (
    <View className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-2xl shadow-lg z-50">
      <Text className="text-lg font-bold mb-2">New Ride Request</Text>
      <Text className="mb-1">
        From: {ride.pickup_address || JSON.stringify(ride.pickup_coordinates)}
      </Text>
      <Text className="mb-1">
        To: {ride.dropoff_address || JSON.stringify(ride.dropoff_coordinates)}
      </Text>
      <Text className="mb-2">Fare: {ride.requested_fare} EGP</Text>

      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={handleAccept}
          className="bg-green-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-bold">Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDecline}
          className="bg-red-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-bold">Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
