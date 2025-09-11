/**
 * Correlation Chart Component
 * Shows relationships between sleep quality and environmental factors
 * with interactive mobile-optimized visualizations
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, {
    Extrapolate,
    FadeInDown,
    FadeInRight,
    interpolate,
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

interface CorrelationFactor {
  id: string;
  name: string;
  icon: string;
  correlation: number; // -1 to 1, where 1 is perfect positive correlation
  impact: 'high' | 'medium' | 'low';
  trend: 'improving' | 'declining' | 'stable';
  description: string;
  values: number[]; // Recent values for mini sparkline
}

interface CorrelationChartProps {
  factors: CorrelationFactor[];
  onFactorPress?: (factor: CorrelationFactor) => void;
  showTrends?: boolean;
  animated?: boolean;
  interactive?: boolean;
}

const { width } = Dimensions.get('window');

export function CorrelationChart({
  factors,
  onFactorPress,
  showTrends = true,
  animated = true,
  interactive = true
}: CorrelationChartProps) {
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const animationValue = useSharedValue(0);
  
  const primaryColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');
  
  useEffect(() => {
    if (animated) {
      animationValue.value = withTiming(1, { duration: 800 });
    } else {
      animationValue.value = 1;
    }
  }, [animated]);
  
  const getCorrelationColor = (correlation: number) => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return correlation > 0 ? Colors.semantic.success : Colors.semantic.error;
    if (absCorr >= 0.4) return Colors.semantic.warning;
    return Colors.semantic.info;
  };
  
  const getCorrelationLabel = (correlation: number) => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return correlation > 0 ? 'Strong Positive' : 'Strong Negative';
    if (absCorr >= 0.4) return correlation > 0 ? 'Moderate Positive' : 'Moderate Negative';
    return 'Weak Correlation';
  };
  
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return 'exclamationmark.3';
      case 'medium': return 'exclamationmark.2';
      case 'low': return 'exclamationmark';
      default: return 'minus';
    }
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return 'arrow.up.right';
      case 'declining': return 'arrow.down.right';
      default: return 'arrow.right';
    }
  };
  
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return Colors.semantic.success;
      case 'declining': return Colors.semantic.error;
      default: return Colors.semantic.info;
    }
  };
  
  const handleFactorPress = (factor: CorrelationFactor) => {
    if (interactive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedFactor(selectedFactor === factor.id ? null : factor.id);
      onFactorPress?.(factor);
    }
  };
  
  const CorrelationBar = ({ factor, index }: { factor: CorrelationFactor; index: number }) => {
    const barWidth = useSharedValue(0);
    const barOpacity = useSharedValue(0);
    const scaleValue = useSharedValue(1);
    
    const isSelected = selectedFactor === factor.id;
    const correlation = factor.correlation;
    const absCorrelation = Math.abs(correlation);
    const barColor = getCorrelationColor(correlation);
    
    useEffect(() => {
      if (animated) {
        barWidth.value = withDelay(index * 100, withTiming(absCorrelation, { duration: 800 }));
        barOpacity.value = withDelay(index * 100, withTiming(1, { duration: 600 }));
      } else {
        barWidth.value = absCorrelation;
        barOpacity.value = 1;
      }
      
      if (isSelected) {
        scaleValue.value = withSpring(1.02);
      } else {
        scaleValue.value = withSpring(1);
      }
    }, [index, animated, isSelected, absCorrelation]);
    
    const animatedBarStyle = useAnimatedStyle(() => {
      return {
        width: interpolate(barWidth.value, [0, 1], [0, width - 120], Extrapolate.CLAMP),
        opacity: barOpacity.value
      };
    });
    
    const animatedCardStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scaleValue.value }],
        shadowOpacity: isSelected ? 0.15 : 0.05,
        shadowRadius: isSelected ? 8 : 4,
        elevation: isSelected ? 6 : 2
      };
    });
    
    return (
      <Animated.View
        entering={animated ? FadeInDown.delay(index * 150) : undefined}
        style={[styles.factorCard, animatedCardStyle]}
      >
        <Pressable
          onPress={() => handleFactorPress(factor)}
          android_ripple={{ color: barColor + '20', borderless: false }}
          style={styles.factorPressable}
        >
          <ThemedView style={[styles.factorContent, { backgroundColor: surfaceColor }]}>
            {/* Factor Header */}
            <ThemedView style={styles.factorHeader}>
              <ThemedView style={styles.factorInfo}>
                <ThemedView style={[styles.factorIcon, { backgroundColor: barColor + '20' }]}>
                  <IconSymbol
                    name={factor.icon}
                    size={20}
                    color={barColor}
                  />
                </ThemedView>
                <ThemedView style={styles.factorDetails}>
                  <ThemedText type="defaultSemiBold" style={styles.factorName}>
                    {factor.name}
                  </ThemedText>
                  <ThemedText type="caption" variant="secondary" style={styles.factorLabel}>
                    {getCorrelationLabel(correlation)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={styles.factorMeta}>
                <ThemedView style={styles.correlationValue}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={[styles.correlationText, { color: barColor }]}
                  >
                    {correlation > 0 ? '+' : ''}{(correlation * 100).toFixed(0)}%
                  </ThemedText>
                </ThemedView>
                
                {showTrends && (
                  <ThemedView style={[styles.trendBadge, { backgroundColor: getTrendColor(factor.trend) + '20' }]}>
                    <IconSymbol
                      name={getTrendIcon(factor.trend)}
                      size={12}
                      color={getTrendColor(factor.trend)}
                    />
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
            
            {/* Correlation Bar */}
            <ThemedView style={styles.barContainer}>
              <ThemedView style={styles.barTrack}>
                <Animated.View style={[styles.barFill, { backgroundColor: barColor }, animatedBarStyle]}>
                  <LinearGradient
                    colors={[barColor, barColor + '80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
              </ThemedView>
              
              <ThemedView style={styles.impactBadge}>
                <IconSymbol
                  name={getImpactIcon(factor.impact)}
                  size={12}
                  color={factor.impact === 'high' ? Colors.semantic.error : 
                         factor.impact === 'medium' ? Colors.semantic.warning : Colors.semantic.info}
                />
              </ThemedView>
            </ThemedView>
            
            {/* Expanded Details */}
            {isSelected && (
              <Animated.View entering={FadeInRight.duration(300)} style={styles.expandedContent}>
                <ThemedView style={styles.descriptionContainer}>
                  <ThemedText type="body" style={styles.description}>
                    {factor.description}
                  </ThemedText>
                </ThemedView>
                
                {/* Mini Sparkline */}
                <ThemedView style={styles.sparklineContainer}>
                  <ThemedText type="caption" variant="secondary" style={styles.sparklineLabel}>
                    Recent trend:
                  </ThemedText>
                  <ThemedView style={styles.sparkline}>
                    {factor.values.map((value, valueIndex) => {
                      const maxValue = Math.max(...factor.values);
                      const height = (value / maxValue) * 20;
                      
                      return (
                        <ThemedView
                          key={valueIndex}
                          style={[
                            styles.sparklineBar,
                            {
                              height: Math.max(height, 2),
                              backgroundColor: barColor,
                              opacity: 0.7 + (valueIndex / factor.values.length) * 0.3
                            }
                          ]}
                        />
                      );
                    })}
                  </ThemedView>
                </ThemedView>
              </Animated.View>
            )}
          </ThemedView>
        </Pressable>
      </Animated.View>
    );
  };
  
  // Sort factors by correlation strength
  const sortedFactors = [...factors].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerContent}>
          <ThemedText type="subtitle" style={styles.title}>
            Sleep Correlations
          </ThemedText>
          <ThemedText type="caption" variant="secondary" style={styles.subtitle}>
            Factors affecting your sleep quality
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.legend}>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendColor, { backgroundColor: Colors.semantic.success }]} />
            <ThemedText type="caption" style={styles.legendText}>Positive</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendColor, { backgroundColor: Colors.semantic.error }]} />
            <ThemedText type="caption" style={styles.legendText}>Negative</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sortedFactors.map((factor, index) => (
          <CorrelationBar key={factor.id} factor={factor} index={index} />
        ))}
      </ScrollView>
      
      {interactive && (
        <ThemedView style={styles.footer}>
          <ThemedText type="caption" variant="secondary" style={styles.footerText}>
            Tap factors to see detailed analysis
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  factorCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#0F0A1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  factorPressable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  factorContent: {
    padding: 16,
    borderRadius: 16,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  factorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  factorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  factorDetails: {
    flex: 1,
  },
  factorName: {
    fontSize: 16,
    marginBottom: 2,
  },
  factorLabel: {
    fontSize: 13,
  },
  factorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  correlationValue: {
    minWidth: 50,
    alignItems: 'flex-end',
  },
  correlationText: {
    fontSize: 16,
    fontWeight: '700',
  },
  trendBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  impactBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.1)',
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sparklineLabel: {
    fontSize: 12,
    minWidth: 80,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 24,
  },
  sparklineBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default CorrelationChart;