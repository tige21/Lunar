/**
 * Language Switcher Component
 * Simple UI component for switching between Russian and English
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { SupportedLanguage } from '@/lib/languageDetection';

export interface LanguageSwitcherProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
  style?: any;
}

export function LanguageSwitcher({ 
  currentLanguage, 
  onLanguageChange, 
  disabled = false,
  style 
}: LanguageSwitcherProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const handlePress = (language: SupportedLanguage) => {
    if (!disabled && language !== currentLanguage) {
      onLanguageChange(language);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          currentLanguage === 'en' && styles.activeButton,
          currentLanguage === 'en' && { backgroundColor: tintColor + '20', borderColor: tintColor },
          { borderColor: textColor + '20' }
        ]}
        onPress={() => handlePress('en')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <ThemedText 
          style={[
            styles.languageText,
            currentLanguage === 'en' && { color: tintColor, fontWeight: '600' }
          ]}
        >
          EN
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.languageButton,
          currentLanguage === 'ru' && styles.activeButton,
          currentLanguage === 'ru' && { backgroundColor: tintColor + '20', borderColor: tintColor },
          { borderColor: textColor + '20' }
        ]}
        onPress={() => handlePress('ru')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <ThemedText 
          style={[
            styles.languageText,
            currentLanguage === 'ru' && { color: tintColor, fontWeight: '600' }
          ]}
        >
          РУ
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    // Active styles are applied dynamically
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LanguageSwitcher;