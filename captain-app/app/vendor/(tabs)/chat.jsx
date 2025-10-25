import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatList from '../../../components/chat/ChatList';
import ChatScreen from '../../../components/chat/ChatScreen';
import CreateChat from '../../../components/chat/CreateChat';

export default function VendorChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showCreateChat, setShowCreateChat] = useState(false);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const handleCreateChat = (newChat) => {
    setShowCreateChat(false);
    setSelectedChat(newChat);
  };

  if (selectedChat) {
    return <ChatScreen chat={selectedChat} onBack={handleBack} />;
  }

  if (showCreateChat) {
    return (
      <CreateChat
        onChatCreated={handleCreateChat}
        onCancel={() => setShowCreateChat(false)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Messages</Text>
        <Pressable
          onPress={() => setShowCreateChat(true)}
          className="p-2 bg-primary rounded-full"
        >
          <Ionicons name="add" size={20} color="white" />
        </Pressable>
      </View>
      <ChatList onChatSelect={handleChatSelect} />
    </SafeAreaView>
  );
} 