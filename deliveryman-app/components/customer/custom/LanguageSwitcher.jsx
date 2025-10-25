import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, changeLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    changeLanguage(newLanguage);
  };

  return (
    <Pressable
      onPress={toggleLanguage}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Ionicons 
              name={language === 'ar' ? 'language' : 'language-outline'} 
              size={20} 
              color="#3b82f6" 
            />
          </View>
          <View>
            <Text className="text-gray-900 font-medium text-base">
              {t('profile.language')}
            </Text>
            <Text className="text-gray-500 text-sm">
              {language === 'en' ? 'English' : 'العربية'}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-500 text-sm mr-2">
            {language === 'en' ? 'العربية' : 'English'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </View>
    </Pressable>
  );
}
