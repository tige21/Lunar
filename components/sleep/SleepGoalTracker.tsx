import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { SleepCard } from './SleepCard';
import { ProgressBar } from './ProgressBar';
import { Colors } from '@/constants/Colors';

export type SleepGoal = {
  type: 'duration' | 'bedtime' | 'wake_time' | 'score';
  target: number | string;
  current: number | string;
  unit: string;
  label: string;
};

export type SleepGoalTrackerProps = {
  goals: SleepGoal[];
  showProgress?: boolean;
  variant?: 'card' | 'list';
};

export function SleepGoalTracker({
  goals,
  showProgress = true,
  variant = 'card',
}: SleepGoalTrackerProps) {
  const calculateProgress = (goal: SleepGoal): number => {
    if (typeof goal.target === 'string' || typeof goal.current === 'string') {
      // For time-based goals, we'd need more complex logic
      return 0.8; // Placeholder
    }
    
    const target = goal.target as number;
    const current = goal.current as number;
    
    switch (goal.type) {
      case 'duration':
        return Math.min(current / target, 1);
      case 'score':
        return current / 100; // Assuming score is out of 100
      default:
        return current / target;
    }
  };

  const getGoalStatus = (goal: SleepGoal): 'achieved' | 'in_progress' | 'behind' => {
    const progress = calculateProgress(goal);
    
    if (progress >= 1) return 'achieved';
    if (progress >= 0.7) return 'in_progress';
    return 'behind';
  };

  const getStatusColor = (status: 'achieved' | 'in_progress' | 'behind'): string => {
    switch (status) {
      case 'achieved':
        return Colors.semantic.success;
      case 'in_progress':
        return Colors.semantic.warning;
      case 'behind':
        return Colors.semantic.error;
    }
  };

  const getStatusText = (status: 'achieved' | 'in_progress' | 'behind'): string => {
    switch (status) {
      case 'achieved':
        return 'Goal achieved!';
      case 'in_progress':
        return 'Making progress';
      case 'behind':
        return 'Needs attention';
    }
  };

  const renderGoalCard = (goal: SleepGoal, index: number) => {
    const progress = calculateProgress(goal);
    const status = getGoalStatus(goal);
    const statusColor = getStatusColor(status);

    return (
      <SleepCard
        key={index}
        title={goal.label}
        value={`${goal.current}${goal.unit}`}
        subtitle={`Goal: ${goal.target}${goal.unit}`}
        style={styles.goalCard}
      >
        {showProgress && (
          <ThemedView style={styles.progressSection}>
            <ProgressBar
              progress={progress}
              variant="goal"
              size="medium"
              color={statusColor}
            />
            <ThemedText
              type="caption"
              style={[styles.statusText, { color: statusColor }]}
            >
              {getStatusText(status)}
            </ThemedText>
          </ThemedView>
        )}
      </SleepCard>
    );
  };

  const renderGoalList = (goal: SleepGoal, index: number) => {
    const progress = calculateProgress(goal);
    const status = getGoalStatus(goal);
    const statusColor = getStatusColor(status);

    return (
      <ThemedView key={index} style={styles.goalListItem}>
        <ThemedView style={styles.goalHeader}>
          <ThemedView style={styles.goalInfo}>
            <ThemedText type="defaultSemiBold" style={styles.goalTitle}>
              {goal.label}
            </ThemedText>
            <ThemedText type="caption" style={styles.goalTarget}>
              Target: {goal.target}{goal.unit}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.goalValue}>
            <ThemedText type="sleep-data" style={styles.currentValue}>
              {goal.current}
            </ThemedText>
            <ThemedText type="caption" style={styles.unit}>
              {goal.unit}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {showProgress && (
          <ThemedView style={styles.progressSection}>
            <ProgressBar
              progress={progress}
              variant="goal"
              size="small"
              color={statusColor}
              showPercentage={true}
            />
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  if (variant === 'card') {
    return (
      <ThemedView style={styles.container}>
        {goals.map((goal, index) => renderGoalCard(goal, index))}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.listContainer}>
      {goals.map((goal, index) => renderGoalList(goal, index))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  listContainer: {
    gap: 16,
  },
  goalCard: {
    // Additional card-specific styles if needed
  },
  goalListItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    marginBottom: 4,
  },
  goalTarget: {
    opacity: 0.7,
  },
  goalValue: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 24,
    lineHeight: 28,
  },
  unit: {
    marginTop: 2,
  },
  progressSection: {
    gap: 8,
  },
  statusText: {
    textAlign: 'center',
    fontWeight: '600',
  },
});