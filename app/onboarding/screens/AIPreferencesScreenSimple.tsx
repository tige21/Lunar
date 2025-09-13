import {
  BodyText,
  CaptionText,
  ThemedText,
  ThemedView,
  TitleText
} from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { onboardingService } from '@/lib/database/onboardingService';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface AIPreferencesScreenProps {
  onNext?: () => void;
}

export default function AIPreferencesScreenSimple({ onNext }: AIPreferencesScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

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

  const SimpleButton = ({ title, selected, onPress, description }: { 
    title: string; 
    selected: boolean; 
    onPress: () => void;
    description?: string;
  }) => (
    <ThemedView style={styles.optionCard}>
      <TouchableOpacity
        style={[
          styles.optionButton,
          {
            backgroundColor: selected ? tintColor : 'transparent',
            borderColor: tintColor,
            borderWidth: 1,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <ThemedText style={[styles.optionText, { color: selected ? '#FFFFFF' : textColor }]}>
          {title}
        </ThemedText>
      </TouchableOpacity>
      {description && (
        <CaptionText style={styles.optionDescription}>{description}</CaptionText>
      )}
    </ThemedView>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
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
          
          <ThemedView style={styles.optionsContainer}>
            {responseLengthOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={responseLength === option.value}
                onPress={() => setResponseLength(option.value)}
                description={option.description}
              />
            ))}
          </ThemedView>
        </ThemedView>

        {/* Technical Depth */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>🔬 Technical Depth</ThemedText>
          <ThemedText style={styles.sectionDescription}>How scientific should explanations be?</ThemedText>
          
          <ThemedView style={styles.optionsContainer}>
            {technicalDepthOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={technicalDepth === option.value}
                onPress={() => setTechnicalDepth(option.value)}
                description={option.description}
              />
            ))}
          </ThemedView>
        </ThemedView>

        {/* Motivational Tone */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>💪 Motivational Style</ThemedText>
          <ThemedText style={styles.sectionDescription}>What type of encouragement works best for you?</ThemedText>
          
          <ThemedView style={styles.optionsContainer}>
            {motivationalToneOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={motivationalTone === option.value}
                onPress={() => setMotivationalTone(option.value)}
                description={option.description}
              />
            ))}
          </ThemedView>
        </ThemedView>

        {/* Reminder Frequency */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>🔔 Reminders</ThemedText>
          <ThemedText style={styles.sectionDescription}>How often should the AI check in with you?</ThemedText>
          
          <ThemedView style={styles.gridContainer}>
            {reminderOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={reminderFrequency === option.value}
                onPress={() => setReminderFrequency(option.value)}
                description={option.description}
              />
            ))}
          </ThemedView>
        </ThemedView>

        {/* Feedback Timing */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>📊 Feedback Timing</ThemedText>
          <ThemedText style={styles.sectionDescription}>When would you like to receive insights?</ThemedText>
          
          <ThemedView style={styles.gridContainer}>
            {feedbackOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={feedbackPreference === option.value}
                onPress={() => setFeedbackPreference(option.value)}
                description={option.description}
              />
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.spacer} />

      {/* Action Button */}
      <ThemedView style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { 
              backgroundColor: isLoading ? tintColor + '60' : tintColor,
              opacity: isLoading ? 0.6 : 1,
            }
          ]}
          onPress={handleNext}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.continueButtonText}>
            {isLoading ? 'Saving...' : 'Continue'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  optionsContainer: {
    gap: 12,
  },
  gridContainer: {
    gap: 12,
  },
  optionCard: {
    alignItems: 'center',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  spacer: {
    height: 40,
  },
  actions: {
    paddingBottom: 40,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});