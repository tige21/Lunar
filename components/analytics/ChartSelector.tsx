import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChartSelectorProps {
  selectedChart: 'scores' | 'efficiency' | 'duration' | 'consistency' | 'debt';
  onChartChange: (chart: 'scores' | 'efficiency' | 'duration' | 'consistency' | 'debt') => void;
  selectedPeriod: 'week' | 'month' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
  delay?: number;
}

const CHART_OPTIONS = [
  { key: 'scores', label: 'Sleep Scores', icon: '💤' },
  { key: 'efficiency', label: 'Efficiency', icon: '⚡' },
  { key: 'duration', label: 'Duration', icon: '⏰' },
  { key: 'consistency', label: 'Consistency', icon: '🎯' },
  { key: 'debt', label: 'Sleep Debt', icon: '📊' },
] as const;

const PERIOD_OPTIONS = [
  { key: 'week', label: '7D' },
  { key: 'month', label: '30D' },
  { key: 'year', label: '1Y' },
] as const;

const ChartSelector = memo(({ 
  selectedChart, 
  onChartChange, 
  selectedPeriod, 
  onPeriodChange,
  delay = 0 
}: ChartSelectorProps) => {
  const primaryColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#333333' }, 'border');

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <ThemedView style={[styles.container, { backgroundColor: cardBg }]}>
        {/* Chart Type Selector */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Chart Type</ThemedText>
          <View style={styles.chipContainer}>
            {CHART_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedChart === option.key ? primaryColor : 'transparent',
                    borderColor: selectedChart === option.key ? primaryColor : borderColor,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onChartChange(option.key);
                }}
              >
                <ThemedText style={[
                  styles.chipText,
                  { color: selectedChart === option.key ? '#FFFFFF' : undefined }
                ]}>
                  {option.icon} {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Time Period</ThemedText>
          <View style={styles.periodContainer}>
            {PERIOD_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.periodChip,
                  {
                    backgroundColor: selectedPeriod === option.key ? primaryColor : 'transparent',
                    borderColor: selectedPeriod === option.key ? primaryColor : borderColor,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPeriodChange(option.key);
                }}
              >
                <ThemedText style={[
                  styles.periodText,
                  { color: selectedPeriod === option.key ? '#FFFFFF' : undefined }
                ]}>
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </ThemedView>
    </Animated.View>
  );
});

ChartSelector.displayName = 'ChartSelector';

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChartSelector;