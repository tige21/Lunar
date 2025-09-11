import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';

export type SleepScoreProps = {
  score: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
};

export function SleepScore({
  score,
  size = 'medium',
  showLabel = true,
  label = 'Sleep Score',
  animated = true,
}: SleepScoreProps) {
  const dimensions = {
    small: { size: 80, strokeWidth: 6, fontSize: 18 },
    medium: { size: 120, strokeWidth: 8, fontSize: 28 },
    large: { size: 160, strokeWidth: 10, fontSize: 36 },
  };

  const { size: circleSize, strokeWidth, fontSize } = dimensions[size];
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return Colors.semantic.success;
    if (score >= 60) return Colors.sleepStages.wake;
    if (score >= 40) return Colors.semantic.warning;
    return Colors.semantic.error;
  };

  const getScoreGrade = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Very Poor';
  };

  const scoreColor = getScoreColor(score);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.circleContainer, { width: circleSize, height: circleSize }]}>
        <Svg width={circleSize} height={circleSize} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
          />
        </Svg>
        
        <ThemedView style={styles.scoreContainer}>
          <ThemedText
            type="metric"
            style={[styles.scoreText, { fontSize, color: scoreColor }]}
          >
            {Math.round(score)}
          </ThemedText>
          <ThemedText type="caption" style={styles.gradeText}>
            {getScoreGrade(score)}
          </ThemedText>
        </ThemedView>
      </View>
      
      {showLabel && (
        <ThemedText type="label" style={styles.label}>
          {label}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
  },
  gradeText: {
    marginTop: 2,
    opacity: 0.8,
  },
  label: {
    marginTop: 12,
    textAlign: 'center',
  },
});