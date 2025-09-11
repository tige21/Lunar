import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TrendChart } from '@/components/ui/TrendChart';
import { SleepPhaseChart } from '@/components/ui/SleepPhaseChart';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AnalyticsData {
  sleepScores: { date: string; value: number }[];
  sleepEfficiency: { date: string; value: number }[];
  sleepDuration: { date: string; value: number }[];
  bedtimeConsistency: { date: string; value: number }[];
  sleepDebt: { date: string; value: number }[];
}

interface ChartSectionProps {
  data: AnalyticsData;
  selectedChart: 'scores' | 'efficiency' | 'duration' | 'consistency' | 'debt';
  onDataPointPress?: (point: any, index: number) => void;
  delay?: number;
}

const { width } = Dimensions.get('window');
const chartHeight = 200;

const ChartSection = memo(({ 
  data, 
  selectedChart, 
  onDataPointPress,
  delay = 400 
}: ChartSectionProps) => {
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');
  const primaryColor = useThemeColor({}, 'tint');

  // Memoize chart data and configurations
  const chartConfig = useMemo(() => {
    const configs = {
      scores: {
        title: '💤 Sleep Quality Scores',
        data: data.sleepScores,
        color: primaryColor,
        formatValue: (value: number) => `${Math.round(value)}`,
        description: 'Your overall sleep quality over time'
      },
      efficiency: {
        title: '⚡ Sleep Efficiency',
        data: data.sleepEfficiency,
        color: '#10B981',
        formatValue: (value: number) => `${Math.round(value)}%`,
        description: 'Percentage of time spent sleeping vs in bed'
      },
      duration: {
        title: '⏰ Sleep Duration',
        data: data.sleepDuration,
        color: '#3B82F6',
        formatValue: (value: number) => {
          const hours = Math.floor(value);
          const minutes = Math.round((value - hours) * 60);
          return `${hours}h ${minutes}m`;
        },
        description: 'Hours of sleep per night'
      },
      consistency: {
        title: '🎯 Bedtime Consistency',
        data: data.bedtimeConsistency,
        color: '#8B5CF6',
        formatValue: (value: number) => `${Math.round(value)}%`,
        description: 'How consistent your bedtime schedule is'
      },
      debt: {
        title: '📊 Sleep Debt',
        data: data.sleepDebt,
        color: '#EF4444',
        formatValue: (value: number) => {
          const sign = value >= 0 ? '+' : '';
          const hours = Math.floor(Math.abs(value));
          const minutes = Math.round((Math.abs(value) - hours) * 60);
          return `${sign}${hours}h ${minutes}m`;
        },
        description: 'Accumulated sleep debt (+ surplus, - deficit)'
      }
    };

    return configs[selectedChart];
  }, [selectedChart, data, primaryColor]);

  // Memoize chart data transformation
  const chartData = useMemo(() => {
    return chartConfig.data.map(item => ({
      date: item.date,
      value: item.value,
      label: chartConfig.formatValue(item.value)
    }));
  }, [chartConfig]);

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <ThemedView style={[styles.container, { backgroundColor: cardBg }]}>
        {/* Chart Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {chartConfig.title}
          </ThemedText>
          <ThemedText style={styles.description}>
            {chartConfig.description}
          </ThemedText>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <TrendChart
            data={chartData}
            height={chartHeight}
            color={chartConfig.color}
            showGradient={true}
            showPoints={true}
            formatValue={chartConfig.formatValue}
            onDataPointPress={onDataPointPress}
            interactive={true}
          />
        </View>

        {/* Chart Stats */}
        <View style={styles.statsContainer}>
          {chartData.length > 0 && (
            <>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Latest</ThemedText>
                <ThemedText style={styles.statValue}>
                  {chartData[chartData.length - 1]?.label}
                </ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Average</ThemedText>
                <ThemedText style={styles.statValue}>
                  {chartConfig.formatValue(
                    chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length
                  )}
                </ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Best</ThemedText>
                <ThemedText style={styles.statValue}>
                  {chartConfig.formatValue(
                    Math.max(...chartData.map(item => item.value))
                  )}
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </ThemedView>
    </Animated.View>
  );
});

ChartSection.displayName = 'ChartSection';

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  chartContainer: {
    height: chartHeight,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChartSection;