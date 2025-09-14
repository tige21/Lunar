import React from 'react';
import { StyleSheet, Alert, Switch } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAISettings, useLanguageSettings } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export function AISettings() {
  const { ai, updateAI, toggleAI, clearHistory } = useAISettings();
  const { language, setAILanguage } = useLanguageSettings();
  const colorScheme = useColorScheme();

  const handleClearHistory = () => {
    Alert.alert(
      'Очистить историю чата',
      'Вы уверены, что хотите удалить всю историю разговоров с ИИ-помощником? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              Alert.alert('Успешно', 'История чата очищена');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось очистить историю');
            }
          },
        },
      ]
    );
  };

  const handleStyleChange = (style: 'friendly' | 'professional' | 'scientific') => {
    updateAI({ style }).catch(() => {
      Alert.alert('Ошибка', 'Не удалось изменить стиль общения');
    });
  };

  const handleResponseLengthChange = (length: 'brief' | 'medium' | 'detailed') => {
    updateAI({ responseLength: length }).catch(() => {
      Alert.alert('Ошибка', 'Не удалось изменить детализацию ответов');
    });
  };

  const handleLanguageChange = (aiLanguage: 'ru' | 'en' | 'auto') => {
    setAILanguage(aiLanguage).catch(() => {
      Alert.alert('Ошибка', 'Не удалось изменить язык ИИ');
    });
  };

  const styleOptions = [
    { value: 'friendly' as const, label: 'Дружелюбный', description: 'Теплое и поддерживающее общение' },
    { value: 'professional' as const, label: 'Профессиональный', description: 'Деловой и четкий стиль' },
    { value: 'scientific' as const, label: 'Научный', description: 'Подробные объяснения с фактами' },
  ];

  const lengthOptions = [
    { value: 'brief' as const, label: 'Краткие', description: 'Короткие и по существу' },
    { value: 'medium' as const, label: 'Средние', description: 'Оптимальный баланс' },
    { value: 'detailed' as const, label: 'Подробные', description: 'Развернутые объяснения' },
  ];

  const languageOptions = [
    { value: 'auto' as const, label: 'Автоматически', description: 'По системным настройкам' },
    { value: 'ru' as const, label: 'Русский', description: 'Всегда русский язык' },
    { value: 'en' as const, label: 'English', description: 'Always English' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="brain.head.profile" size={20} color="#8B5CF6" />
        <ThemedText style={styles.title}>Настройки ИИ-помощника</ThemedText>
      </ThemedView>

      {/* AI Enable/Disable */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.toggleContainer}>
          <ThemedView style={styles.toggleContent}>
            <ThemedText style={styles.toggleLabel}>ИИ-помощник</ThemedText>
            <ThemedText style={styles.toggleDescription}>
              {ai.enabled ? 'Включен - получайте персонализированные советы' : 'Отключен - только базовые функции'}
            </ThemedText>
          </ThemedView>
          <Switch
            value={ai.enabled}
            onValueChange={toggleAI}
            trackColor={{ false: Colors[colorScheme].tabIconDefault, true: '#8B5CF6' }}
            thumbColor={ai.enabled ? '#FFFFFF' : Colors[colorScheme].background}
          />
        </ThemedView>
      </ThemedView>

      {ai.enabled && (
        <>
          {/* Language Settings */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Язык общения</ThemedText>
            <ThemedView style={styles.optionsGrid}>
              {languageOptions.map((option) => (
                <ThemedButton
                  key={option.value}
                  variant={language.ai === option.value ? 'solid' : 'outline'}
                  size="sm"
                  onPress={() => handleLanguageChange(option.value)}
                  style={[
                    styles.optionButton,
                    language.ai === option.value && styles.selectedButton,
                  ]}
                >
                  <ThemedText style={[
                    styles.optionLabel,
                    language.ai === option.value && styles.selectedText,
                  ]}>
                    {option.label}
                  </ThemedText>
                </ThemedButton>
              ))}
            </ThemedView>
          </ThemedView>

          {/* Communication Style */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Стиль общения</ThemedText>
            <ThemedView style={styles.options}>
              {styleOptions.map((option) => (
                <ThemedButton
                  key={option.value}
                  variant={ai.style === option.value ? 'solid' : 'outline'}
                  size="md"
                  onPress={() => handleStyleChange(option.value)}
                  style={[
                    styles.optionButton,
                    ai.style === option.value && styles.selectedButton,
                  ]}
                >
                  <ThemedView style={styles.optionContent}>
                    <ThemedView style={styles.optionText}>
                      <ThemedText style={[
                        styles.optionLabel,
                        ai.style === option.value && styles.selectedText,
                      ]}>
                        {option.label}
                      </ThemedText>
                      <ThemedText style={[
                        styles.optionDescription,
                        ai.style === option.value && styles.selectedText,
                      ]}>
                        {option.description}
                      </ThemedText>
                    </ThemedView>
                    {ai.style === option.value && (
                      <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </ThemedView>
                </ThemedButton>
              ))}
            </ThemedView>
          </ThemedView>

          {/* Response Length */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Детализация ответов</ThemedText>
            <ThemedView style={styles.options}>
              {lengthOptions.map((option) => (
                <ThemedButton
                  key={option.value}
                  variant={ai.responseLength === option.value ? 'solid' : 'outline'}
                  size="md"
                  onPress={() => handleResponseLengthChange(option.value)}
                  style={[
                    styles.optionButton,
                    ai.responseLength === option.value && styles.selectedButton,
                  ]}
                >
                  <ThemedView style={styles.optionContent}>
                    <ThemedView style={styles.optionText}>
                      <ThemedText style={[
                        styles.optionLabel,
                        ai.responseLength === option.value && styles.selectedText,
                      ]}>
                        {option.label}
                      </ThemedText>
                      <ThemedText style={[
                        styles.optionDescription,
                        ai.responseLength === option.value && styles.selectedText,
                      ]}>
                        {option.description}
                      </ThemedText>
                    </ThemedView>
                    {ai.responseLength === option.value && (
                      <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </ThemedView>
                </ThemedButton>
              ))}
            </ThemedView>
          </ThemedView>

          {/* Additional Settings */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Дополнительные настройки</ThemedText>

            <ThemedView style={styles.toggleContainer}>
              <ThemedView style={styles.toggleContent}>
                <ThemedText style={styles.toggleLabel}>Персонализированные советы</ThemedText>
                <ThemedText style={styles.toggleDescription}>
                  Учитывать вашу историю сна для более точных рекомендаций
                </ThemedText>
              </ThemedView>
              <Switch
                value={ai.personalizedTips}
                onValueChange={(value) => updateAI({ personalizedTips: value })}
                trackColor={{ false: Colors[colorScheme].tabIconDefault, true: '#8B5CF6' }}
                thumbColor={ai.personalizedTips ? '#FFFFFF' : Colors[colorScheme].background}
              />
            </ThemedView>

            <ThemedView style={styles.toggleContainer}>
              <ThemedView style={styles.toggleContent}>
                <ThemedText style={styles.toggleLabel}>Контекстные ответы</ThemedText>
                <ThemedText style={styles.toggleDescription}>
                  ИИ будет помнить контекст разговора для лучших ответов
                </ThemedText>
              </ThemedView>
              <Switch
                value={ai.contextEnabled}
                onValueChange={(value) => updateAI({ contextEnabled: value })}
                trackColor={{ false: Colors[colorScheme].tabIconDefault, true: '#8B5CF6' }}
                thumbColor={ai.contextEnabled ? '#FFFFFF' : Colors[colorScheme].background}
              />
            </ThemedView>

            <ThemedView style={styles.toggleContainer}>
              <ThemedView style={styles.toggleContent}>
                <ThemedText style={styles.toggleLabel}>Сохранять историю</ThemedText>
                <ThemedText style={styles.toggleDescription}>
                  Сохранение истории чатов на устройстве для анализа
                </ThemedText>
              </ThemedView>
              <Switch
                value={ai.saveHistory}
                onValueChange={(value) => updateAI({ saveHistory: value })}
                trackColor={{ false: Colors[colorScheme].tabIconDefault, true: '#8B5CF6' }}
                thumbColor={ai.saveHistory ? '#FFFFFF' : Colors[colorScheme].background}
              />
            </ThemedView>
          </ThemedView>

          {/* Actions */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Управление данными</ThemedText>
            <ThemedButton
              variant="outline"
              size="md"
              onPress={handleClearHistory}
              style={styles.actionButton}
            >
              <ThemedView style={styles.actionContent}>
                <IconSymbol name="trash" size={16} color="#FF6B6B" />
                <ThemedText style={[styles.actionLabel, { color: '#FF6B6B' }]}>
                  Очистить историю чата
                </ThemedText>
              </ThemedView>
            </ThemedButton>
          </ThemedView>
        </>
      )}
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  toggleContent: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 16,
  },
  options: {
    gap: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: 100,
  },
  selectedButton: {
    backgroundColor: '#8B5CF6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  actionButton: {
    borderColor: '#FF6B6B',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});