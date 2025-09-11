import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { Circle, Defs, LinearGradient, Path, Stop, Svg } from 'react-native-svg';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

export interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
  showGradient?: boolean;
  showPoints?: boolean;
  formatValue?: (value: number) => string;
  formatDate?: (date: string) => string;
  onDataPointPress?: (point: DataPoint, index: number) => void;
  interactive?: boolean;
}

export function TrendChart({
  data,
  title,
  height = 200,
  color,
  showGradient = true,
  showPoints = true,
  formatValue = (value) => value.toString(),
  formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  onDataPointPress,
  interactive = true
}: TrendChartProps) {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const translateX = useSharedValue(0);
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;
  const chartHeight = height - 40; // Account for labels
  
  // Always call hooks at the top level
  const themeColor = useThemeColor({}, 'tint');
  const primaryColor = color || themeColor;
  
  // Early return conditions must come after hooks
  const hasData = data && data.length > 0;
  
  const minValue = hasData ? Math.min(...data.map(d => d.value)) : 0;
  const maxValue = hasData ? Math.max(...data.map(d => d.value)) : 1;
  const valueRange = maxValue - minValue || 1; // Avoid division by zero
  
  // Memoize expensive path calculations to prevent recalculation on every render
  const { pathData, fillPathData, points } = useMemo(() => {
    if (!hasData) {
      return { pathData: '', fillPathData: '', points: [] };
    }
    
    const calculatedPathData = data
      .map((point, index) => {
        const x = (index / (data.length - 1)) * chartWidth;
        const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const calculatedFillPathData = `${calculatedPathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    const calculatedPoints = data.map((point, index) => ({
      x: (index / (data.length - 1)) * chartWidth,
      y: chartHeight - ((point.value - minValue) / valueRange) * chartHeight,
      value: point.value,
    }));

    return {
      pathData: calculatedPathData,
      fillPathData: calculatedFillPathData,
      points: calculatedPoints
    };
  }, [data, chartWidth, chartHeight, minValue, valueRange, hasData]);
  
  // Memoize point finding function for better performance during gestures
  const findNearestPoint = useCallback((x: number): number => {
    const pointIndex = Math.round((x / chartWidth) * (data.length - 1));
    return Math.max(0, Math.min(data.length - 1, pointIndex));
  }, [chartWidth, data.length]);
  
  const handleDataPointPress = useCallback((index: number) => {
    setSelectedPointIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDataPointPress?.(data[index], index);
  }, [data, onDataPointPress]);
  
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      if (interactive) {
        const pointIndex = findNearestPoint(event.x);
        runOnJS(handleDataPointPress)(pointIndex);
      }
    },
    onActive: (event) => {
      if (interactive) {
        translateX.value = event.x;
        const pointIndex = findNearestPoint(event.x);
        runOnJS(setSelectedPointIndex)(pointIndex);
      }
    },
    onEnd: () => {
      if (interactive) {
        runOnJS(setSelectedPointIndex)(null);
      }
    }
  });
  
  const animatedTooltipStyle = useAnimatedStyle(() => {
    return {
      opacity: selectedPointIndex !== null ? withSpring(1) : withSpring(0),
      transform: [
        { translateX: translateX.value },
        { translateY: -40 }
      ]
    };
  });

  if (!hasData) {
    return (
      <ThemedView variant="card" style={styles.container}>
        {title && (
          <ThemedText variant="subtitle" weight="semibold" style={styles.title}>
            {title}
          </ThemedText>
        )}
        <ThemedView style={[styles.emptyContainer, { height }]}>
          <ThemedText variant="body" type="secondary" align="center">
            No data available
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Show max 5 x-axis labels
  const labelIndices = hasData && data.length <= 5 
    ? data.map((_, i) => i)
    : hasData ? [0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor(3 * data.length / 4), data.length - 1] : [];

  return (
    <ThemedView variant="card" style={styles.container}>
      {title && (
        <ThemedText variant="subtitle" weight="semibold" style={styles.title}>
          {title}
        </ThemedText>
      )}
      
      <View style={[styles.chartContainer, { width: chartWidth, height }]}>
        <PanGestureHandler onGestureEvent={gestureHandler} enabled={interactive}>
          <Animated.View>
            <Svg width={chartWidth} height={chartHeight} style={styles.svg}>
          <Defs>
            {showGradient && (
              <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.05" />
              </LinearGradient>
            )}
          </Defs>
          
          {/* Gradient fill */}
          {showGradient && (
            <Path
              d={fillPathData}
              fill="url(#gradient)"
            />
          )}
          
          {/* Line */}
          <Path
            d={pathData}
            stroke={primaryColor}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Points */}
          {showPoints && points.map((point, index) => {
            const isSelected = selectedPointIndex === index;
            const pointRadius = isSelected ? 6 : 4;
            const pointStrokeWidth = isSelected ? 3 : 2;
            
            return (
              <React.Fragment key={index}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={pointRadius}
                  fill="#FFFFFF"
                  stroke={isSelected ? Colors.semantic.info : primaryColor}
                  strokeWidth={pointStrokeWidth}
                />
                {isSelected && (
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={12}
                    fill="none"
                    stroke={Colors.semantic.info}
                    strokeWidth={1}
                    strokeOpacity={0.3}
                  />
                )}
              </React.Fragment>
            );
          })}
            </Svg>
            
            {/* Tooltip */}
            {selectedPointIndex !== null && (
              <Animated.View style={animatedTooltipStyle}>
                <View style={styles.tooltip}>
                  <ThemedText variant="caption" style={styles.tooltipText}>
                    {formatValue(data[selectedPointIndex].value)}
                  </ThemedText>
                  <ThemedText variant="caption" type="secondary" style={styles.tooltipDate}>
                    {formatDate(data[selectedPointIndex].date)}
                  </ThemedText>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </PanGestureHandler>
        
        {/* X-axis labels */}
        <View style={styles.xAxisLabels}>
          {labelIndices.map((index) => (
            <ThemedText 
              key={index} 
              variant="caption" 
              type="secondary" 
              style={styles.xAxisLabel}
            >
              {formatDate(data[index].date)}
            </ThemedText>
          ))}
        </View>
        
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <ThemedText variant="caption" type="secondary">
            {formatValue(maxValue)}
          </ThemedText>
          <ThemedText variant="caption" type="secondary">
            {formatValue(minValue)}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  title: {
    marginBottom: 16,
  },
  chartContainer: {
    position: 'relative',
  },
  svg: {
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  xAxisLabel: {
    textAlign: 'center',
    minWidth: 40,
  },
  yAxisLabels: {
    position: 'absolute',
    right: -40,
    top: 0,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tooltipDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
});

export default TrendChart;