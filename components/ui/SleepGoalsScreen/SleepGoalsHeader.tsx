import { BodyText, ThemedView, TitleText } from '@/components/ui';
import { DesignTokens } from '@/constants/Colors';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { TRANSLATIONS } from './messages';
import { SleepGoalsHeaderProps } from './types';

export default function SleepGoalsHeader({
  language,
  progressAnimatedStyle
}: SleepGoalsHeaderProps) {
  const t = TRANSLATIONS[language];

  return (
    <Animated.View entering={SlideInDown.delay(100)} style={progressAnimatedStyle}>
      <ThemedView style={styles.headerSection}>
        <TitleText style={styles.title}>
          {t.title}
        </TitleText>
        <BodyText style={styles.description}>
          {t.description}
        </BodyText>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    alignItems: 'center',
    marginTop: DesignTokens.spacing.xl,
    marginBottom: DesignTokens.spacing.xl,
  },
  title: {
    marginBottom: DesignTokens.spacing.md,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: '90%',
    lineHeight: 24,
  },
});