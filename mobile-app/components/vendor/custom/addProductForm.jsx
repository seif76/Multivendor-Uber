import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View, Modal, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function AddProductForm({ onSubmit, categories = [], submitText = 'Add Product' }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [vendorCategoryId, setVendorCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [imageError, setImageError] = useState('');
  const [picking, setPicking] = useState(false);

  const handleSubmit = () => {
    if (!name || !price) {
      Alert.alert('Validation', 'Name and price are required');
      return;
    }
    if (!image || !image.uri) {
      Alert.alert('Validation', 'Product image is required');
      return;
    }
    const data = {
      name,
      price,
      description,
      vendor_category_id: vendorCategoryId || null,
      stock,
      image, // pass the file object
    };
    onSubmit(data);
    setName('');
    setPrice('');
    setDescription('');
    setVendorCategoryId('');
    setStock('');
    setImage(null);
  };
  // Use the same pickImage logic as customer registration
  const pickImage = async (setter) => {
    setImageError('');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setImageError('Permission to access media library is required!');
        Alert.alert('Permission required', 'Please allow access to your photos to select a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setter({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
      } else {
        setter(null);
      }
    } catch (err) {
      setImageError('Failed to pick image.');
    }
  };

  const selectedCategory = categories.find((cat) => cat.id === vendorCategoryId);

  return (
    <View className="gap-4">
      <TextInput placeholder="Name" value={name} onChangeText={setName} className="border p-2 rounded" />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" className="border p-2 rounded" />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} className="border p-2 rounded" />
      {/* Custom Category Dropdown */}
      <Pressable
        onPress={() => setCategoryModal(true)}
        className={`border rounded p-3 flex-row items-center justify-between ${vendorCategoryId ? 'border-primary' : 'border-gray-300'}`}
      >
        <Text className={`text-base ${vendorCategoryId ? 'text-primary' : 'text-gray-400'}`}>{selectedCategory ? selectedCategory.name : 'Select Category'}</Text>
        <Text className="text-lg text-primary">▼</Text>
      </Pressable>
      <Modal visible={categoryModal} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/30 justify-center items-center" onPress={() => setCategoryModal(false)}>
          <View className="bg-white w-[85%] max-h-[60%] rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4 text-primary">Select Category</Text>
            <ScrollView>
              {categories.length === 0 && (
                <Text className="text-gray-400 text-center">No categories found.</Text>
              )}
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setVendorCategoryId(cat.id);
                    setCategoryModal(false);
                  }}
                  className={`py-3 px-2 rounded-xl mb-1 ${vendorCategoryId === cat.id ? 'bg-primary' : 'bg-gray-100'}`}
                >
                  <Text className={`text-base ${vendorCategoryId === cat.id ? 'text-white font-bold' : 'text-gray-800'}`}>{cat.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
      <TextInput placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" className="border p-2 rounded" />
      {/* Product Image Picker */}
      <View className="items-center mb-2">
        <TouchableOpacity
          onPress={() => pickImage(setImage)}
          className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-green-400 items-center justify-center mb-2"
          activeOpacity={0.7}
        >
          {image && image.uri ? (
            <Image
              source={{ uri: image.uri }}
              style={{ width: 96, height: 96, borderRadius: 48 }}
            />
            ) : (
            <Ionicons name="camera" size={36} color="#22c55e" />
          )}
        </TouchableOpacity>
        <Text className="text-primary font-semibold mt-1">Pick Product Image</Text>
        {imageError ? <Text className="text-red-500 text-xs mt-1">{imageError}</Text> : null}
      </View>
      <Pressable onPress={handleSubmit} className="bg-primary py-3 rounded">
        <Text className="text-white text-center font-semibold">{submitText}</Text>
      </Pressable>
    </View>
  );
}
