import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View, Modal, ScrollView, Alert } from 'react-native';

export default function ProductForm({ onSubmit, initialValues = {}, submitText = 'Submit', categories = [] }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [vendorCategoryId, setVendorCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [categoryModal, setCategoryModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialValues.name || '');
    setPrice(String(initialValues.price || ''));
    setDescription(initialValues.description || '');
    setVendorCategoryId(initialValues.vendor_category_id || '');
    setStock(String(initialValues.stock || ''));
    setImage(initialValues.image || '');
    setError('');
  }, [initialValues]);

  const handleSubmit = () => {
    if (!name || !price) {
      setError('Name and price are required.');
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

  const selectedCategory = categories.find((cat) => cat.id === vendorCategoryId);

  return (
    <View className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl mx-auto">
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
      <View className="mb-6">
        <Text className="mb-1 text-base font-semibold text-gray-700">Image URL</Text>
        <TextInput placeholder="Image URL" value={image} onChangeText={setImage} className="border border-gray-300 p-3 rounded-lg bg-gray-50" />
      </View>
      <Pressable onPress={handleSubmit} className="bg-primary py-4 rounded-xl mt-2">
        <Text className="text-white text-center text-lg font-bold">{submitText}</Text>
      </Pressable>
    </View>
  );
}


