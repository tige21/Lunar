import { router } from 'expo-router';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// UI Components
import { QuickStatsGrid, SleepScoreCard, TrendSection } from '@/components/dashboard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HealthSyncStatus } from '@/components/ui/HealthSyncStatus';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SafeContainer } from '@/components/ui/SafeContainer';

// Hooks and Utils
import { useThemeColor } from '@/hooks/useThemeColor';

// Services
import { analyticsService } from '@/lib/services';
import sleepService, { type SleepData } from '@/lib/services/sleepService';

// Types
interface DashboardState {
  isLoading: boolean;
  sleepData: SleepData | null;
  error: string | null;
}

// Memoized loading state component
const LoadingState = memo(() => (
  <Animated.View 
    entering={FadeInDown.springify()}
    style={styles.loadingContainer}
  >
    <ThemedText type="subtitle">Loading your sleep data...</ThemedText>
  </Animated.View>
));

LoadingState.displayName = 'LoadingState';

// Memoized error state component  
const ErrorState = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <Animated.View 
    entering={FadeInDown.springify()}
    style={styles.errorContainer}
  >
    <ThemedText type="subtitle" style={{ color: '#EF4444', marginBottom: 12 }}>
      {error}
    </ThemedText>
    <ThemedText onPress={onRetry} style={styles.retryText}>
      Tap to retry
    </ThemedText>
  </Animated.View>
));

ErrorState.displayName = 'ErrorState';

const DashboardScreen = memo(() => {
  const [state, setState] = useState<DashboardState>({
    isLoading: true,
    sleepData: null,
    error: null
  });
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');

  // Optimized data loading with proper cleanup
  const loadSleepData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      sleepService.clearCache();
      const data = await sleepService.getCurrentSleepData();
      
      setState({
        isLoading: false,
        sleepData: data,
        error: data ? null : 'No sleep data available'
      });
    } catch (error) {
      console.error('Failed to load sleep data:', error);
      setState({
        isLoading: false,
        sleepData: null,
        error: 'Failed to load sleep data'
      });
    }
  }, []);

  // Debounced refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSleepData();
    setRefreshing(false);
  }, [loadSleepData]);

  useEffect(() => {
    loadSleepData();
    analyticsService.trackScreen('dashboard');
  }, [loadSleepData]);

  // Helper function to get sleep quality text
  const getSleepQuality = useCallback((score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  }, []);

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
        <Animated.View entering={FadeInDown.springify()}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerTop}>
              <ThemedView>
                <ThemedText type="title">Good morning! 🌅</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Here&apos;s how you slept last night
                </ThemedText>
              </ThemedView>
              
              {/* Chat Button */}
              <TouchableOpacity
                style={[
                  styles.chatButton,
                  { backgroundColor: useThemeColor({}, 'tint') }
                ]}
                onPress={() => router.push('/chat')}
                activeOpacity={0.8}
              >
                <IconSymbol
                  size={24}
                  color="#FFFFFF"
                  name="message.fill"
                />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </Animated.View>

        {/* Health Sync Status */}
        <HealthSyncStatus />

        {/* Content */}
        {state.isLoading && <LoadingState />}
        
        {state.error && !state.sleepData && (
          <ErrorState error={state.error} onRetry={loadSleepData} />
        )}

        {state.sleepData && (
          <ThemedView style={styles.content}>
            {/* Sleep Score Card */}
            <SleepScoreCard
              score={state.sleepData.score}
              quality={getSleepQuality(state.sleepData.score)}
              delay={200}
            />

            {/* Quick Stats Grid */}
            <QuickStatsGrid
              sleepData={state.sleepData}
              delay={400}
            />

            {/* Trend Section */}
            <TrendSection
              sleepData={state.sleepData}
              delay={600}
            />
          </ThemedView>
        )}

        <ThemedView style={styles.bottomPadding} />
      </ScrollView>
    </SafeContainer>
  );
});

DashboardScreen.displayName = 'DashboardScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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

export default DashboardScreen;