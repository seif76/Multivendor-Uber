import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';

// Import translation files
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [translations, setTranslations] = useState(enTranslations);

  // Load saved language preference on app start
  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
        updateLanguageSettings(savedLanguage);
      } else {
        // Default to English if no preference is saved
        setLanguage('en');
        updateLanguageSettings('en');
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
      // Fallback to English
      setLanguage('en');
      updateLanguageSettings('en');
    }
  };

  const updateLanguageSettings = (lang) => {
    const isArabic = lang === 'ar';
    
    // Update translations
    setTranslations(isArabic ? arTranslations : enTranslations);
    
    // Update RTL setting
    setIsRTL(isArabic);
    
    // Force RTL layout for Arabic
    I18nManager.forceRTL(isArabic);
    
    // Save language preference
    AsyncStorage.setItem('app_language', lang);
  };

  const changeLanguage = async (newLanguage) => {
    try {
      setLanguage(newLanguage);
      updateLanguageSettings(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Translation function
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found`);
        return key; // Return the key if translation not found
      }
    }
    
    if (typeof value === 'string') {
      // Simple parameter replacement
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }
    
    return value;
  };

  const value = {
    language,
    isRTL,
    translations,
    changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
