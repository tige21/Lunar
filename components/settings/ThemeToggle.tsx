import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const colorScheme = useColorScheme();

  const themeOptions = [
    {
      value: 'auto' as const,
      label: 'Автоматически',
      icon: 'gear',
      description: 'Следует системной теме',
    },
    {
      value: 'light' as const,
      label: 'Светлая',
      icon: 'sun.max',
      description: 'Всегда светлая тема',
    },
    {
      value: 'dark' as const,
      label: 'Темная',
      icon: 'moon',
      description: 'Всегда темная тема',
    },
  ];

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    try {
      await setTheme(newTheme);
    } catch (error) {
      Alert.alert(
        'Ошибка',
        'Не удалось изменить тему. Попробуйте еще раз.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="paintbrush" size={20} color="#8B5CF6" />
        <ThemedText style={styles.title}>Тема приложения</ThemedText>
      </ThemedView>

      <ThemedText style={styles.description}>
        Выберите тему оформления приложения
      </ThemedText>

      <ThemedView style={styles.currentTheme}>
        <ThemedText style={styles.currentLabel}>
          Текущая тема: <ThemedText style={styles.currentValue}>
            {colorScheme === 'dark' ? 'Темная' : 'Светлая'}
          </ThemedText>
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.options}>
        {themeOptions.map((option) => (
          <ThemedButton
            key={option.value}
            variant={theme.mode === option.value ? 'solid' : 'outline'}
            size="lg"
            onPress={() => handleThemeChange(option.value)}
            style={[
              styles.optionButton,
              theme.mode === option.value && styles.selectedButton,
            ]}
          >
            <ThemedView style={styles.optionContent}>
              <IconSymbol
                name={option.icon}
                size={20}
                color={theme.mode === option.value ? '#FFFFFF' : '#8B5CF6'}
              />
              <ThemedView style={styles.optionText}>
                <ThemedText style={[
                  styles.optionLabel,
                  theme.mode === option.value && styles.selectedText,
                ]}>
                  {option.label}
                </ThemedText>
                <ThemedText style={[
                  styles.optionDescription,
                  theme.mode === option.value && styles.selectedText,
                ]}>
                  {option.description}
                </ThemedText>
              </ThemedView>
              {theme.mode === option.value && (
                <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
              )}
            </ThemedView>
          </ThemedButton>
        ))}
      </ThemedView>

      <ThemedView style={styles.preview}>
        <ThemedText style={styles.previewTitle}>Предпросмотр</ThemedText>
        <ThemedView style={styles.previewCard}>
          <ThemedText style={styles.previewCardTitle}>🌙 Сон сегодня</ThemedText>
          <ThemedText style={styles.previewCardValue}>7ч 30м</ThemedText>
          <ThemedText style={styles.previewCardSubtext}>Качество: 85%</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
  currentTheme: {
    padding: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  currentLabel: {
    fontSize: 14,
  },
  currentValue: {
    fontWeight: '600',
    color: '#8B5CF6',
  },
  options: {
    gap: 8,
  },
  optionButton: {
    padding: 16,
  },
  selectedButton: {
    backgroundColor: '#8B5CF6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  preview: {
    gap: 8,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  previewCard: {
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
    gap: 4,
  },
  previewCardTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  previewCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  previewCardSubtext: {
    fontSize: 13,
    opacity: 0.7,
  },
});