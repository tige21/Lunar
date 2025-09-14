import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useLanguageSettings, useSettings } from '@/contexts/SettingsContext';

export function LanguageSettings() {
  const { language, setInterfaceLanguage } = useLanguageSettings();
  const { settings, updateSettings } = useSettings();

  const handleInterfaceLanguageChange = (lang: 'ru' | 'en' | 'auto') => {
    setInterfaceLanguage(lang).catch(() => {
      Alert.alert('Ошибка', 'Не удалось изменить язык интерфейса');
    });
  };

  const handleTimeFormatChange = (format: '12h' | '24h') => {
    updateSettings({
      display: { ...settings.display, timeFormat: format }
    }).catch(() => {
      Alert.alert('Ошибка', 'Не удалось изменить формат времени');
    });
  };

  const interfaceLanguageOptions = [
    {
      value: 'auto' as const,
      label: 'Автоматически',
      description: 'Следует системным настройкам',
      flag: '🌍'
    },
    {
      value: 'ru' as const,
      label: 'Русский',
      description: 'Интерфейс на русском языке',
      flag: '🇷🇺'
    },
    {
      value: 'en' as const,
      label: 'English',
      description: 'Interface in English',
      flag: '🇺🇸'
    },
  ];

  const timeFormatOptions = [
    { value: '24h' as const, label: '24 часа', description: '23:59, 00:00' },
    { value: '12h' as const, label: '12 часов', description: '11:59 PM, 12:00 AM' },
  ];

  const currentTimeFormat = (settings as any).display?.timeFormat || '24h';

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="globe" size={20} color="#8B5CF6" />
        <ThemedText style={styles.title}>Язык и регион</ThemedText>
      </ThemedView>

      <ThemedText style={styles.description}>
        Настройте язык интерфейса и региональные предпочтения
      </ThemedText>

      {/* Interface Language */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Язык интерфейса</ThemedText>
        <ThemedView style={styles.options}>
          {interfaceLanguageOptions.map((option) => (
            <ThemedButton
              key={option.value}
              variant={language.interface === option.value ? 'solid' : 'outline'}
              size="md"
              onPress={() => handleInterfaceLanguageChange(option.value)}
              style={[
                styles.optionButton,
                language.interface === option.value && styles.selectedButton,
              ]}
            >
              <ThemedView style={styles.optionContent}>
                <ThemedText style={styles.flagEmoji}>{option.flag}</ThemedText>
                <ThemedView style={styles.optionText}>
                  <ThemedText style={[
                    styles.optionLabel,
                    language.interface === option.value && styles.selectedText,
                  ]}>
                    {option.label}
                  </ThemedText>
                  <ThemedText style={[
                    styles.optionDescription,
                    language.interface === option.value && styles.selectedText,
                  ]}>
                    {option.description}
                  </ThemedText>
                </ThemedView>
                {language.interface === option.value && (
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                )}
              </ThemedView>
            </ThemedButton>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Time Format */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Формат времени</ThemedText>
        <ThemedView style={styles.options}>
          {timeFormatOptions.map((option) => (
            <ThemedButton
              key={option.value}
              variant={currentTimeFormat === option.value ? 'solid' : 'outline'}
              size="md"
              onPress={() => handleTimeFormatChange(option.value)}
              style={[
                styles.optionButton,
                currentTimeFormat === option.value && styles.selectedButton,
              ]}
            >
              <ThemedView style={styles.optionContent}>
                <ThemedView style={styles.optionText}>
                  <ThemedText style={[
                    styles.optionLabel,
                    currentTimeFormat === option.value && styles.selectedText,
                  ]}>
                    {option.label}
                  </ThemedText>
                  <ThemedText style={[
                    styles.optionDescription,
                    currentTimeFormat === option.value && styles.selectedText,
                  ]}>
                    {option.description}
                  </ThemedText>
                </ThemedView>
                {currentTimeFormat === option.value && (
                  <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                )}
              </ThemedView>
            </ThemedButton>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Current Settings Summary */}
      <ThemedView style={styles.summary}>
        <ThemedText style={styles.summaryTitle}>Текущие настройки</ThemedText>
        <ThemedView style={styles.summaryContent}>
          <ThemedView style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Язык интерфейса:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {language.interface === 'auto' ? 'Автоматически' :
               language.interface === 'ru' ? 'Русский' : 'English'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Язык ИИ:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {language.ai === 'auto' ? 'Автоматически' :
               language.ai === 'ru' ? 'Русский' : 'English'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Формат времени:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {currentTimeFormat === '24h' ? '24 часа' : '12 часов'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Regional Info */}
      <ThemedView style={styles.infoCard}>
        <IconSymbol name="info.circle" size={16} color="#8B5CF6" />
        <ThemedText style={styles.infoText}>
          Смена языка интерфейса может потребовать перезапуска приложения.
          Настройки ИИ изменяются сразу и действуют на новые разговоры.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  options: {
    gap: 8,
  },
  optionButton: {
    padding: 14,
  },
  selectedButton: {
    backgroundColor: '#8B5CF6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 20,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  summary: {
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  summaryContent: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
});