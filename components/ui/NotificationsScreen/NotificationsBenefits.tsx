import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, ThemedText, CaptionText } from '@/components/ui';
import { NotificationsBenefitsProps } from './types';
import { TRANSLATIONS } from './messages';

export default function NotificationsBenefits({ language, surfaceColor }: NotificationsBenefitsProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const benefits = [
    {
      emoji: '🌙',
      title: t.benefit1Title,
      description: t.benefit1Desc
    },
    {
      emoji: '☀️',
      title: t.benefit2Title,
      description: t.benefit2Desc
    },
    {
      emoji: '💡',
      title: t.benefit3Title,
      description: t.benefit3Desc
    }
  ];

  return (
    <ThemedView style={styles.benefits}>
      <ThemedView style={[styles.benefitCard, { backgroundColor: surfaceColor }]}>
        {benefits.map((benefit, index) => (
          <ThemedView key={index} style={styles.benefitRow}>
            <ThemedText style={styles.benefitEmoji}>{benefit.emoji}</ThemedText>
            <ThemedView style={styles.benefitText}>
              <ThemedText style={styles.benefitTitle}>{benefit.title}</ThemedText>
              <CaptionText style={styles.benefitDescription}>
                {benefit.description}
              </CaptionText>
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  benefits: {
    marginBottom: 32,
  },
  benefitCard: {
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitEmoji: {
    fontSize: 24,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDescription: {
    opacity: 0.7,
    lineHeight: 16,
  },
});