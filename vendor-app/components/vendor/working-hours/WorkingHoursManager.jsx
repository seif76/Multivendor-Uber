import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import WorkingHourDay from './WorkingHourDay';
import WorkingHourModal from './WorkingHourModal';

// DAYS constant kept locally
const DAYS = [
  { day: 'Monday', day_of_week: 1 },
  { day: 'Tuesday', day_of_week: 2 },
  { day: 'Wednesday', day_of_week: 3 },
  { day: 'Thursday', day_of_week: 4 },
  { day: 'Friday', day_of_week: 5 },
  { day: 'Saturday', day_of_week: 6 },
  { day: 'Sunday', day_of_week: 0 },
];

export default function WorkingHoursManager() {
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, day_of_week: null, interval: null }); 
  const [saving, setSaving] = useState(false);

  const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;

  // --- Core Data Fetch ---
  const fetchWorkingHours = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/vendor/vendor-working-hours/working-hours`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkingHours(res.data.working_hours || res.data || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to fetch working hours');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  // --- Modal Handlers ---
  const openAddModal = (day_of_week) => setModal({ open: true, day_of_week, interval: null });
  const openEditModal = (interval) => setModal({ open: true, day_of_week: interval.day_of_week, interval });
  const closeModal = () => setModal({ open: false, day_of_week: null, interval: null });

  // --- Toggle Handler ---
  const handleToggle = (day_of_week, isActive) => {
    if (isActive) {
      // Case 1: Currently active (ON), user is switching OFF.
      // 1. Remove confirmation. 2. Call the new deletion logic.
      clearDayIntervals(day_of_week);
    } else {
      // Case 2: Currently inactive (OFF), user is switching ON -> Open modal to add first interval.
      openAddModal(day_of_week);
    }
  };

  // --- MODIFIED Deletion Logic: Iterates over intervals and uses the individual delete API ---
  const clearDayIntervals = async (day_of_week) => {
    const intervalsToDelete = intervalsByDay[day_of_week] || [];

    if (intervalsToDelete.length === 0) {
      // Nothing to delete, just refresh state if necessary
      return; 
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Perform sequential deletion for each interval
      for (const interval of intervalsToDelete) {
        await axios.delete(`${BACKEND_URL}/api/vendor/vendor-working-hours/working-hours/${interval.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      const dayName = DAYS.find(d => d.day_of_week === day_of_week).day;
      Alert.alert('Success', `${dayName} is now closed and all intervals have been removed.`);
      fetchWorkingHours(); // Refresh the list
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to clear intervals.');
    }
    setLoading(false);
  };
  // --- END MODIFIED Deletion Logic ---
  
  // --- Save handler (add or edit) ---
  const handleSave = async (form) => {
     if (!form.open_time || !form.close_time) {
      Alert.alert('Validation', 'Please enter both opening and closing times.');
      return;
    }
    // ... (Collision check logic remains here) ...
    const open = form.open_time;
    const close = form.close_time;
    const intervals = intervalsByDay[modal.day_of_week] || [];
    const editingId = modal.interval ? modal.interval.id : null;
    const toMinutes = t => {
      const [h, m] = t.split(':');
      return parseInt(h, 10) * 60 + parseInt(m, 10);
    };
    const newStart = toMinutes(open);
    const newEnd = toMinutes(close);
    if (newEnd <= newStart) {
      Alert.alert('Validation', 'Closing time must be after opening time.');
      return;
    }
    for (const intv of intervals) {
      if (editingId && intv.id === editingId) continue;
      const intvStart = toMinutes(intv.open_time);
      const intvEnd = toMinutes(intv.close_time);
      if (newStart < intvEnd && newEnd > intvStart) {
        Alert.alert('Validation', 'This interval overlaps with an existing interval.');
        return;
      }
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const method = modal.interval ? 'put' : 'post';
      const url = modal.interval 
        ? `${BACKEND_URL}/api/vendor/vendor-working-hours/working-hours/${modal.interval.id}`
        : `${BACKEND_URL}/api/vendor/vendor-working-hours/working-hours`;
      const payload = {
          day_of_week: modal.day_of_week,
          open_time: form.open_time,
          close_time: form.close_time,
      };

      await axios({ method, url, data: payload, headers: { Authorization: `Bearer ${token}` } });
      
      closeModal();
      fetchWorkingHours();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    }
    setSaving(false);
  };

  // --- Individual Delete handler (for the delete button) ---
  const handleDelete = async (interval) => {
    Alert.alert(
      'Delete Interval',
      'Are you sure you want to delete this interval?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${BACKEND_URL}/api/vendor/vendor-working-hours/working-hours/${interval.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchWorkingHours();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || err.message);
            }
          },
        },
      ]
    );
  };

  // --- Group intervals by day_of_week ---
  const intervalsByDay = {};
  for (const { day_of_week } of DAYS) {
    intervalsByDay[day_of_week] = [];
  }
  for (const interval of workingHours) {
    if (intervalsByDay[interval.day_of_week] !== undefined) {
      intervalsByDay[interval.day_of_week].push(interval);
    }
  }
  
  const modalDayName = DAYS.find(d => d.day_of_week === modal.day_of_week)?.day || 'Day';


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Working Hours</Text>
        <Text className="text-base text-gray-600 mb-6">Manage the open and close time intervals for your store.</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#20df20" />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
            {DAYS.map(({ day, day_of_week }) => (
              <WorkingHourDay
                key={day_of_week}
                day={day}
                day_of_week={day_of_week}
                intervals={intervalsByDay[day_of_week] || []}
                onToggle={handleToggle}
                onAdd={openAddModal}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
             <View className="h-20" /> 
          </ScrollView>
        )}
      </View>
      <WorkingHourModal
        visible={modal.open}
        onClose={closeModal}
        onSave={handleSave}
        saving={saving}
        dayName={modalDayName}
        day_of_week={modal.day_of_week}
        initial={modal.interval ? { open_time: modal.interval.open_time, close_time: modal.interval.close_time } : null}
      />
    </SafeAreaView>
  );
}