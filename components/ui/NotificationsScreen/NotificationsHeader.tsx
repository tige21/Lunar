import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, TitleText, BodyText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { NotificationsHeaderProps } from './types';
import { TRANSLATIONS } from './messages';

export default function NotificationsHeader({ language, tintColor }: NotificationsHeaderProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  return (
    <ThemedView style={styles.header}>
      <ThemedView style={[styles.iconContainer, { backgroundColor: tintColor + '20' }]}>
        <IconSymbol
          name="bell.badge.fill"
          size={32}
          color={tintColor}
        />
      </ThemedView>

      <TitleText style={styles.title}>
        {t.title}
      </TitleText>

      <BodyText style={styles.description}>
        {t.description}
      </BodyText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
});