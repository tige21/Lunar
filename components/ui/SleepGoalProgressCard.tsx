/**
 * Sleep Goal Progress Card Component
 * Visual progress tracking for sleep goals with interactive elements
 * and mobile-optimized animations
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Extrapolate,
  FadeInDown,
  interpolate,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';
import { MiniChart, MiniChartColorSchemes } from './MiniChart';

interface SleepGoalProgressProps {
  goalHours: number;
  currentAverage: number;
  weeklyData: number[]; // Hours slept each day
  consistency: number; // Percentage
  streak: number; // Days
  onGoalAdjust?: (newGoal: number) => void;
  onViewDetails?: () => void;
  animated?: boolean;
  interactive?: boolean;
}


export function SleepGoalProgressCard({
  goalHours = 8,
  currentAverage = 7.2,
  weeklyData = [7.5, 8.2, 6.8, 7.9, 8.1, 6.5, 7.8],
  consistency = 78,
  streak = 3,
  onGoalAdjust,
  onViewDetails,
  animated = true,
  interactive = true
}: SleepGoalProgressProps) {
  const progressValue = useSharedValue(0);
  const ringRotation = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  
  const primaryColor = useThemeColor({}, 'tint');
  
  const progressPercentage = Math.min((currentAverage / goalHours) * 100, 100);
  const isOnTrack = progressPercentage >= 90;
  const progressColor = isOnTrack ? Colors.semantic.success : 
                       progressPercentage >= 70 ? Colors.semantic.warning : 
                       Colors.semantic.error;
  
  useEffect(() => {
    if (animated) {
      progressValue.value = withDelay(300, withTiming(progressPercentage / 100, { duration: 1500 }));
      ringRotation.value = withDelay(500, withTiming(360, { duration: 2000 }));
      
      if (isOnTrack) {
        glowOpacity.value = withDelay(1000, withTiming(0.6, { duration: 800 }));
      }
    } else {
      progressValue.value = progressPercentage / 100;
      ringRotation.value = 360;
      glowOpacity.value = isOnTrack ? 0.6 : 0;
    }
  }, [progressPercentage, animated, isOnTrack]);
  
  const animatedProgressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      progressValue.value,
      [0, 1],
      [0, 360 * 0.75], // 3/4 circle
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ rotate: `${rotation}deg` }]
    };
  });
  
  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${ringRotation.value}deg` }],
      opacity: interpolate(ringRotation.value, [0, 360], [0, 1], Extrapolate.CLAMP)
    };
  });
  
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      shadowOpacity: glowOpacity.value * 0.3,
      shadowRadius: interpolate(glowOpacity.value, [0, 1], [0, 20], Extrapolate.CLAMP),
      shadowColor: progressColor,
      elevation: interpolate(glowOpacity.value, [0, 1], [4, 12], Extrapolate.CLAMP)
    };
  });
  
  const handlePress = () => {
    if (interactive && onViewDetails) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      cardScale.value = withSpring(0.98, { damping: 15 }, () => {
        cardScale.value = withSpring(1);
      });
      onViewDetails();
    }
  };
  
  const handleGoalAdjust = (increase: boolean) => {
    if (onGoalAdjust) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newGoal = increase ? goalHours + 0.5 : Math.max(6, goalHours - 0.5);
      onGoalAdjust(newGoal);
    }
  };
  
  const getStreakColor = (streakDays: number) => {
    if (streakDays >= 7) return Colors.semantic.success;
    if (streakDays >= 3) return Colors.semantic.warning;
    return Colors.semantic.info;
  };
  
  const getConsistencyMessage = (consistency: number) => {
    if (consistency >= 90) return 'Excellent consistency! 🎯';
    if (consistency >= 75) return 'Good sleep routine 👍';
    if (consistency >= 60) return 'Room for improvement 📈';
    return "Let's build better habits 💪";
  };
  
  return (
    <Animated.View
      entering={animated ? FadeInDown.delay(200) : undefined}
      style={[styles.container, animatedCardStyle]}
    >
      <Pressable
        onPress={handlePress}
        android_ripple={{ color: primaryColor + '20', borderless: false }}
        style={styles.pressable}
      >
        <ThemedView style={styles.card}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerLeft}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Sleep Goal Progress
              </ThemedText>
              <ThemedText type="caption" variant="secondary">
                {getConsistencyMessage(consistency)}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.headerRight}>
              <ThemedView style={[styles.streakBadge, { backgroundColor: getStreakColor(streak) + '20' }]}>
                <IconSymbol
                  name="flame.fill"
                  size={14}
                  color={getStreakColor(streak)}
                />
                <ThemedText
                  type="caption"
                  style={[styles.streakText, { color: getStreakColor(streak) }]}
                >
                  {streak} days
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
          
          {/* Progress Ring and Stats */}
          <ThemedView style={styles.progressSection}>
            {/* Circular Progress */}
            <ThemedView style={styles.progressContainer}>
              <ThemedView style={styles.progressRing}>
                {/* Background Ring */}
                <ThemedView style={[styles.ring, styles.ringBackground]} />
                
                {/* Progress Ring */}
                <Animated.View style={[styles.ring, styles.ringProgress, animatedProgressStyle]}>
                  <LinearGradient
                    colors={[progressColor, progressColor + '80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
                
                {/* Center Content */}
                <ThemedView style={styles.progressCenter}>
                  <ThemedText type="hero" style={[styles.progressText, { color: progressColor }]}>
                    {currentAverage.toFixed(1)}
                  </ThemedText>
                  <ThemedText type="caption" variant="secondary" style={styles.progressLabel}>
                    of {goalHours}h goal
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    style={[styles.progressPercentage, { color: progressColor }]}
                  >
                    {Math.round(progressPercentage)}%
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
            
            {/* Quick Stats */}
            <ThemedView style={styles.quickStats}>
              <Animated.View entering={animated ? SlideInRight.delay(600) : undefined}>
                <ThemedView style={styles.statItem}>
                  <ThemedText type="caption" variant="secondary">Consistency</ThemedText>
                  <ThemedView style={styles.statValueRow}>
                    <ThemedText type="defaultSemiBold" style={styles.statValue}>
                      {consistency}%
                    </ThemedText>
                    <ThemedView style={styles.consistencyBar}>
                      <ThemedView 
                        style={[
                          styles.consistencyFill,
                          { 
                            width: `${consistency}%`,
                            backgroundColor: consistency >= 75 ? Colors.semantic.success : Colors.semantic.warning
                          }
                        ]}
                      />
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              </Animated.View>
              
              <Animated.View entering={animated ? SlideInRight.delay(700) : undefined}>
                <ThemedView style={styles.statItem}>
                  <ThemedText type="caption" variant="secondary">This Week</ThemedText>
                  <ThemedView style={styles.chartContainer}>
                    <MiniChart
                      data={weeklyData}
                      height={24}
                      barWidth={4}
                      barGap={2}
                      getBarColor={MiniChartColorSchemes.score}
                      maxValue={10}
                      interactive={false}
                      animated={animated}
                      showGradient={true}
                    />
                  </ThemedView>
                </ThemedView>
              </Animated.View>
            </ThemedView>
          </ThemedView>
          
          {/* Goal Adjustment */}
          {interactive && onGoalAdjust && (
            <Animated.View entering={animated ? FadeInDown.delay(800) : undefined}>
              <ThemedView style={styles.goalAdjust}>
                <ThemedText type="caption" variant="secondary" style={styles.adjustLabel}>
                  Adjust Goal
                </ThemedText>
                <ThemedView style={styles.adjustButtons}>
                  <Pressable
                    onPress={() => handleGoalAdjust(false)}
                    style={[styles.adjustButton, styles.adjustButtonLeft]}
                  >
                    <IconSymbol name="minus" size={16} color={Colors.semantic.info} />
                  </Pressable>
                  <ThemedView style={styles.goalDisplay}>
                    <ThemedText type="defaultSemiBold" style={styles.goalText}>
                      {goalHours}h
                    </ThemedText>
                  </ThemedView>
                  <Pressable
                    onPress={() => handleGoalAdjust(true)}
                    style={[styles.adjustButton, styles.adjustButtonRight]}
                  >
                    <IconSymbol name="plus" size={16} color={Colors.semantic.info} />
                  </Pressable>
                </ThemedView>
              </ThemedView>
            </Animated.View>
          )}
          
          {/* Action Hint */}
          {interactive && (
            <ThemedView style={styles.actionHint}>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={Colors.semantic.info}
              />
              <ThemedText type="caption" style={[styles.hintText, { color: Colors.semantic.info }]}>
                Tap for detailed breakdown
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    marginBottom: 16,
  },
  pressable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F0A1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 24,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressRing: {
    width: 120,
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
  },
  ringBackground: {
    borderColor: 'rgba(156, 163, 175, 0.2)',
  },
  ringProgress: {
    borderColor: 'transparent',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    overflow: 'hidden',
  },
  progressCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  progressLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  quickStats: {
    flex: 1,
    gap: 16,
  },
  statItem: {
    gap: 8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    minWidth: 40,
  },
  consistencyBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  consistencyFill: {
    height: '100%',
    borderRadius: 2,
  },
  chartContainer: {
    alignItems: 'flex-start',
  },
  goalAdjust: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.1)',
  },
  adjustLabel: {
    fontSize: 13,
  },
  adjustButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  adjustButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  adjustButtonLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  adjustButtonRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  goalDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.05)',
  },
  hintText: {
    fontSize: 12,
  },
});

export default SleepGoalProgressCard;