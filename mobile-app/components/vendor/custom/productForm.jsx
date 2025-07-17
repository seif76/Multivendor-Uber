// import React, { useState } from 'react';
// import { Pressable, Text, TextInput, View } from 'react-native';

// export default function ProductForm({ onSubmit, initialValues = {}, submitText = 'Submit' }) {
//   const [name, setName] = useState(initialValues.name || '');
//   const [price, setPrice] = useState(String(initialValues.price || ''));
//   const [description, setDescription] = useState(initialValues.description || '');
//   const [category, setCategory] = useState(initialValues.category || '');
//   const [stock, setStock] = useState(String(initialValues.stock || ''));
//   const [image, setImage] = useState(initialValues.image || '');

//   return (
//     <View className="gap-4">
//       <TextInput placeholder="Name" value={name} onChangeText={setName} className="border p-2 rounded" />
//       <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" className="border p-2 rounded" />
//       <TextInput placeholder="Description" value={description} onChangeText={setDescription} className="border p-2 rounded" />
//       <TextInput placeholder="Category" value={category} onChangeText={setCategory} className="border p-2 rounded" />
//       <TextInput placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" className="border p-2 rounded" />
//       <TextInput placeholder="Image URL" value={image} onChangeText={setImage} className="border p-2 rounded" />

//       <Pressable onPress={() => {
//         onSubmit({ name, price, description, category, stock, image });
//       }} className="bg-primary py-3 rounded">
//         <Text className="text-white text-center font-semibold">{submitText}</Text>
//       </Pressable>
//     </View>
//   );
// }



import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function ProductForm({ onSubmit, initialValues = {}, submitText = 'Submit' }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  // ✅ Reset form state when initialValues change
  useEffect(() => {
    setName(initialValues.name || '');
    setPrice(String(initialValues.price || ''));
    setDescription(initialValues.description || '');
    setCategory(initialValues.category || '');
    setStock(String(initialValues.stock || ''));
    setImage(initialValues.image || '');
  }, [initialValues]);

  return (
    <View className="gap-4">
      <TextInput placeholder="Name" value={name} onChangeText={setName} className="border p-2 rounded" />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" className="border p-2 rounded" />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} className="border p-2 rounded" />
      <TextInput placeholder="Category" value={category} onChangeText={setCategory} className="border p-2 rounded" />
      <TextInput placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" className="border p-2 rounded" />
      <TextInput placeholder="Image URL" value={image} onChangeText={setImage} className="border p-2 rounded" />

      <Pressable
        onPress={() => {
          onSubmit({ name, price, description, category, stock, image });
        }}
        className="bg-primary py-3 rounded"
      >
        <Text className="text-white text-center font-semibold">{submitText}</Text>
      </Pressable>
    </View>
  );
}


