import { StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedButton } from '@/components/ui';
import { HealthSyncStatus } from '@/components/ui/HealthSyncStatus';
import { onboardingService } from '@/lib/database/onboardingService';
import sleepService from '@/lib/services/sleepService';

export default function SettingsScreen() {
  const handleHealthKitSync = async () => {
    try {
      const data = await sleepService.syncFromHealthKit();
      if (data) {
        Alert.alert(
          'Синхронизация завершена',
          'Данные о сне успешно синхронизированы с приложением Здоровье.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Ошибка синхронизации',
        'Не удалось синхронизировать данные. Проверьте разрешения для приложения Здоровье.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset your onboarding status and allow you to go through the setup process again. Your sleep data and goals will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await onboardingService.resetOnboarding();
              Alert.alert(
                'Onboarding Reset',
                'Onboarding has been reset. Restart the app to go through the setup again.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to reset onboarding. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleViewOnboarding = () => {
    router.push('/onboarding/welcome');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gear"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>
      <ThemedText>Configure your Lunar sleep tracking preferences.</ThemedText>
      
      <Collapsible title="Sleep Tracking">
        <ThemedText>
          Configure how Lunar tracks your sleep patterns and integrates with health data.
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Notifications">
        <ThemedText>
          Set up bedtime reminders, wake-up alarms, and insight notifications.
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Privacy & Data">
        <ThemedText>
          Manage your data privacy settings and export options.
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Health Integration">
        <ThemedText style={styles.sectionDescription}>
          Синхронизируйте данные о сне с приложением Здоровье для более точной аналитики.
        </ThemedText>
        
        {Platform.OS === 'ios' ? (
          <ThemedView style={styles.healthIntegration}>
            <HealthSyncStatus 
              onSyncPress={handleHealthKitSync}
              showDetails={true}
              compact={false}
            />
            
            <ThemedText style={styles.healthNote}>
              💡 При подключении к Apple Health данные о сне будут автоматически синхронизироваться с Apple Watch и другими совместимыми устройствами.
            </ThemedText>
            
            <ThemedView style={styles.healthFeatures}>
              <ThemedText style={styles.featureTitle}>Доступные данные:</ThemedText>
              <ThemedText style={styles.featureItem}>• Время сна и пробуждения</ThemedText>
              <ThemedText style={styles.featureItem}>• Фазы сна (глубокий, REM, легкий)</ThemedText>
              <ThemedText style={styles.featureItem}>• Пульс во время сна</ThemedText>
              <ThemedText style={styles.featureItem}>• Вариабельность пульса (HRV)</ThemedText>
            </ThemedView>
          </ThemedView>
        ) : (
          <ThemedView style={styles.healthIntegration}>
            <ThemedText style={styles.unavailableText}>
              Apple Health доступен только на iOS устройствах.
            </ThemedText>
          </ThemedView>
        )}
      </Collapsible>
      
      <Collapsible title="About">
        <ThemedText>
          Version 1.0.0{'\n'}
          Lunar Sleep Tracker - Your personal sleep analysis companion.
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Developer Tools">
        <ThemedText style={styles.devToolsDescription}>
          Testing and development utilities.
        </ThemedText>
        
        <ThemedView style={styles.devToolsButtons}>
          <ThemedButton
            variant="outline"
            size="md"
            onPress={handleViewOnboarding}
            style={styles.devButton}
          >
            View Onboarding
          </ThemedButton>
          
          <ThemedButton
            variant="outline"
            size="md"
            onPress={handleResetOnboarding}
            style={styles.devButton}
          >
            Reset Onboarding
          </ThemedButton>
          
          <ThemedButton
            variant="outline"
            size="md"
            onPress={() => router.push('/debug/healthkit-test')}
            style={styles.devButton}
          >
            🧪 HealthKit Test
          </ThemedButton>
        </ThemedView>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionDescription: {
    marginBottom: 16,
    opacity: 0.8,
    lineHeight: 20,
  },
  healthIntegration: {
    gap: 16,
  },
  healthNote: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 4,
  },
  healthFeatures: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
    marginBottom: 2,
  },
  unavailableText: {
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
    padding: 20,
  },
  devToolsDescription: {
    marginBottom: 16,
    opacity: 0.7,
  },
  devToolsButtons: {
    gap: 12,
  },
  devButton: {
    marginBottom: 8,
  },
});