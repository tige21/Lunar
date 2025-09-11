import React, { memo } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { SleepData } from '@/lib/services/sleepService';

interface QuickStatsGridProps {
  sleepData: SleepData;
  delay?: number;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  delay: number;
}

const StatCard = memo(({ title, value, subtitle, icon, onPress, delay }: StatCardProps) => {
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');
  const subtleColor = useThemeColor({ light: '#666666', dark: '#999999' }, 'text');

  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()}
      style={{ flex: 1 }}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={{
          backgroundColor: cardBg,
          borderRadius: 20,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
          marginHorizontal: 4,
        }}
      >
        <IconSymbol name={icon} size={28} />
        <ThemedText 
          type="defaultSemiBold"
          style={{ fontSize: 24, marginTop: 12, marginBottom: 4 }}
        >
          {value}
        </ThemedText>
        <ThemedText style={{ fontSize: 12, color: subtleColor }}>
          {subtitle}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
});

StatCard.displayName = 'StatCard';

const QuickStatsGrid = memo(({ sleepData, delay = 400 }: QuickStatsGridProps) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const stats = [
    {
      title: 'Duration',
      value: formatDuration(sleepData.duration),
      subtitle: 'Total Sleep',
      icon: 'clock',
      onPress: () => router.push('/analytics?tab=duration'),
    },
    {
      title: 'Quality',
      value: `${sleepData.efficiency}%`,
      subtitle: 'Sleep Efficiency',
      icon: 'chart.bar',
      onPress: () => router.push('/analytics?tab=efficiency'),
    }
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          delay={delay + index * 100}
        />
      ))}
    </View>
  );
});

QuickStatsGrid.displayName = 'QuickStatsGrid';

export default QuickStatsGrid;