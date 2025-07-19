import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, Alert, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const BACKEND_URL = Constants.expoConfig.extra.BACKEND_URL;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/vendor/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCategories(data);
      else Alert.alert('Error', data.error || 'Failed to fetch categories');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/vendor/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCategory }),
      });
      if (res.ok) {
        setNewCategory('');
        fetchCategories();
      } else {
        const data = await res.json();
        Alert.alert('Error', data.error || 'Failed to add category');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Category', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const res = await fetch(`${BACKEND_URL}/api/vendor/categories/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) fetchCategories();
          else {
            const data = await res.json();
            Alert.alert('Error', data.error || 'Failed to delete');
          }
        } catch (err) {
          Alert.alert('Error', err.message);
        }
      } },
    ]);
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    setEditName(cat.name);
    setEditModal(true);
  };

  const handleEdit = async () => {
    if (!editName.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/vendor/categories/${editCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setEditModal(false);
        fetchCategories();
      } else {
        const data = await res.json();
        Alert.alert('Error', data.error || 'Failed to update');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View className="flex-1 bg-white px-4 pt-10">
      <Text className="text-2xl font-bold text-primary mb-6">My Categories</Text>
      <View className="flex-row mb-6">
        <TextInput
          value={newCategory}
          onChangeText={setNewCategory}
          placeholder="Add new category"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mr-2"
        />
        <Pressable onPress={handleAdd} className="bg-primary px-5 rounded-xl justify-center">
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
      {loading ? (
        <Text className="text-gray-400 text-center mt-10">Loading...</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-gray-50 rounded-xl mb-3 px-4 py-3 shadow-sm border border-gray-100">
              <MaterialIcons name="category" size={22} color="#0f9d58" className="mr-3" />
              <Text className="flex-1 text-base font-semibold text-gray-800">{item.name}</Text>
              <Pressable onPress={() => openEditModal(item)} className="mr-2">
                <Ionicons name="create-outline" size={20} color="#007233" />
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text className="text-gray-400 text-center mt-10">No categories yet.</Text>}
        />
      )}
      {/* Edit Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View className="flex-1 bg-black/30 justify-center items-center">
          <View className="bg-white p-6 rounded-2xl w-[85%]">
            <Text className="text-lg font-bold mb-4 text-primary">Edit Category</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Category name"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4"
            />
            <View className="flex-row justify-end">
              <Pressable onPress={() => setEditModal(false)} className="mr-4">
                <Text className="text-gray-500 font-semibold">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleEdit} className="bg-primary px-6 py-2 rounded-xl">
                <Text className="text-white font-bold">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 