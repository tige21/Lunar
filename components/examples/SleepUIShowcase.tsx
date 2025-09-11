import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  SafeContainer,
  ScrollContainer,
  ThemedText,
  ThemedView,
  ThemedButton,
  SleepScore,
  SleepPhaseChart,
  MetricsCard,
  TrendChart,
  SleepGoalTracker,
  TimePicker,
  RangeSlider,
  ToggleButton,
  LoadingState,
  SleepDataEmptyState,
  Modal,
} from '../ui';

/**
 * Comprehensive showcase component demonstrating all Lunar UI components
 * This serves as both documentation and testing for the component library
 */
export function SleepUIShowcase() {
  // State for interactive components
  const [bedtime, setBedtime] = useState(new Date());
  const [sleepDuration, setSleepDuration] = useState(8);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample data for charts and components
  const samplePhases = [
    { phase: 'light' as const, duration: 120, percentage: 25 },
    { phase: 'deep' as const, duration: 180, percentage: 37.5 },
    { phase: 'rem' as const, duration: 90, percentage: 18.75 },
    { phase: 'awake' as const, duration: 90, percentage: 18.75 },
  ];

  const sampleTrendData = [
    { date: '2024-01-01', value: 7.5 },
    { date: '2024-01-02', value: 8.2 },
    { date: '2024-01-03', value: 6.8 },
    { date: '2024-01-04', value: 8.5 },
    { date: '2024-01-05', value: 7.9 },
    { date: '2024-01-06', value: 8.1 },
    { date: '2024-01-07', value: 7.3 },
  ];

  if (showEmptyState) {
    return (
      <SafeContainer>
        <SleepDataEmptyState 
          onSetupSleep={() => setShowEmptyState(false)}
        />
      </SafeContainer>
    );
  }

  if (loading) {
    return (
      <SafeContainer>
        <ThemedView style={styles.loadingContainer}>
          <LoadingState 
            variant="sleep-wave" 
            message="Analyzing your sleep data..." 
            size="large"
          />
        </ThemedView>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <ScrollContainer
        refreshing={false}
        onRefresh={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText variant="display" align="center">
            Lunar UI
          </ThemedText>
          <ThemedText variant="subtitle" type="secondary" align="center">
            Sleep-focused component library showcase
          </ThemedText>
        </ThemedView>

        {/* Sleep Score Section */}
        <ThemedView style={styles.section}>
          <ThemedText variant="heading" style={styles.sectionTitle}>
            Sleep Score
          </ThemedText>
          <ThemedView style={styles.scoreRow}>
            <SleepScore score={85} size="sm" />
            <SleepScore score={78} size="md" />
            <SleepScore score={92} size="lg" />
          </ThemedView>
        </ThemedView>

        {/* Sleep Phases Chart */}
        <SleepPhaseChart
          phases={samplePhases}
          totalDuration={480}
          showLegend={true}
        />

        {/* Metrics Cards */}
        <ThemedView style={styles.section}>
          <ThemedText variant="heading" style={styles.sectionTitle}>
            Sleep Metrics
          </ThemedText>
          <ThemedView style={styles.metricsGrid}>
            <MetricsCard
              title="Sleep Duration"
              value="8h 15m"
              subtitle="Last night"
              trend="up"
              trendValue="+30min"
              variant="sleep"
              size="md"
            />
            <MetricsCard
              title="Deep Sleep"
              value="2h 45m"
              subtitle="33% of total"
              trend="neutral"
              trendValue="Average"
              variant="default"
              size="md"
            />
            <MetricsCard
              title="Sleep Efficiency"
              value={89}
              unit="%"
              subtitle="Excellent"
              trend="up"
              trendValue="+5%"
              variant="compact"
              size="sm"
            />
            <MetricsCard
              title="REM Sleep"
              value="1h 30m"
              subtitle="19% of total"
              trend="down"
              trendValue="-15min"
              variant="compact"
              size="sm"
            />
          </ThemedView>
        </ThemedView>

        {/* Sleep Goal Tracker */}
        <SleepGoalTracker
          currentValue={495} // 8h 15m in minutes
          goalValue={480} // 8h in minutes
          title="Daily Sleep Goal"
          subtitle="Target: 8 hours"
          showPercentage={true}
          variant="detailed"
        />

        {/* Trend Chart */}
        <TrendChart
          title="Sleep Duration Trend"
          data={sampleTrendData}
          formatValue={(value) => `${value}h`}
          height={200}
          showGradient={true}
          showPoints={true}
        />

        {/* Interactive Controls */}
        <ThemedView style={styles.section}>
          <ThemedText variant="heading" style={styles.sectionTitle}>
            Sleep Settings
          </ThemedText>
          
          <TimePicker
            value={bedtime}
            onChange={setBedtime}
            label="Bedtime"
            mode="12h"
          />
          
          <RangeSlider
            min={6}
            max={12}
            value={sleepDuration}
            onChange={setSleepDuration}
            step={0.5}
            label="Sleep Duration Goal"
            unit="h"
            showValue={true}
          />
          
          <ToggleButton
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            label="Sleep Reminders"
            variant="switch"
            size="medium"
          />
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.section}>
          <ThemedText variant="heading" style={styles.sectionTitle}>
            Component States
          </ThemedText>
          
          <ThemedView style={styles.buttonGrid}>
            <ThemedButton
              variant="sleep"
              size="lg"
              fullWidth
              onPress={() => setModalVisible(true)}
            >
              Open Modal
            </ThemedButton>
            
            <ThemedButton
              variant="wake"
              size="md"
              onPress={() => setShowEmptyState(true)}
            >
              Show Empty State
            </ThemedButton>
            
            <ThemedButton
              variant="outline"
              size="md"
              onPress={() => setLoading(true)}
            >
              Show Loading
            </ThemedButton>
          </ThemedView>
        </ThemedView>

        {/* Loading States Showcase */}
        <ThemedView style={styles.section}>
          <ThemedText variant="heading" style={styles.sectionTitle}>
            Loading States
          </ThemedText>
          <ThemedView style={styles.loadingGrid}>
            <LoadingState variant="spinner" size="small" />
            <LoadingState variant="pulse" size="medium" />
            <LoadingState variant="dots" size="large" />
            <LoadingState variant="sleep-wave" message="Processing..." />
          </ThemedView>
        </ThemedView>
      </ScrollContainer>

      {/* Sample Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Sleep Settings"
        size="medium"
      >
        <ThemedView style={styles.modalContent}>
          <ThemedText variant="body">
            This is a sample modal demonstrating the Modal component with proper theming and blur backdrop.
          </ThemedText>
          
          <ThemedView style={styles.modalButtons}>
            <ThemedButton
              variant="outline"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </ThemedButton>
            <ThemedButton
              variant="primary"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Save Changes
            </ThemedButton>
          </ThemedView>
        </ThemedView>
      </Modal>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  section: {
    marginVertical: 8,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  metricsGrid: {
    gap: 12,
    paddingHorizontal: 16,
  },
  buttonGrid: {
    gap: 12,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalContent: {
    gap: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});

export default SleepUIShowcase;