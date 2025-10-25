import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(val) {
  if (!val) return '';
  const [h, m] = val.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export default function WorkingHourModal({ visible, onClose, onSave, saving, day, initial }) {
  const [form, setForm] = useState({ open_time: '', close_time: '' });
  const [picker, setPicker] = useState({ show: false, field: null });
  const [temp, setTemp] = useState({ open_time: '', close_time: '' });
  const [pickerValue, setPickerValue] = useState(new Date());

  useEffect(() => {
    if (initial) {
      setForm(initial);
      setTemp(initial);
    } else {
      setForm({ open_time: '', close_time: '' });
      setTemp({ open_time: '', close_time: '' });
    }
  }, [initial, visible]);

  const showPicker = (field) => {
    let value = temp[field];
    let date = value ? new Date(`1970-01-01T${value}:00`) : new Date();
    setPickerValue(date);
    setPicker({ show: true, field });
  };
  const hidePicker = () => setPicker({ show: false, field: null });

  const handleTimeChange = (event, selectedDate) => {
    if (event.type === 'dismissed') return;
    if (selectedDate) setPickerValue(selectedDate);
  };

  const handlePickerDone = () => {
    const hours = pickerValue.getHours().toString().padStart(2, '0');
    const minutes = pickerValue.getMinutes().toString().padStart(2, '0');
    const newTime = `${hours}:${minutes}`;
    setTemp(t => ({ ...t, [picker.field]: newTime }));
    hidePicker();
  };

  const handleSave = () => {
    setForm(temp);
    onSave(temp);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/30 justify-center items-center">
        <View className="bg-white w-[90%] rounded-2xl p-6">
          <Text className="text-xl font-bold text-primary mb-4">{initial ? 'Edit' : 'Add'} Interval ({DAYS[day]})</Text>
          <Pressable onPress={() => showPicker('open_time')} className="border border-gray-300 rounded-lg px-4 py-3 mb-4 bg-gray-50">
            <Text className={temp.open_time ? 'text-gray-900' : 'text-gray-400'}>
              {temp.open_time ? `Open: ${formatTime(temp.open_time)}` : 'Select Open Time'}
            </Text>
          </Pressable>
          <Pressable onPress={() => showPicker('close_time')} className="border border-gray-300 rounded-lg px-4 py-3 mb-4 bg-gray-50">
            <Text className={temp.close_time ? 'text-gray-900' : 'text-gray-400'}>
              {temp.close_time ? `Close: ${formatTime(temp.close_time)}` : 'Select Close Time'}
            </Text>
          </Pressable>
          {picker.show && (
            <Modal visible transparent animationType="fade">
              <View className="flex-1 justify-center items-center bg-black/40">
                <View className="bg-white rounded-2xl p-6 w-[90%] items-center">
                  <DateTimePicker
                    value={pickerValue}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    style={{ width: 250 }}
                  />
                  <Pressable onPress={handlePickerDone} className="mt-4 bg-primary px-6 py-2 rounded-xl">
                    <Text className="text-white font-bold text-lg">Done</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          )}
          <View className="flex-row justify-end gap-4">
            <Pressable onPress={onClose} className="bg-gray-200 px-6 py-2 rounded-xl">
              <Text className="text-gray-700 font-bold">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} className={`bg-primary px-6 py-2 rounded-xl ${saving ? 'opacity-60' : ''}`} disabled={saving}>
              <Text className="text-white font-bold">{saving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
} 