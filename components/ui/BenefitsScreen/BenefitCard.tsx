import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ThemedView, ThemedText } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BenefitCardProps } from './types';
import { TRANSLATIONS } from './messages';

export default function BenefitCard({
  language,
  icon,
  titleKey,
  descKey,
  color,
  delay = 0
}: BenefitCardProps) {
  const cardBackground = useThemeColor({}, 'surface');
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const title = t[titleKey as keyof typeof t] as string;
  const description = t[descKey as keyof typeof t] as string;

  return (
    <Animated.View style={[styles.benefitCard, { backgroundColor: cardBackground }, animatedStyle]}>
      <ThemedView style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <ThemedText style={[styles.icon, { color }]}>
          {icon}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.cardContent}>
        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
          {title}
        </ThemedText>
        <ThemedText type="body" style={styles.cardDescription}>
          {description}
        </ThemedText>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  benefitCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});