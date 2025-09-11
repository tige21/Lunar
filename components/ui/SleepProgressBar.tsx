import React from 'react';
import { ViewProps } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

export type SleepProgressBarProps = ViewProps & {
  progress: number; // 0 to 1
  height?: number;
  showPercentage?: boolean;
  sleepStage?: 'deep' | 'rem' | 'light' | 'wake';
  label?: string;
  animated?: boolean;
};

export function SleepProgressBar({
  progress,
  height = 8,
  showPercentage = false,
  sleepStage = 'deep',
  label,
  animated = true,
  style,
  ...otherProps
}: SleepProgressBarProps) {
  const getSleepStageGradient = (stage: string) => {
    switch (stage) {
      case 'deep':
        return ['#1E1B3C', '#3B1A78'];
      case 'rem':
        return ['#3B1A78', '#4C1D95'];
      case 'light':
        return ['#4C1D95', '#5B21B6'];
      case 'wake':
        return ['#EA580C', '#F7A532'];
      default:
        return ['#1E1B3C', '#3B1A78'];
    }
  };

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(clampedProgress * 100);
  const colors = getSleepStageGradient(sleepStage);

  return (
    <ThemedView style={[{ width: '100%' }, style]} {...otherProps}>
      {/* Label */}
      {label && (
        <ThemedView style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 8 
        }}>
          <ThemedText variant="caption" type="secondary">
            {label}
          </ThemedText>
          {showPercentage && (
            <ThemedText variant="caption" type="primary">
              {percentage}%
            </ThemedText>
          )}
        </ThemedView>
      )}

      {/* Progress Bar Background */}
      <ThemedView
        style={{
          height,
          backgroundColor: '#2D1B69',
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        {/* Progress Bar Fill */}
        <ThemedView
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: colors[0],
            borderRadius: height / 2,
            // Add gradient effect simulation with shadow
            shadowColor: colors[1],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      </ThemedView>
    </ThemedView>
  );
}

export default SleepProgressBar;