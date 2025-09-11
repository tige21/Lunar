import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

export interface SleepGoalTrackerProps {
  currentValue: number; // current sleep duration in minutes
  goalValue: number; // goal sleep duration in minutes
  title?: string;
  subtitle?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function SleepGoalTracker({
  currentValue,
  goalValue,
  title = 'Sleep Goal',
  subtitle,
  showPercentage = true,
  variant = 'default',
}: SleepGoalTrackerProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({ light: '#F3F4F6', dark: '#374151' }, 'background');
  
  const percentage = Math.min((currentValue / goalValue) * 100, 100);
  const isGoalMet = currentValue >= goalValue;
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProgressColor = () => {
    if (isGoalMet) return Colors.semantic.success;
    if (percentage >= 80) return primaryColor;
    if (percentage >= 60) return Colors.semantic.warning;
    return Colors.semantic.error;
  };

  const getProgressMessage = () => {
    if (isGoalMet) return 'Goal achieved! 🎉';
    if (percentage >= 80) return 'Almost there!';
    if (percentage >= 60) return 'Making progress';
    return 'Keep going';
  };

  if (variant === 'compact') {
    return (
      <ThemedView style={[styles.container, styles.compact]}>
        <View style={styles.compactHeader}>
          <ThemedText variant="caption" type="secondary">
            {title}
          </ThemedText>
          {showPercentage && (
            <ThemedText 
              variant="caption" 
              weight="semibold"
              style={{ color: getProgressColor() }}
            >
              {Math.round(percentage)}%
            </ThemedText>
          )}
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView variant="card" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText variant="subtitle" weight="semibold">
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText variant="caption" type="secondary">
              {subtitle}
            </ThemedText>
          )}
        </View>
        {showPercentage && (
          <ThemedText 
            variant="title" 
            weight="bold"
            style={{ color: getProgressColor() }}
          >
            {Math.round(percentage)}%
          </ThemedText>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText variant="sleep-data" type="primary">
            {formatTime(currentValue)}
          </ThemedText>
          <ThemedText variant="caption" type="secondary">
            Current
          </ThemedText>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <ThemedText variant="sleep-data" type="secondary">
            {formatTime(goalValue)}
          </ThemedText>
          <ThemedText variant="caption" type="secondary">
            Goal
          </ThemedText>
        </View>
      </View>

      {/* Message */}
      {variant === 'detailed' && (
        <View style={styles.messageContainer}>
          <ThemedText 
            variant="body" 
            weight="medium"
            align="center"
            style={{ color: getProgressColor() }}
          >
            {getProgressMessage()}
          </ThemedText>
          
          {!isGoalMet && (
            <ThemedText variant="caption" type="secondary" align="center">
              {formatTime(goalValue - currentValue)} remaining to reach your goal
            </ThemedText>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    gap: 16,
  },
  compact: {
    margin: 0,
    padding: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 8,
  },
  progressBarBackground: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease-in-out',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageContainer: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default SleepGoalTracker;