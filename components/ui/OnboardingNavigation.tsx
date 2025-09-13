import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';

const { width } = Dimensions.get('window');

export interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onSkip?: () => void;
  canGoBack?: boolean;
  canSkip?: boolean;
  skipText?: string;
  backText?: string;
  style?: any;
}

export function OnboardingNavigation({
  currentStep,
  totalSteps,
  onBack,
  onSkip,
  canGoBack = true,
  canSkip = true,
  skipText = 'Skip',
  backText = 'Back',
  style,
}: OnboardingNavigationProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (onSkip) {
      onSkip();
    }
  };

  // Don't show back on first screen
  const showBack = canGoBack && currentStep > 1;
  // Don't show skip on last screen
  const showSkip = canSkip && currentStep < totalSteps;

  return (
    <ThemedView style={[styles.container, style]}>
      <ThemedView style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="chevron.left"
              size={20}
              color={primaryColor}
              style={styles.backIcon}
            />
            <ThemedText
              type="body"
              style={[styles.navText, { color: primaryColor }]}
            >
              {backText}
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={styles.centerSection}>
        <ThemedText type="caption" style={[styles.stepIndicator, { color: mutedColor }]}>
          {currentStep} of {totalSteps}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.rightSection}>
        {showSkip && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleSkip}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <ThemedText
              type="body"
              style={[styles.navText, { color: mutedColor }]}
            >
              {skipText}
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    minWidth: 80,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 80,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 72,
  },
  backIcon: {
    marginRight: 8,
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
});

export default OnboardingNavigation;