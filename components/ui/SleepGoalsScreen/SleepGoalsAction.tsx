import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemedButton } from '@/components/ui';
import { DesignTokens } from '@/constants/Colors';
import { TRANSLATIONS } from './messages';
import { SleepGoalsActionProps } from './types';

export default function SleepGoalsAction({
  language,
  onContinue
}: SleepGoalsActionProps) {
  const t = TRANSLATIONS[language];

  return (
    <Animated.View entering={FadeIn.delay(600)} style={styles.buttonContainer}>
      <ThemedButton
        title={t.continue}
        variant="primary"
        size="large"
        fullWidth
        onPress={onContinue}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.md,
  },
});