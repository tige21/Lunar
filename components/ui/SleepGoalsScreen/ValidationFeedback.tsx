import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { BodyText, ThemedView } from '@/components/ui';
import { Colors, DesignTokens } from '@/constants/Colors';
import { ValidationFeedbackProps } from './types';

export default function ValidationFeedback({
  language,
  validation,
  validationAnimatedStyle
}: ValidationFeedbackProps) {
  return (
    <Animated.View style={validationAnimatedStyle}>
      <ThemedView
        style={[
          styles.validationCard,
          {
            backgroundColor: validation.valid ? Colors.semantic.successLight : Colors.semantic.warningLight,
            borderColor: validation.valid ? Colors.semantic.success : Colors.semantic.warning,
          }
        ]}
      >
        <BodyText
          style={[
            styles.validationText,
            { color: validation.valid ? Colors.semantic.success : Colors.semantic.warning }
          ]}
        >
          {validation.valid ? '✅ ' : '⚠️ '}{validation.message}
        </BodyText>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  validationCard: {
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.lg,
    borderWidth: 1,
  },
  validationText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: DesignTokens.fontSize.base,
  },
});