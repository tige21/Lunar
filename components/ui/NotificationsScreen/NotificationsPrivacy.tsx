import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, CaptionText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { NotificationsPrivacyProps } from './types';
import { TRANSLATIONS } from './messages';

export default function NotificationsPrivacy({ language }: NotificationsPrivacyProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  return (
    <ThemedView style={[styles.privacyNote, { backgroundColor: Colors.semantic.successLight }]}>
      <IconSymbol
        name="shield.checkered"
        size={16}
        color={Colors.semantic.success}
      />
      <CaptionText style={[styles.privacyText, { color: Colors.semantic.success }]}>
        {t.privacyNote}
      </CaptionText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
});