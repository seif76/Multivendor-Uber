import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View, Modal, ScrollView } from 'react-native';

export default function AddProductForm({ onSubmit, categories = [], submitText = 'Add Product' }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [vendorCategoryId, setVendorCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [categoryModal, setCategoryModal] = useState(false);

  const handleSubmit = () => {
    const data = {
      name,
      price,
      description,
      vendor_category_id: vendorCategoryId || null,
      stock,
      image,
    };

    if (!name || !price) {
      Alert.alert('Validation', 'Name and price are required');
      return;
    }

    onSubmit(data);
    setName('');
    setPrice('');
    setDescription('');
    setVendorCategoryId('');
    setStock('');
    setImage('');
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
        <Text className={`text-base ${vendorCategoryId ? 'text-primary' : 'text-gray-400'}`}>
          {selectedCategory ? selectedCategory.name : 'Select Category'}
        </Text>
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
      <TextInput placeholder="Image URL" value={image} onChangeText={setImage} className="border p-2 rounded" />

      <Pressable onPress={handleSubmit} className="bg-primary py-3 rounded">
        <Text className="text-white text-center font-semibold">{submitText}</Text>
      </Pressable>
    </View>
  );
}
