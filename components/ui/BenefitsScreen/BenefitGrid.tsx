import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ThemedView } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import BenefitCard from './BenefitCard';
import { BenefitGridProps } from './types';

export default function BenefitGrid({ language, contentOpacity }: BenefitGridProps) {
  const primaryColor = useThemeColor({}, 'tint');

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const benefits = [
    {
      icon: '🎁',
      titleKey: 'benefit1Title',
      descKey: 'benefit1Desc',
      color: Colors.semantic.success,
    },
    {
      icon: '🔒',
      titleKey: 'benefit2Title',
      descKey: 'benefit2Desc',
      color: primaryColor,
    },
    {
      icon: '🧠',
      titleKey: 'benefit3Title',
      descKey: 'benefit3Desc',
      color: Colors.semantic.info,
    },
    {
      icon: '📊',
      titleKey: 'benefit4Title',
      descKey: 'benefit4Desc',
      color: Colors.sleepStages.rem,
    },
    {
      icon: '🎯',
      titleKey: 'benefit5Title',
      descKey: 'benefit5Desc',
      color: Colors.sleepStages.wake,
    },
    {
      icon: '💡',
      titleKey: 'benefit6Title',
      descKey: 'benefit6Desc',
      color: Colors.semantic.warning,
    },
  ];

  return (
    <Animated.View style={[styles.benefitsGrid, contentAnimatedStyle]}>
      {benefits.map((benefit, index) => (
        <BenefitCard
          key={index}
          language={language}
          icon={benefit.icon}
          titleKey={benefit.titleKey}
          descKey={benefit.descKey}
          color={benefit.color}
          delay={index * 100}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  benefitsGrid: {
    gap: 16,
  },
});