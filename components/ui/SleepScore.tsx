import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Circle, Svg, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolate,
  useAnimatedStyle
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface SleepScoreProps {
  score: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  showGlow?: boolean;
}

export function SleepScore({
  score,
  size = 'medium',
  showLabel = true,
  label = 'Sleep Score',
  animated = true,
  sleepQuality,
  showGlow = true,
}: SleepScoreProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  
  React.useEffect(() => {
    if (animated) {
      progress.value = withTiming(score / 100, { duration: 1500 });
      scale.value = withSpring(1, { 
        damping: 10,
        stiffness: 100 
      });
    } else {
      progress.value = score / 100;
      scale.value = 1;
    }
  }, [score, animated]);
  const tintColor = useThemeColor({}, 'tint');
  
  const dimensions = {
    small: { radius: 50, strokeWidth: 6, fontSize: 20, containerSize: 140 },
    medium: { radius: 70, strokeWidth: 8, fontSize: 32, containerSize: 180 },
    large: { radius: 90, strokeWidth: 12, fontSize: 42, containerSize: 220 },
  };

  const { radius, strokeWidth, fontSize, containerSize } = dimensions[size];
  const circumference = 2 * Math.PI * radius;
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return Colors.semantic.success;
    if (score >= 70) return '#8B5CF6';
    if (score >= 50) return Colors.semantic.warning;
    return Colors.semantic.error;
  };

  const getScoreGradient = (score: number): [string, string] => {
    if (score >= 85) return ['#10B981', '#059669'];
    if (score >= 70) return ['#8B5CF6', '#5B21B6'];
    if (score >= 50) return ['#F59E0B', '#D97706'];
    return ['#EF4444', '#DC2626'];
  };

  const getRating = (score: number) => {
    if (sleepQuality) {
      switch (sleepQuality) {
        case 'excellent': return 'Excellent Sleep';
        case 'good': return 'Good Sleep';
        case 'fair': return 'Fair Sleep';
        case 'poor': return 'Poor Sleep';
      }
    }
    
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const scoreColor = getScoreColor(score);
  const scoreGradient = getScoreGradient(score);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(
      progress.value,
      [0, 1],
      [circumference, 0],
      Extrapolate.CLAMP
    );
    return {
      strokeDashoffset,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <ThemedView 
      variant="sleep-card" 
      shadow={showGlow ? "glow" : "soft"}
      borderRadius="2xl"
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize + (showLabel ? 40 : 0),
          minHeight: containerSize + (showLabel ? 40 : 0),
        }
      ]}
    >
      <Animated.View style={[animatedContainerStyle]}>
        <View style={[styles.scoreContainer, { width: containerSize - 40, height: containerSize - 40 }]}>
          <Svg 
            width={radius * 2 + strokeWidth} 
            height={radius * 2 + strokeWidth}
            style={styles.svg}
          >
            <Defs>
              <SvgLinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={scoreGradient[0]} />
                <Stop offset="100%" stopColor={scoreGradient[1]} />
              </SvgLinearGradient>
            </Defs>
            
            {/* Background circle */}
            <Circle
              cx={(radius * 2 + strokeWidth) / 2}
              cy={(radius * 2 + strokeWidth) / 2}
              r={radius}
              stroke={useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'border')}
              strokeWidth={strokeWidth / 2}
              fill="none"
            />
            
            {/* Progress circle */}
            <AnimatedCircle
              cx={(radius * 2 + strokeWidth) / 2}
              cy={(radius * 2 + strokeWidth) / 2}
              r={radius}
              stroke="url(#scoreGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animatedProps={animatedCircleProps}
              transform={`rotate(-90 ${(radius * 2 + strokeWidth) / 2} ${(radius * 2 + strokeWidth) / 2})`}
            />
          </Svg>
          
          <View style={styles.scoreTextContainer}>
            <ThemedText 
              type="sleep-score"
              style={[
                styles.scoreText, 
                { 
                  fontSize,
                  color: scoreColor,
                }
              ]}
            >
              {Math.round(score)}
            </ThemedText>
            <ThemedText
              type="caption"
              variant="secondary"
              style={{
                fontSize: size === 'small' ? 10 : size === 'large' ? 14 : 12,
                marginTop: -8,
              }}
            >
              SCORE
            </ThemedText>
          </View>
        </View>
      </Animated.View>
      
      {showLabel && (
        <ThemedText 
          type="subtitle"
          variant="primary" 
          style={[
            styles.label,
            {
              fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
            }
          ]}
        >
          {sleepQuality ? getRating(score) : label}
        </ThemedText>
      )}

      {/* Decorative Background Gradient */}
      {showGlow && (
        <LinearGradient
          colors={[
            'transparent',
            scoreGradient[0] + '15',
            scoreGradient[1] + '25',
            'transparent',
          ]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 16,
            zIndex: -1,
          }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  scoreTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scoreText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SleepScore;