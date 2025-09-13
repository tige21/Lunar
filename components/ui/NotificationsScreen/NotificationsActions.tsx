import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, ThemedButton } from '@/components/ui';
import { NotificationsActionsProps } from './types';
import { TRANSLATIONS } from './messages';

export default function NotificationsActions({
  language,
  isRequesting,
  onEnableNotifications,
  onSkip
}: NotificationsActionsProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  return (
    <ThemedView style={styles.actions}>
      <ThemedButton
        title={isRequesting ? t.requestingButton : t.enableButton}
        variant="primary"
        size="large"
        fullWidth
        loading={isRequesting}
        onPress={onEnableNotifications}
        disabled={isRequesting}
      />

      <ThemedButton
        title={t.skipButton}
        variant="ghost"
        size="large"
        fullWidth
        onPress={onSkip}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
});