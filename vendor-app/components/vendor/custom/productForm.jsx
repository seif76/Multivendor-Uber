import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View, Modal, ScrollView, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ProductForm({ onSubmit, initialValues = {}, submitText = 'Submit', categories = [] }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [vendorCategoryId, setVendorCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [picking, setPicking] = useState(false);

  useEffect(() => {
   // alert(JSON.stringify(initialValues.image));
    setName(initialValues.name || '');
    setPrice(String(initialValues.price || ''));
    setDescription(initialValues.description || '');
    setVendorCategoryId(initialValues.vendor_category_id || '');
    setStock(String(initialValues.stock || ''));
    if (initialValues.image) {
      setImage({ uri: initialValues.image.uri, name: 'product.jpg', type: 'image/jpeg', isInitial: true });
    } else {
      setImage(null);
    }
    setError('');
  }, [initialValues]);

  const handleSubmit = () => {
    if (!name || !price) {
      setError('Name and price are required.');
      return;
    }
    if (!image || !image.uri) {
      setError('Product image is required.');
      return;
    }
    setError('');
    onSubmit({
      name,
      price,
      description,
      vendor_category_id: vendorCategoryId || null,
      stock,
      image,
    });
  };

  // Use the same pickImage logic as registration
  const pickImage = async () => {
    setImageError('');
    setPicking(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setImageError('Permission to access media library is required!');
        Alert.alert('Permission required', 'Please allow access to your photos to select a product image.');
        setPicking(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImage({
          uri: asset.uri,
          name: asset.fileName || `product_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
      }
    } catch (err) {
      setImageError('Failed to pick image.');
    } finally {
      setPicking(false);
    }
  };

  const selectedCategory = categories.find((cat) => cat.id === vendorCategoryId);

  return (
    <View className="bg-white rounded-2xl  shadow-lg p-6 w-full max-w-xl mx-auto">
      <Text className="text-xl font-bold text-primary mb-4">Product Details</Text>
      {error ? <Text className="text-red-500 mb-2 text-center">{error}</Text> : null}
      <View className="mb-4">
        <Text className="mb-1 text-base font-semibold text-gray-700">Name <Text className="text-red-500">*</Text></Text>
        <TextInput placeholder="Product name" value={name} onChangeText={setName} className="border border-gray-300 p-3 rounded-lg bg-gray-50" />
      </View>
      <View className="mb-4">
        <Text className="mb-1 text-base font-semibold text-gray-700">Price <Text className="text-red-500">*</Text></Text>
        <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" className="border border-gray-300 p-3 rounded-lg bg-gray-50" />
      </View>
      <View className="mb-4">
        <Text className="mb-1 text-base font-semibold text-gray-700">Description</Text>
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} className="border border-gray-300 p-3 rounded-lg bg-gray-50" multiline numberOfLines={3} />
      </View>
      <View className="mb-4">
        <Text className="mb-1 text-base font-semibold text-gray-700">Category</Text>
        <Pressable
          onPress={() => setCategoryModal(true)}
          className={`border rounded-lg p-3 flex-row items-center justify-between ${vendorCategoryId ? 'border-primary' : 'border-gray-300'} bg-gray-50`}
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
      </View>
      <View className="mb-4">
        <Text className="mb-1 text-base font-semibold text-gray-700">Stock</Text>
        <TextInput placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" className="border border-gray-300 p-3 rounded-lg bg-gray-50" />
      </View>
      {/* Product Image Picker */}
      <View className="items-center mb-2">
        <TouchableOpacity
          onPress={pickImage}
          className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-green-400 items-center justify-center mb-2"
          activeOpacity={0.7}
        >
          {image && image.uri ? (
            <Image
              source={{ uri: image.uri }}
              style={{ width: 96, height: 96, borderRadius: 48 }}
            />
          ) : picking ? (
            <ActivityIndicator color="#22c55e" />
          ) : (
            <Ionicons name="camera" size={36} color="#22c55e" />
          )}
        </TouchableOpacity>
        <Text className="text-primary font-semibold mt-1">Pick Product Image</Text>
        {imageError ? <Text className="text-red-500 text-xs mt-1">{imageError}</Text> : null}
      </View>
      <Pressable onPress={handleSubmit} className="bg-primary py-4 rounded-xl mt-2">
        <Text className="text-white text-center text-lg font-bold">{submitText}</Text>
      </Pressable>
    </View>
  );
}


