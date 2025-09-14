import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, TextInput, Platform, Alert, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeContainer } from '@/components/ui/SafeContainer';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { HealthSyncStatus } from '@/components/ui/HealthSyncStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { onboardingService } from '@/lib/database/onboardingService';
import sleepService from '@/lib/services/sleepService';

import { SettingsCard } from '@/components/settings/SettingsCard';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useSettings } from '@/contexts/SettingsContext';
import { useSettingsScreen, useHapticFeedback } from '@/components/settings/core/SettingsHooks';
import { AI_DEFAULTS, SLEEP_DEFAULTS } from '@/components/settings/core/SettingsConstants';

export default function SettingsScreen() {
  const { settings, updateSettings, error } = useSettings();
  const { triggerHaptic } = useHapticFeedback();
  const {
    searchQuery,
    expandedSections,
    toggleSection,
    setSearchQuery,
  } = useSettingsScreen();

  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');


  // Settings update handlers
  const handleSettingUpdate = async (path: string, value: any) => {
    try {
      const pathParts = path.split('.');
      const updates: any = { ...settings };
      let current: any = updates;

      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]] = { ...current[pathParts[i]] };
      }
      current[pathParts[pathParts.length - 1]] = value;

      await updateSettings(updates);
      triggerHaptic('success');
    } catch {
      triggerHaptic('error');
      Alert.alert('Ошибка', 'Не удалось сохранить настройку');
    }
  };

  const handleHealthKitSync = async () => {
    try {
      triggerHaptic('medium');
      const data = await sleepService.syncFromHealthKit();
      if (data) {
        Alert.alert(
          'Синхронизация завершена',
          'Данные о сне успешно синхронизированы с приложением Здоровье.',
          [{ text: 'OK' }]
        );
        triggerHaptic('success');
      }
    } catch {
      triggerHaptic('error');
      Alert.alert(
        'Ошибка синхронизации',
        'Не удалось синхронизировать данные. Проверьте разрешения для приложения Здоровье.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Сбросить настройки входа',
      'Это сбросит ваш статус настройки и позволит пройти процесс настройки заново. Данные о сне и цели будут сохранены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            try {
              await onboardingService.resetOnboarding();
              triggerHaptic('success');
              Alert.alert(
                'Настройки сброшены',
                'Настройки входа сброшены. Перезапустите приложение для повторной настройки.',
                [{ text: 'OK' }]
              );
            } catch {
              triggerHaptic('error');
              Alert.alert(
                'Ошибка',
                'Не удалось сбросить настройки. Попробуйте еще раз.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // Filtered settings for search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const searchTerms = [
      'тема', 'внешний вид', 'темная', 'светлая',
      'сон', 'отслеживание', 'цель', 'будильник',
      'ии', 'помощник', 'язык', 'персонализация',
      'уведомления', 'напоминания', 'звук',
      'конфиденциальность', 'данные', 'безопасность',
      'здоровье', 'синхронизация', 'apple health'
    ];

    return searchTerms.filter(term => term.includes(query));
  }, [searchQuery]);

  return (
    <SafeContainer>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Similar to Dashboard */}
        <Animated.View entering={FadeInDown.springify()}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerTop}>
              <ThemedView>
                <ThemedText type="title">Настройки ⚙️</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Персонализируйте ваш опыт сна
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Animated.View>

        {/* Search Bar - Redesigned */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedView
            variant="card"
            shadow="soft"
            borderRadius="xl"
            style={styles.searchCard}
          >
            <ThemedView style={styles.searchContainer}>
              <IconSymbol
                name="magnifyingglass"
                size={18}
                color={tintColor}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск настроек..."
                placeholderTextColor={textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearch}
                >
                  <IconSymbol name="xmark.circle.fill" size={16} color={textSecondary} />
                </TouchableOpacity>
              )}
            </ThemedView>
          </ThemedView>
        </Animated.View>

        {/* Error Display */}
        {error && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <ThemedView
              variant="card"
              shadow="soft"
              borderRadius="lg"
              style={[styles.errorContainer, { borderColor: '#FF6B6B20', backgroundColor: '#FF6B6B10' }]}
            >
              <IconSymbol name="exclamationmark.triangle" size={16} color="#FF6B6B" />
              <ThemedText style={[styles.errorText, { color: '#FF6B6B' }]}>{error}</ThemedText>
            </ThemedView>
          </Animated.View>
        )}

        {/* Main Content */}
        {/* Search Results or Main Sections */}
        {searchQuery.trim() ? (
          <ThemedView style={styles.searchResults}>
            <ThemedText style={styles.searchResultsTitle}>
              Результаты поиска для &quot;{searchQuery}&quot;
            </ThemedText>
            {filteredSections?.length ? (
              filteredSections.map(term => (
                <ThemedText key={term} style={styles.searchTerm}>{term}</ThemedText>
              ))
            ) : (
              <ThemedText style={styles.noResults}>Настройки не найдены</ThemedText>
            )}
          </ThemedView>
        ) : (
          <>
            {/* Appearance Section */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <SettingsSection
              id="appearance"
              title="Внешний вид"
              description="Персонализируйте интерфейс приложения"
              icon="paintbrush.fill"
              variant="sleep"
              expanded={expandedSections.has('appearance')}
              onToggleExpand={() => toggleSection('appearance')}
            >
              <SettingsCard
                id="theme"
                title="Тема оформления"
                description="Выберите светлую, темную или автоматическую тему"
                icon="circle.lefthalf.filled"
                type="picker"
                variant="sleep"
                value={settings.theme?.mode || 'auto'}
                options={[
                  { value: 'auto', label: 'Автоматически', description: 'Следует системной теме' },
                  { value: 'light', label: 'Светлая', description: 'Всегда светлая тема' },
                  { value: 'dark', label: 'Темная', description: 'Всегда темная тема' },
                ]}
                onValueChange={(value) => handleSettingUpdate('theme.mode', value)}
              />

              <SettingsCard
                id="fontSize"
                title="Размер шрифта"
                description="Настройте размер текста для комфортного чтения"
                icon="textformat.size"
                type="picker"
                variant="sleep"
                value={settings.display?.fontSize || 'medium'}
                options={[
                  { value: 'small', label: 'Маленький', description: 'Компактный текст' },
                  { value: 'medium', label: 'Средний', description: 'Стандартный размер' },
                  { value: 'large', label: 'Большой', description: 'Увеличенный текст' },
                ]}
                onValueChange={(value) => handleSettingUpdate('display.fontSize', value)}
              />

              <SettingsCard
                id="animations"
                title="Анимации"
                description="Включить плавные переходы и эффекты"
                icon="sparkles"
                type="toggle"
                variant="sleep"
                value={!settings.display?.reduceAnimations}
                onValueChange={(value) => handleSettingUpdate('display.reduceAnimations', !value)}
              />
            </SettingsSection>
            </Animated.View>

            {/* Sleep Tracking Section */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
            <SettingsSection
              id="sleep"
              title="Сон и отслеживание"
              description="Настройте цели сна и отслеживание"
              icon="moon.fill"
              variant="sleep"
              expanded={expandedSections.has('sleep')}
              onToggleExpand={() => toggleSection('sleep')}
            >
              <SettingsCard
                id="sleepGoal"
                title="Цель сна"
                description="Рекомендуемая продолжительность сна"
                icon="target"
                type="slider"
                variant="sleep"
                value={settings.sleepTracking?.sleepGoal || SLEEP_DEFAULTS.sleepGoalHours}
                range={SLEEP_DEFAULTS.sleepGoalRange}
                unit="ч"
                onValueChange={(value) => handleSettingUpdate('sleepTracking.sleepGoal', value)}
              />

              <SettingsCard
                id="autoDetection"
                title="Автоматическое отслеживание"
                description="Автоматически определять начало и конец сна"
                icon="waveform.path.ecg"
                type="toggle"
                variant="sleep"
                value={settings.sleepTracking?.autoDetection ?? true}
                onValueChange={(value) => handleSettingUpdate('sleepTracking.autoDetection', value)}
              />

              <SettingsCard
                id="sensitivity"
                title="Чувствительность детекции"
                description="Настройте точность автоматического отслеживания"
                icon="dial.max"
                type="picker"
                variant="sleep"
                value={settings.sleepTracking?.sensitivity || 'medium'}
                options={[
                  { value: 'low', label: 'Низкая', description: 'Для спокойного сна' },
                  { value: 'medium', label: 'Средняя', description: 'Оптимальный баланс' },
                  { value: 'high', label: 'Высокая', description: 'Для чуткого сна' },
                ]}
                onValueChange={(value) => handleSettingUpdate('sleepTracking.sensitivity', value)}
              />
            </SettingsSection>
            </Animated.View>

            {/* AI Assistant Section */}
            <Animated.View entering={FadeInDown.delay(500).springify()}>
            <SettingsSection
              id="ai"
              title="ИИ-помощник"
              description="Персонализируйте вашего помощника по сну"
              icon="brain.head.profile"
              variant="ai"
              expanded={expandedSections.has('ai')}
              onToggleExpand={() => toggleSection('ai')}
            >
              <SettingsCard
                id="aiEnabled"
                title="ИИ-помощник"
                description={settings.ai?.enabled ? 'Включен - получайте персонализированные советы' : 'Отключен - только базовые функции'}
                icon="brain.head.profile"
                type="toggle"
                variant="ai"
                value={settings.ai?.enabled ?? true}
                onValueChange={(value) => handleSettingUpdate('ai.enabled', value)}
              />

              {settings.ai?.enabled && (
                <>
                  <SettingsCard
                    id="aiLanguage"
                    title="Язык общения с ИИ"
                    description="Выберите язык для общения с помощником"
                    icon="globe"
                    type="picker"
                    variant="ai"
                    value={settings.language?.ai || 'auto'}
                    options={AI_DEFAULTS.languages}
                    onValueChange={(value) => handleSettingUpdate('language.ai', value)}
                  />

                  <SettingsCard
                    id="aiStyle"
                    title="Стиль общения"
                    description="Выберите тон и манеру общения ИИ"
                    icon="theatermasks"
                    type="picker"
                    variant="ai"
                    value={settings.ai?.style || 'friendly'}
                    options={AI_DEFAULTS.responseStyles}
                    onValueChange={(value) => handleSettingUpdate('ai.style', value)}
                  />

                  <SettingsCard
                    id="responseLength"
                    title="Детализация ответов"
                    description="Выберите объем получаемой информации"
                    icon="text.alignleft"
                    type="picker"
                    variant="ai"
                    value={settings.ai?.responseLength || 'medium'}
                    options={AI_DEFAULTS.responseLengths}
                    onValueChange={(value) => handleSettingUpdate('ai.responseLength', value)}
                  />

                  <SettingsCard
                    id="personalizedTips"
                    title="Персонализированные советы"
                    description="Учитывать вашу историю сна для рекомендаций"
                    icon="person.crop.circle.badge.checkmark"
                    type="toggle"
                    variant="ai"
                    value={settings.ai?.personalizedTips ?? true}
                    onValueChange={(value) => handleSettingUpdate('ai.personalizedTips', value)}
                  />
                </>
              )}
            </SettingsSection>
            </Animated.View>

            {/* Notifications Section */}
            <Animated.View entering={FadeInDown.delay(600).springify()}>
            <SettingsSection
              id="notifications"
              title="Уведомления"
              description="Управляйте напоминаниями о сне"
              icon="bell.fill"
              variant="default"
              expanded={expandedSections.has('notifications')}
              onToggleExpand={() => toggleSection('notifications')}
            >
              <SettingsCard
                id="bedtimeReminders"
                title="Напоминания о сне"
                description="Напоминать о времени ложиться спать"
                icon="bed.double"
                type="toggle"
                value={settings.notifications?.bedtimeReminders ?? true}
                onValueChange={(value) => handleSettingUpdate('notifications.bedtimeReminders', value)}
              />

              <SettingsCard
                id="sleepInsights"
                title="Инсайты о сне"
                description="Получать анализ качества сна"
                icon="chart.line.uptrend.xyaxis"
                type="toggle"
                value={settings.notifications?.sleepInsights ?? true}
                onValueChange={(value) => handleSettingUpdate('notifications.sleepInsights', value)}
              />
            </SettingsSection>

            </Animated.View>

            {/* Health Integration Section */}
            <Animated.View entering={FadeInDown.delay(700).springify()}>
            <SettingsSection
              id="health"
              title="Интеграция со здоровьем"
              description="Синхронизация с приложениями здоровья"
              icon="heart.fill"
              variant="default"
              expanded={expandedSections.has('health')}
              onToggleExpand={() => toggleSection('health')}
            >
              <SettingsCard
                id="healthSync"
                title="Синхронизация с Apple Health"
                description="Автоматически синхронизировать данные о сне"
                icon="heart.text.square"
                type="info"
                variant="default"
              >
                {Platform.OS === 'ios' ? (
                  <HealthSyncStatus
                    onSyncPress={handleHealthKitSync}
                    showDetails={true}
                    compact={false}
                  />
                ) : (
                  <ThemedView style={styles.healthUnavailable}>
                    <ThemedText style={styles.unavailableText}>
                      Apple Health доступен только на iOS устройствах
                    </ThemedText>
                  </ThemedView>
                )}
              </SettingsCard>
            </SettingsSection>

            </Animated.View>

            {/* About Section */}
            <Animated.View entering={FadeInDown.delay(800).springify()}>
            <SettingsSection
              id="about"
              title="О приложении"
              description="Информация о версии и статистика"
              icon="info.circle"
              variant="default"
              expanded={expandedSections.has('about')}
              onToggleExpand={() => toggleSection('about')}
            >
              <SettingsCard
                id="version"
                title="Lunar Sleep Tracker"
                description="Версия 1.0.0 - Ваш персональный ИИ-помощник для сна"
                icon="app.badge"
                type="info"
              />

              <SettingsCard
                id="stats"
                title="Статистика настроек"
                description={`Тема: ${settings.theme?.mode || 'auto'} • ИИ: ${settings.ai?.enabled ? 'вкл' : 'выкл'} • Язык: ${settings.language?.interface || 'auto'}`}
                icon="chart.bar"
                type="info"
              />
            </SettingsSection>
            </Animated.View>

            {/* Developer Tools Section */}
            {__DEV__ && (
              <Animated.View entering={FadeInDown.delay(900).springify()}>
              <SettingsSection
                id="developer"
                title="Инструменты разработчика"
                description="Утилиты для тестирования и разработки"
                icon="wrench.and.screwdriver"
                variant="default"
                expanded={expandedSections.has('developer')}
                onToggleExpand={() => toggleSection('developer')}
              >
                <SettingsCard
                  id="resetOnboarding"
                  title="Сбросить настройки входа"
                  description="Пройти процесс первоначальной настройки заново"
                  icon="arrow.clockwise"
                  type="button"
                  onPress={handleResetOnboarding}
                />
              </SettingsSection>
              </Animated.View>
            )}
          </>
        )}
        <ThemedView style={styles.bottomPadding} />
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  headerContent: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'inherit',
  },
  clearSearch: {
    padding: 4,
    borderRadius: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  searchResults: {
    padding: 16,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchTerm: {
    fontSize: 14,
    padding: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 6,
    marginBottom: 4,
  },
  noResults: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 24,
  },
  bottomPadding: {
    height: 32,
    backgroundColor: 'transparent',
  },
  healthUnavailable: {
    padding: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: 8,
    marginTop: 8,
  },
  unavailableText: {
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
  },
});