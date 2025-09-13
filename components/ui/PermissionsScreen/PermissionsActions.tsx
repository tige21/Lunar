import { CaptionText, ThemedButton } from '@/components/ui';
import { DesignTokens } from '@/constants/Colors';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { PermissionsScreenMessages } from './types';

interface PermissionsActionsProps {
  messages: PermissionsScreenMessages;
  isLoading: boolean;
  onGrantAccess: () => void;
  onContinueWithout: () => void;
}

export const PermissionsActions: React.FC<PermissionsActionsProps> = ({
  messages,
  isLoading,
  onGrantAccess,
  onContinueWithout
}) => {
  return (
    <Animated.View
      entering={SlideInDown.delay(800).duration(500)}
      style={styles.actionButtons}
    >
      <ThemedButton
        title={isLoading ? messages.actions.requesting : messages.actions.grantAccess}
        variant="primary"
        size="large"
        fullWidth
        loading={isLoading}
        onPress={onGrantAccess}
        style={styles.primaryButton}
      />

      <Pressable
        style={styles.skipButton}
        onPress={onContinueWithout}
      >
        <CaptionText style={styles.skipText}>
          {messages.actions.continueWithout}
        </CaptionText>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },
  primaryButton: {
    marginBottom: DesignTokens.spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.sm,
  },
  skipText: {
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
});