import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type SleepPhase = {
  stage: 'deep' | 'rem' | 'light' | 'wake' | 'awake';
  duration: number; // in minutes
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
};

export type SleepPhaseChartProps = {
  phases: SleepPhase[];
  totalSleepTime: number; // in minutes
  showLegend?: boolean;
  height?: number;
};

export function SleepPhaseChart({
  phases,
  totalSleepTime,
  showLegend = true,
  height = 80,
}: SleepPhaseChartProps) {
  const chartWidth = SCREEN_WIDTH - 40; // Account for padding

  const getStageColor = (stage: SleepPhase['stage']): string => {
    return Colors.sleepStages[stage];
  };

  const getStageLabel = (stage: SleepPhase['stage']): string => {
    switch (stage) {
      case 'deep':
        return 'Deep Sleep';
      case 'rem':
        return 'REM Sleep';
      case 'light':
        return 'Light Sleep';
      case 'wake':
        return 'Wake';
      case 'awake':
        return 'Awake';
    }
  };

  const renderPhaseBar = () => {
    return (
      <View style={[styles.barContainer, { height }]}>
        {phases.map((phase, index) => {
          const widthPercentage = (phase.duration / totalSleepTime) * 100;
          const width = (chartWidth * widthPercentage) / 100;
          
          return (
            <View
              key={index}
              style={[
                styles.phaseSegment,
                {
                  width,
                  backgroundColor: getStageColor(phase.stage),
                  borderTopLeftRadius: index === 0 ? 8 : 0,
                  borderBottomLeftRadius: index === 0 ? 8 : 0,
                  borderTopRightRadius: index === phases.length - 1 ? 8 : 0,
                  borderBottomRightRadius: index === phases.length - 1 ? 8 : 0,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderLegend = () => {
    if (!showLegend) return null;

    const stageStats = phases.reduce((acc, phase) => {
      const existing = acc.find(item => item.stage === phase.stage);
      if (existing) {
        existing.duration += phase.duration;
      } else {
        acc.push({ stage: phase.stage, duration: phase.duration });
      }
      return acc;
    }, [] as { stage: SleepPhase['stage']; duration: number }[]);

    return (
      <ThemedView style={styles.legend}>
        {stageStats.map((stat) => (
          <ThemedView key={stat.stage} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: getStageColor(stat.stage) }
              ]}
            />
            <ThemedText type="caption" style={styles.legendLabel}>
              {getStageLabel(stat.stage)}
            </ThemedText>
            <ThemedText type="caption" style={styles.legendDuration}>
              {Math.round(stat.duration)}m
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    );
  };

  const renderTimeLabels = () => {
    const startTime = phases[0]?.startTime;
    const endTime = phases[phases.length - 1]?.endTime;
    
    if (!startTime || !endTime) return null;

    return (
      <ThemedView style={styles.timeLabels}>
        <ThemedText type="caption" style={styles.timeLabel}>
          {startTime}
        </ThemedText>
        <ThemedText type="caption" style={styles.timeLabel}>
          {endTime}
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {renderPhaseBar()}
      {renderTimeLabels()}
      {renderLegend()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barContainer: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  phaseSegment: {
    flex: 0,
    height: '100%',
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  timeLabel: {
    opacity: 0.7,
  },
  legend: {
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
  },
  legendDuration: {
    fontWeight: '600',
  },
});