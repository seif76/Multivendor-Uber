import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import WorkingHourDay from './WorkingHourDay';
import WorkingHourModal from './WorkingHourModal';

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
  const [modal, setModal] = useState({ open: false, day: null, interval: null });
  const [saving, setSaving] = useState(false);

  const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;

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

  // Modal handlers
  const openAddModal = (day_of_week) => setModal({ open: true, day: day_of_week, interval: null });
  const openEditModal = (interval) => setModal({ open: true, day: interval.day_of_week, interval });
  const closeModal = () => setModal({ open: false, day: null, interval: null });

  // Save handler (add or edit)
  const handleSave = async (form) => {
    if (!form.open_time || !form.close_time) {
      Alert.alert('Validation', 'Please enter both opening and closing times.');
      return;
    }
    // Collision check
    const open = form.open_time;
    const close = form.close_time;
    const intervals = intervalsByDay[modal.day] || [];
    // If editing, exclude the current interval
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
      // Overlap if: startA < endB && endA > startB
      if (newStart < intvEnd && newEnd > intvStart) {
        Alert.alert('Validation', 'This interval overlaps with an existing interval.');
        return;
      }
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (modal.interval) {
        // Edit
        await axios.put(`${BACKEND_URL}/api/vendor/vendor-working-hours/working-hours/${modal.interval.id}`, {
          day_of_week: modal.day,
          open_time: form.open_time,
          close_time: form.close_time,
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        // Add
        await axios.post(`${BACKEND_URL}/api/vendor/vendor-working-hours/working-hours`, {
          day_of_week: modal.day,
          open_time: form.open_time,
          close_time: form.close_time,
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      closeModal();
      fetchWorkingHours();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    }
    setSaving(false);
  };

  // Delete handler
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

  // Group intervals by day_of_week
  const intervalsByDay = {};
  for (const { day_of_week } of DAYS) {
    intervalsByDay[day_of_week] = [];
  }
  for (const interval of workingHours) {
    if (intervalsByDay[interval.day_of_week]) {
      intervalsByDay[interval.day_of_week].push(interval);
    }
  }

  return (
    <View className="flex-1 bg-gray-50 px-4 py-6">
      <Text className="text-2xl font-bold text-primary mb-4">Working Hours</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007233" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {DAYS.map(({ day, day_of_week }) => (
            <WorkingHourDay
              key={day_of_week}
              day={day}
              day_of_week={day_of_week}
              intervals={intervalsByDay[day_of_week] || []}
              onAdd={openAddModal}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}
      <WorkingHourModal
        visible={modal.open}
        onClose={closeModal}
        onSave={handleSave}
        saving={saving}
        day={modal.day}
        initial={modal.interval ? { open_time: modal.interval.open_time, close_time: modal.interval.close_time } : null}
      />
    </View>
  );
}