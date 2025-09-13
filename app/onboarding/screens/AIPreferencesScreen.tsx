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
import { ToggleButton } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { onboardingService } from '@/lib/database/onboardingService';

interface AIPreferencesScreenProps {
  onNext?: () => void;
}

export default function AIPreferencesScreen({ onNext }: AIPreferencesScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');

  const [responseLength, setResponseLength] = useState<'brief' | 'medium' | 'detailed'>('medium');
  const [technicalDepth, setTechnicalDepth] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [motivationalTone, setMotivationalTone] = useState<'gentle' | 'encouraging' | 'challenging' | 'scientific'>('encouraging');
  const [reminderFrequency, setReminderFrequency] = useState<'none' | 'weekly' | 'daily'>('daily');
  const [feedbackPreference, setFeedbackPreference] = useState<'immediate' | 'daily' | 'weekly'>('daily');
  const [isLoading, setIsLoading] = useState(false);

  const responseLengthOptions = [
    { value: 'brief', label: 'Brief', description: 'Short, to-the-point answers' },
    { value: 'medium', label: 'Medium', description: 'Balanced explanations' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive responses' },
  ] as const;

  const technicalDepthOptions = [
    { value: 'basic', label: 'Basic', description: 'Simple, easy to understand' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some technical details' },
    { value: 'advanced', label: 'Advanced', description: 'Scientific explanations' },
  ] as const;

  const motivationalToneOptions = [
    { value: 'gentle', label: 'Gentle', description: 'Soft, supportive approach' },
    { value: 'encouraging', label: 'Encouraging', description: 'Positive motivation' },
    { value: 'challenging', label: 'Challenging', description: 'Goal-oriented push' },
    { value: 'scientific', label: 'Scientific', description: 'Fact-based approach' },
  ] as const;

  const reminderOptions = [
    { value: 'none', label: 'None', description: 'No reminders' },
    { value: 'weekly', label: 'Weekly', description: 'Once per week' },
    { value: 'daily', label: 'Daily', description: 'Every day' },
  ] as const;

  const feedbackOptions = [
    { value: 'immediate', label: 'Immediate', description: 'Right after tracking' },
    { value: 'daily', label: 'Daily', description: 'Once per day' },
    { value: 'weekly', label: 'Weekly', description: 'Weekly summary' },
  ] as const;

  const handleNext = async () => {
    setIsLoading(true);
    
    try {
      await onboardingService.updateExtendedDataSection('aiPreferences', {
        responseLength,
        technicalDepth,
        motivationalTone,
        reminderFrequency,
        feedbackPreference,
      });

      onNext?.();
    } catch (error) {
      console.error('Error saving AI preferences:', error);
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
            <IconSymbol name="brain.head.profile" size={32} color={tintColor} />
          </ThemedView>
          
          <TitleText style={styles.title}>
            AI Preferences
          </TitleText>
          
          <BodyText style={styles.description}>
            Customize how your AI sleep coach communicates with you for the best experience.
          </BodyText>
        </ThemedView>

        {/* Response Length */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>📝 Response Length</ThemedText>
          <ThemedText style={styles.sectionDescription}>How detailed should responses be?</ThemedText>
          
          {responseLengthOptions.map((option) => (
            <ThemedView key={option.value} style={styles.optionCard}>
              <ToggleButton
                value={responseLength === option.value}
                onChange={(selected) => selected && setResponseLength(option.value)}
                trueLabel={option.label}
                falseLabel={option.label}
                style={styles.optionButton}
                variant={responseLength === option.value ? 'primary' : 'outline'}
              />
              <CaptionText style={styles.optionDescription}>{option.description}</CaptionText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Technical Depth */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>🔬 Technical Depth</ThemedText>
          <ThemedText style={styles.sectionDescription}>How scientific should explanations be?</ThemedText>
          
          {technicalDepthOptions.map((option) => (
            <ThemedView key={option.value} style={styles.optionCard}>
              <ToggleButton
                value={technicalDepth === option.value}
                onChange={(selected) => selected && setTechnicalDepth(option.value)}
                trueLabel={option.label}
                falseLabel={option.label}
                style={styles.optionButton}
                variant={technicalDepth === option.value ? 'primary' : 'outline'}
              />
              <CaptionText style={styles.optionDescription}>{option.description}</CaptionText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Motivational Tone */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>💪 Motivational Style</ThemedText>
          <ThemedText style={styles.sectionDescription}>What type of encouragement works best for you?</ThemedText>
          
          {motivationalToneOptions.map((option) => (
            <ThemedView key={option.value} style={styles.optionCard}>
              <ToggleButton
                value={motivationalTone === option.value}
                onChange={(selected) => selected && setMotivationalTone(option.value)}
                trueLabel={option.label}
                falseLabel={option.label}
                style={styles.optionButton}
                variant={motivationalTone === option.value ? 'primary' : 'outline'}
              />
              <CaptionText style={styles.optionDescription}>{option.description}</CaptionText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Reminder Frequency */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>🔔 Reminders</ThemedText>
          <ThemedText style={styles.sectionDescription}>How often should the AI check in with you?</ThemedText>
          
          <ThemedView style={styles.optionsGrid}>
            {reminderOptions.map((option) => (
              <ThemedView key={option.value} style={styles.optionCard}>
                <ToggleButton
                  value={reminderFrequency === option.value}
                  onChange={(selected) => selected && setReminderFrequency(option.value)}
                  trueLabel={option.label}
                  falseLabel={option.label}
                  style={styles.gridOptionButton}
                  variant={reminderFrequency === option.value ? 'primary' : 'outline'}
                />
                <CaptionText style={styles.optionDescription}>{option.description}</CaptionText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Feedback Timing */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>📊 Feedback Timing</ThemedText>
          <ThemedText style={styles.sectionDescription}>When would you like to receive insights?</ThemedText>
          
          <ThemedView style={styles.optionsGrid}>
            {feedbackOptions.map((option) => (
              <ThemedView key={option.value} style={styles.optionCard}>
                <ToggleButton
                  value={feedbackPreference === option.value}
                  onChange={(selected) => selected && setFeedbackPreference(option.value)}
                  trueLabel={option.label}
                  falseLabel={option.label}
                  style={styles.gridOptionButton}
                  variant={feedbackPreference === option.value ? 'primary' : 'outline'}
                />
                <CaptionText style={styles.optionDescription}>{option.description}</CaptionText>
              </ThemedView>
            ))}
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  optionCard: {
    marginBottom: 12,
    alignItems: 'center',
  },
  optionButton: {
    width: '100%',
    marginBottom: 4,
  },
  gridOptionButton: {
    width: '100%',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  optionsGrid: {
    gap: 12,
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