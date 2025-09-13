import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ThemedView, 
  ThemedText, 
  ThemedButton, 
  TitleText,
  BodyText,
  CaptionText 
} from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { RangeSlider, ToggleButton } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { onboardingService } from '@/lib/database/onboardingService';

interface LifestyleScreenProps {
  onNext?: () => void;
}

export default function LifestyleScreen({ onNext }: LifestyleScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');

  const [exerciseFrequency, setExerciseFrequency] = useState<'none' | 'rarely' | 'weekly' | 'several_times_week' | 'daily'>('weekly');
  const [exerciseTime, setExerciseTime] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [screenTime, setScreenTime] = useState(30);
  const [caffeineIntake, setCaffeineIntake] = useState<'none' | 'low' | 'moderate' | 'high'>('moderate');
  const [alcoholIntake, setAlcoholIntake] = useState<'none' | 'rarely' | 'moderate' | 'frequent'>('rarely');
  const [stressLevel, setStressLevel] = useState(3);
  const [workSchedule, setWorkSchedule] = useState<'regular' | 'shift' | 'flexible' | 'irregular'>('regular');
  const [isLoading, setIsLoading] = useState(false);

  const exerciseOptions = [
    { value: 'none', label: 'None' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'several_times_week', label: '2-3x/week' },
    { value: 'daily', label: 'Daily' },
  ] as const;

  const exerciseTimeOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
  ] as const;

  const caffeineOptions = [
    { value: 'none', label: 'None' },
    { value: 'low', label: 'Low (1 cup)' },
    { value: 'moderate', label: 'Moderate (2-3)' },
    { value: 'high', label: 'High (4+)' },
  ] as const;

  const alcoholOptions = [
    { value: 'none', label: 'None' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'frequent', label: 'Frequent' },
  ] as const;

  const workOptions = [
    { value: 'regular', label: '9-5 Regular' },
    { value: 'shift', label: 'Shift Work' },
    { value: 'flexible', label: 'Flexible Hours' },
    { value: 'irregular', label: 'Irregular' },
  ] as const;

  const handleNext = async () => {
    setIsLoading(true);
    
    try {
      await onboardingService.updateExtendedDataSection('lifestyle', {
        exerciseFrequency,
        exerciseTime: exerciseFrequency !== 'none' ? exerciseTime : undefined,
        screenTimeBeforeBed: screenTime,
        caffeineIntake,
        alcoholIntake,
        stressLevel,
        workSchedule,
      });

      onNext?.();
    } catch (error) {
      console.error('Error saving lifestyle data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={[styles.iconContainer, { backgroundColor: tintColor + '20' }]}>
            <IconSymbol name="figure.run" size={32} color={tintColor} />
          </ThemedView>
          
          <TitleText style={styles.title}>
            Lifestyle & Habits
          </TitleText>
          
          <BodyText style={styles.description}>
            Your daily habits affect your sleep quality. Let's understand your lifestyle better.
          </BodyText>
        </ThemedView>

        {/* Exercise */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>🏃‍♀️ Exercise</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>How often do you exercise?</ThemedText>
            <ThemedView style={styles.optionsGrid}>
              {exerciseOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  value={exerciseFrequency === option.value}
                  onChange={(selected) => selected && setExerciseFrequency(option.value)}
                  trueLabel={option.label}
                  falseLabel={option.label}
                  style={styles.optionButton}
                  variant={exerciseFrequency === option.value ? 'primary' : 'outline'}
                />
              ))}
            </ThemedView>
          </ThemedView>

          {exerciseFrequency !== 'none' && (
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>When do you usually exercise?</ThemedText>
              <ThemedView style={styles.optionsRow}>
                {exerciseTimeOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={exerciseTime === option.value}
                    onChange={(selected) => selected && setExerciseTime(option.value)}
                    trueLabel={option.label}
                    falseLabel={option.label}
                    style={styles.flexOption}
                    variant={exerciseTime === option.value ? 'primary' : 'outline'}
                  />
                ))}
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>

        {/* Screen Time */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>📱 Screen Time</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Screen time before bed (minutes)
            </ThemedText>
            <CaptionText style={styles.valueText}>{screenTime} minutes</CaptionText>
            <RangeSlider
              value={screenTime}
              onValueChange={setScreenTime}
              minimumValue={0}
              maximumValue={120}
              step={10}
              style={styles.slider}
            />
          </ThemedView>
        </ThemedView>

        {/* Substances */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>☕ Caffeine & Alcohol</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Daily caffeine intake</ThemedText>
            <ThemedView style={styles.optionsGrid}>
              {caffeineOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  value={caffeineIntake === option.value}
                  onChange={(selected) => selected && setCaffeineIntake(option.value)}
                  trueLabel={option.label}
                  falseLabel={option.label}
                  style={styles.optionButton}
                  variant={caffeineIntake === option.value ? 'primary' : 'outline'}
                />
              ))}
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Alcohol consumption</ThemedText>
            <ThemedView style={styles.optionsGrid}>
              {alcoholOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  value={alcoholIntake === option.value}
                  onChange={(selected) => selected && setAlcoholIntake(option.value)}
                  trueLabel={option.label}
                  falseLabel={option.label}
                  style={styles.optionButton}
                  variant={alcoholIntake === option.value ? 'primary' : 'outline'}
                />
              ))}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Stress & Work */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>💼 Work & Stress</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Current stress level (1-5)
            </ThemedText>
            <CaptionText style={styles.valueText}>
              Level {stressLevel} - {stressLevel <= 2 ? 'Low' : stressLevel <= 3 ? 'Moderate' : stressLevel <= 4 ? 'High' : 'Very High'}
            </CaptionText>
            <RangeSlider
              value={stressLevel}
              onValueChange={setStressLevel}
              minimumValue={1}
              maximumValue={5}
              step={1}
              style={styles.slider}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Work schedule type</ThemedText>
            <ThemedView style={styles.optionsGrid}>
              {workOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  value={workSchedule === option.value}
                  onChange={(selected) => selected && setWorkSchedule(option.value)}
                  trueLabel={option.label}
                  falseLabel={option.label}
                  style={styles.optionButton}
                  variant={workSchedule === option.value ? 'primary' : 'outline'}
                />
              ))}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.spacer} />
      </ScrollView>

      {/* Action Button */}
      <ThemedView style={styles.actions}>
        <ThemedButton
          title={isLoading ? 'Saving...' : 'Continue'}
          variant="primary"
          size="large"
          fullWidth
          loading={isLoading}
          onPress={handleNext}
          disabled={isLoading}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    maxWidth: '90%',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    marginTop: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    minWidth: '40%',
    flex: 1,
  },
  flexOption: {
    flex: 1,
  },
  spacer: {
    height: 40,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
});