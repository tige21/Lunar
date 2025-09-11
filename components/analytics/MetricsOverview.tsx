import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { MetricsCard } from '@/components/ui/MetricsCard';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AnalyticsData {
  sleepScores: { date: string; value: number }[];
  sleepEfficiency: { date: string; value: number }[];
  sleepDuration: { date: string; value: number }[];
  consistencyScore: number;
  sleepQualityTrend: 'improving' | 'declining' | 'stable';
  weekdayVsWeekend: {
    weekday: { duration: number; efficiency: number; score: number };
    weekend: { duration: number; efficiency: number; score: number };
  };
}

interface MetricsOverviewProps {
  data: AnalyticsData;
  delay?: number;
}

const MetricsOverview = memo(({ data, delay = 200 }: MetricsOverviewProps) => {
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');

  // Memoize calculations to prevent unnecessary recalculations
  const metrics = useMemo(() => {
    const avgScore = data.sleepScores.length > 0 
      ? Math.round(data.sleepScores.reduce((sum, item) => sum + item.value, 0) / data.sleepScores.length)
      : 0;

    const avgEfficiency = data.sleepEfficiency.length > 0
      ? Math.round(data.sleepEfficiency.reduce((sum, item) => sum + item.value, 0) / data.sleepEfficiency.length)
      : 0;

    const avgDuration = data.sleepDuration.length > 0
      ? data.sleepDuration.reduce((sum, item) => sum + item.value, 0) / data.sleepDuration.length
      : 0;

    const formatDuration = (hours: number) => {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}h ${m}m`;
    };

    const getTrendIcon = (trend: string) => {
      switch (trend) {
        case 'improving': return '📈';
        case 'declining': return '📉';
        default: return '➡️';
      }
    };

    return [
      {
        title: 'Avg Sleep Score',
        value: avgScore.toString(),
        subtitle: `${getTrendIcon(data.sleepQualityTrend)} ${data.sleepQualityTrend}`,
        icon: '💤',
        trend: data.sleepQualityTrend === 'improving' ? 'up' : 
               data.sleepQualityTrend === 'declining' ? 'down' : 'stable'
      },
      {
        title: 'Sleep Efficiency',
        value: `${avgEfficiency}%`,
        subtitle: 'Time asleep vs in bed',
        icon: '⚡',
        trend: avgEfficiency >= 85 ? 'up' : avgEfficiency >= 75 ? 'stable' : 'down'
      },
      {
        title: 'Avg Duration',
        value: formatDuration(avgDuration),
        subtitle: 'Nightly sleep time',
        icon: '⏰',
        trend: avgDuration >= 7.5 ? 'up' : avgDuration >= 6.5 ? 'stable' : 'down'
      },
      {
        title: 'Consistency',
        value: `${Math.round(data.consistencyScore)}%`,
        subtitle: 'Bedtime regularity',
        icon: '🎯',
        trend: data.consistencyScore >= 80 ? 'up' : 
               data.consistencyScore >= 65 ? 'stable' : 'down'
      }
    ];
  }, [data]);

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <ThemedView style={styles.container}>
        <View style={styles.grid}>
          {metrics.map((metric, index) => (
            <View key={metric.title} style={styles.cardWrapper}>
              <Animated.View 
                entering={FadeInDown.delay(delay + 100 + index * 50).springify()}
              >
                <MetricsCard
                  title={metric.title}
                  value={metric.value}
                  subtitle={metric.subtitle}
                  icon={metric.icon}
                  trend={metric.trend as 'up' | 'down' | 'stable'}
                  style={[styles.card, { backgroundColor: cardBg }]}
                />
              </Animated.View>
            </View>
          ))}
        </View>
      </ThemedView>
    </Animated.View>
  );
});

MetricsOverview.displayName = 'MetricsOverview';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardWrapper: {
    width: '48%',
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
});

export default MetricsOverview;