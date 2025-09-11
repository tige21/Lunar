import React from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Colors } from '@/constants/Colors';

export interface SleepPhase {
  phase: 'deep' | 'rem' | 'light' | 'awake';
  duration: number; // minutes
  percentage: number;
}

export interface SleepPhaseChartProps {
  phases: SleepPhase[];
  totalDuration: number; // minutes
  height?: number;
  showLegend?: boolean;
  interactive?: boolean;
  animated?: boolean;
  onPhasePress?: (phase: SleepPhase, index: number) => void;
}

export function SleepPhaseChart({
  phases,
  totalDuration,
  height = 120,
  showLegend = true,
  interactive = false,
  animated = true,
  onPhasePress,
}: SleepPhaseChartProps) {
  const [selectedPhase, setSelectedPhase] = React.useState<number | null>(null);
  const animationProgress = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, { duration: 1500 });
    } else {
      animationProgress.value = 1;
    }
  }, [animated]);
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Account for padding

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'deep':
        return Colors.sleepStages.deep;
      case 'rem':
        return Colors.sleepStages.rem;
      case 'light':
        return Colors.sleepStages.light;
      case 'awake':
        return Colors.sleepStages.awake;
      default:
        return Colors.sleepStages.light;
    }
  };

  const getPhaseGradient = (phase: string): [string, string] => {
    switch (phase) {
      case 'deep':
        return ['#1E1B3C', '#0F0A1E'];
      case 'rem':
        return ['#3B1A78', '#1E1B3C'];
      case 'light':
        return ['#4C1D95', '#3B1A78'];
      case 'awake':
        return ['#EA580C', '#F7A532'];
      default:
        return ['#4C1D95', '#3B1A78'];
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'deep':
        return 'Deep Sleep';
      case 'rem':
        return 'REM Sleep';
      case 'light':
        return 'Light Sleep';
      case 'awake':
        return 'Awake';
      default:
        return phase;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handlePhasePress = (phase: SleepPhase, index: number) => {
    if (interactive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedPhase(selectedPhase === index ? null : index);
      onPhasePress?.(phase, index);
    }
  };

  return (
    <ThemedView 
      variant="sleep-card" 
      shadow="soft"
      borderRadius="xl"
      style={styles.container}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="heading" variant="primary" style={styles.title}>
          Sleep Phases
        </ThemedText>
        <ThemedText type="caption" variant="secondary">
          {formatDuration(totalDuration)} total
        </ThemedText>
      </ThemedView>
      
      {/* Enhanced Chart */}
      <View style={[styles.chartContainer, { height: height + 20, width: chartWidth }]}>
        <View style={styles.chartWrapper}>
          <View style={styles.chart}>
            {phases.map((phase, index) => {
              const animatedStyle = useAnimatedStyle(() => {
                const width = interpolate(
                  animationProgress.value,
                  [0, 1],
                  [0, phase.percentage],
                  Extrapolate.CLAMP
                );
                const opacity = interpolate(
                  animationProgress.value,
                  [0, 0.5, 1],
                  [0, 0.7, 1],
                  Extrapolate.CLAMP
                );
                return {
                  width: `${width}%`,
                  opacity,
                  transform: [
                    { 
                      scale: selectedPhase === index ? 1.05 : 1 
                    }
                  ],
                };
              });

              const gradient = getPhaseGradient(phase.phase);

              return (
                <Pressable
                  key={index}
                  onPress={() => handlePhasePress(phase, index)}
                  disabled={!interactive}
                  style={{ flex: phase.percentage }}
                >
                  <Animated.View
                    style={[
                      styles.phaseBar,
                      animatedStyle,
                      {
                        borderWidth: selectedPhase === index ? 2 : 0,
                        borderColor: '#FFFFFF',
                        borderRadius: selectedPhase === index ? 4 : 0,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
          
          {/* Enhanced Time labels */}
          <View style={styles.timeLabels}>
            <ThemedText type="caption" variant="secondary">
              Sleep Start
            </ThemedText>
            <ThemedText type="caption" variant="secondary">
              Wake Up
            </ThemedText>
          </View>
        </View>
        
        {/* Phase Details on Selection */}
        {selectedPhase !== null && (
          <Animated.View 
            style={[
              styles.phaseDetails,
              {
                backgroundColor: getPhaseColor(phases[selectedPhase].phase) + '20',
                borderLeftColor: getPhaseColor(phases[selectedPhase].phase),
              }
            ]}
          >
            <ThemedText type="defaultSemiBold" variant="primary">
              {getPhaseLabel(phases[selectedPhase].phase)}
            </ThemedText>
            <ThemedText type="body" variant="secondary">
              Duration: {formatDuration(phases[selectedPhase].duration)}
            </ThemedText>
            <ThemedText type="caption" variant="secondary">
              {phases[selectedPhase].percentage.toFixed(1)}% of total sleep
            </ThemedText>
          </Animated.View>
        )}
      </View>

      {/* Enhanced Legend */}
      {showLegend && (
        <View style={styles.legend}>
          <ThemedText type="subtitle" variant="secondary" style={styles.legendTitle}>
            Sleep Breakdown
          </ThemedText>
          <View style={styles.legendGrid}>
            {phases.map((phase, index) => {
              const animatedLegendStyle = useAnimatedStyle(() => ({
                opacity: withDelay(
                  index * 100,
                  withTiming(animationProgress.value, { duration: 500 })
                ),
                transform: [
                  {
                    translateX: interpolate(
                      animationProgress.value,
                      [0, 1],
                      [-20, 0],
                      Extrapolate.CLAMP
                    ),
                  },
                ],
              }));

              return (
                <Animated.View key={index} style={[styles.legendItem, animatedLegendStyle]}>
                  <LinearGradient
                    colors={getPhaseGradient(phase.phase)}
                    style={styles.legendColor}
                  />
                  <View style={styles.legendText}>
                    <ThemedText type="defaultSemiBold" variant="primary">
                      {getPhaseLabel(phase.phase)}
                    </ThemedText>
                    <ThemedText type="caption" variant="secondary">
                      {formatDuration(phase.duration)} • {phase.percentage.toFixed(1)}%
                    </ThemedText>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 0,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    height: 32,
    backgroundColor: Colors.dark.border + '40',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  phaseBar: {
    height: '100%',
    position: 'relative',
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  phaseDetails: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
  },
  legend: {
    marginTop: 8,
  },
  legendTitle: {
    marginBottom: 12,
  },
  legendGrid: {
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.dark.surface + '60',
    borderRadius: 12,
    gap: 12,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  legendText: {
    flex: 1,
    gap: 4,
  },
});

export default SleepPhaseChart;