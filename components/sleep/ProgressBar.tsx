import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type ProgressBarProps = {
  progress: number; // 0-1
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'gradient' | 'sleep' | 'goal';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
};

export function ProgressBar({
  progress,
  label,
  showPercentage = false,
  variant = 'default',
  size = 'medium',
  color,
  backgroundColor,
  animated = true,
}: ProgressBarProps) {
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(clampedProgress * 100);

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 4;
      case 'large':
        return 12;
      default:
        return 8;
    }
  };

  const getProgressColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'sleep':
        return Colors.sleepStages.rem;
      case 'goal':
        return percentage >= 100 ? Colors.semantic.success : Colors.semantic.warning;
      default:
        return Colors.light.tint;
    }
  };

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    return borderColor;
  };

  const height = getHeight();
  const progressColor = getProgressColor();
  const bgColor = getBackgroundColor();

  const renderProgressFill = () => {
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={['#8B5CF6', '#5B21B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              height,
            },
          ]}
        />
      );
    }

    return (
      <View
        style={[
          styles.progressFill,
          {
            backgroundColor: progressColor,
            width: `${percentage}%`,
            height,
          },
        ]}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      {label && (
        <ThemedView style={styles.labelContainer}>
          <ThemedText type="caption" style={styles.label}>
            {label}
          </ThemedText>
          {showPercentage && (
            <ThemedText type="caption" style={styles.percentage}>
              {percentage}%
            </ThemedText>
          )}
        </ThemedView>
      )}
      
      <View
        style={[
          styles.progressContainer,
          {
            backgroundColor: bgColor,
            height,
          },
        ]}
      >
        {renderProgressFill()}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    flex: 1,
  },
  percentage: {
    fontWeight: '600',
  },
  progressContainer: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 100,
  },
});