import * as Haptics from 'expo-haptics';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';

// UI Components
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  AnalyticsHeader,
  ChartSection,
  ChartSelector,
  MetricsOverview
} from '@/components/analytics';
import { SafeContainer } from '@/components/ui/SafeContainer';

// Hooks and Utils
import { useThemeColor } from '@/hooks/useThemeColor';

// Services
import { analyticsService } from '@/lib/services';
import { type SleepData } from '@/lib/services/sleepService';

// Types
interface AnalyticsData {
  sleepScores: { date: string; value: number }[];
  sleepEfficiency: { date: string; value: number }[];
  sleepDuration: { date: string; value: number }[];
  bedtimeConsistency: { date: string; value: number }[];
  sleepDebt: { date: string; value: number }[];
  weekdayVsWeekend: {
    weekday: { duration: number; efficiency: number; score: number };
    weekend: { duration: number; efficiency: number; score: number };
  };
  currentSleepData: SleepData | null;
  sleepQualityTrend: 'improving' | 'declining' | 'stable';
  consistencyScore: number;
  sleepGoal: { target: number; current: number };
  insights: string[];
  environmentCorrelations: { factor: string; impact: number }[];
}

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  selectedPeriod: 'week' | 'month' | 'year';
  selectedChart: 'scores' | 'efficiency' | 'duration' | 'consistency' | 'debt';
}

// Memoized loading component
const LoadingState = memo(() => (
  <ThemedView style={styles.centerContainer}>
    <ThemedText type="subtitle">Loading analytics...</ThemedText>
  </ThemedView>
));

LoadingState.displayName = 'LoadingState';

// Memoized error component
const ErrorState = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <ThemedView style={styles.centerContainer}>
    <ThemedText style={styles.errorText}>{error}</ThemedText>
    <ThemedText onPress={onRetry} style={styles.retryText}>
      Tap to retry
    </ThemedText>
  </ThemedView>
));

ErrorState.displayName = 'ErrorState';

const AnalyticsScreen = memo(() => {
  const [state, setState] = useState<AnalyticsState>({
    data: null,
    isLoading: true,
    error: null,
    selectedPeriod: 'week',
    selectedChart: 'scores',
  });
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');

  // Generate sample analytics data
  const generateSampleData = useCallback((): AnalyticsData => {
    const days = state.selectedPeriod === 'week' ? 7 : state.selectedPeriod === 'month' ? 30 : 365;
    const generateDataPoints = (baseValue: number, variance: number) => {
      return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance))
      }));
    };

    return {
      sleepScores: generateDataPoints(78, 20),
      sleepEfficiency: generateDataPoints(85, 15),
      sleepDuration: generateDataPoints(7.5, 2).map(item => ({ ...item, value: item.value })),
      bedtimeConsistency: generateDataPoints(75, 25),
      sleepDebt: generateDataPoints(0, 3).map(item => ({ ...item, value: item.value - 1.5 })),
      weekdayVsWeekend: {
        weekday: { duration: 7.2, efficiency: 83, score: 76 },
        weekend: { duration: 8.1, efficiency: 87, score: 82 }
      },
      currentSleepData: null,
      sleepQualityTrend: 'improving' as const,
      consistencyScore: 78,
      sleepGoal: { target: 8, current: 7.5 },
      insights: ['Your sleep quality has improved by 12% this week'],
      environmentCorrelations: [
        { factor: 'Room Temperature', impact: 0.7 },
        { factor: 'Screen Time', impact: -0.5 }
      ]
    };
  }, [state.selectedPeriod]);

  // Optimized data loading
  const loadAnalyticsData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Simulate API call with sample data
      await new Promise(resolve => setTimeout(resolve, 800));
      const analyticsData = generateSampleData();

      setState(prev => ({
        ...prev,
        isLoading: false,
        data: analyticsData,
        error: null
      }));
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load analytics data'
      }));
    }
  }, [generateSampleData]);

  // Debounced refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  }, [loadAnalyticsData]);

  // Chart selection handlers
  const handleChartChange = useCallback((chart: typeof state.selectedChart) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState(prev => ({ ...prev, selectedChart: chart }));
  }, []);

  const handlePeriodChange = useCallback((period: typeof state.selectedPeriod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState(prev => ({ ...prev, selectedPeriod: period }));
  }, []);

  // Export handler
  const handleExport = useCallback(() => {
    Alert.alert('Export', 'Analytics export feature coming soon!');
  }, []);

  // Data point press handler
  const handleDataPointPress = useCallback((point: any, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Data point pressed:', point, index);
  }, []);

  useEffect(() => {
    loadAnalyticsData();
    analyticsService.trackScreen('analytics');
  }, [loadAnalyticsData]);

  // Re-load data when period changes
  useEffect(() => {
    if (state.data) {
      loadAnalyticsData();
    }
  }, [state.selectedPeriod]);

  return (
    <SafeContainer>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={useThemeColor({}, 'tint')}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnalyticsHeader
          onExportPress={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          delay={0}
        />

        {/* Content */}
        {state.isLoading && <LoadingState />}
        
        {state.error && !state.data && (
          <ErrorState error={state.error} onRetry={loadAnalyticsData} />
        )}

        {state.data && (
          <>
            {/* Metrics Overview */}
            <MetricsOverview data={state.data} delay={100} />

            {/* Chart Selector */}
            <ChartSelector
              selectedChart={state.selectedChart}
              onChartChange={handleChartChange}
              selectedPeriod={state.selectedPeriod}
              onPeriodChange={handlePeriodChange}
              delay={200}
            />

            {/* Main Chart */}
            <ChartSection
              data={state.data}
              selectedChart={state.selectedChart}
              onDataPointPress={handleDataPointPress}
              delay={300}
            />
          </>
        )}

        <ThemedView style={styles.bottomPadding} />
      </ScrollView>
    </SafeContainer>
  );
});

AnalyticsScreen.displayName = 'AnalyticsScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 32,
    backgroundColor: 'transparent',
  },
});

export default AnalyticsScreen;