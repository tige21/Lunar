import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type TrendDataPoint = {
  date: string;
  value: number;
  label?: string;
};

export type TrendChartProps = {
  data: TrendDataPoint[];
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  title?: string;
  unit?: string;
  period?: 'week' | 'month' | 'year';
};

export function TrendChart({
  data,
  height = 200,
  showGrid = true,
  showLabels = true,
  color = Colors.light.tint,
  fillColor,
  strokeWidth = 2,
  title,
  unit = '',
  period = 'week',
}: TrendChartProps) {
  const chartWidth = SCREEN_WIDTH - 40;
  const chartHeight = height - 40; // Account for padding
  const padding = 20;

  if (!data || data.length === 0) {
    return (
      <ThemedView style={[styles.container, { height }]}>
        <ThemedText type="caption" style={styles.noDataText}>
          No data available
        </ThemedText>
      </ThemedView>
    );
  }

  // Calculate min and max values for scaling
  const values = data.map(point => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Generate path for the line
  const generatePath = (): string => {
    const step = (chartWidth - padding * 2) / (data.length - 1);
    
    let path = '';
    
    data.forEach((point, index) => {
      const x = padding + index * step;
      const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - padding * 2);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  // Generate area path (filled area under the line)
  const generateAreaPath = (): string => {
    const linePath = generatePath();
    const step = (chartWidth - padding * 2) / (data.length - 1);
    
    let areaPath = linePath;
    
    // Close the path to create a filled area
    const lastX = padding + (data.length - 1) * step;
    const firstX = padding;
    const bottomY = chartHeight - padding;
    
    areaPath += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    
    return areaPath;
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const horizontalLines = 4;
    const verticalLines = data.length;

    if (showGrid) {
      // Horizontal grid lines
      for (let i = 0; i <= horizontalLines; i++) {
        const y = padding + (i / horizontalLines) * (chartHeight - padding * 2);
        lines.push(
          <Line
            key={`h-${i}`}
            x1={padding}
            y1={y}
            x2={chartWidth - padding}
            y2={y}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={0.5}
          />
        );
      }

      // Vertical grid lines
      const step = (chartWidth - padding * 2) / (data.length - 1);
      for (let i = 0; i < verticalLines; i++) {
        const x = padding + i * step;
        lines.push(
          <Line
            key={`v-${i}`}
            x1={x}
            y1={padding}
            x2={x}
            y2={chartHeight - padding}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={0.5}
          />
        );
      }
    }

    return lines;
  };

  // Generate data points (circles)
  const generateDataPoints = () => {
    const step = (chartWidth - padding * 2) / (data.length - 1);
    
    return data.map((point, index) => {
      const x = padding + index * step;
      const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - padding * 2);
      
      return (
        <Circle
          key={index}
          cx={x}
          cy={y}
          r={4}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      );
    });
  };

  // Generate labels
  const generateLabels = () => {
    if (!showLabels) return null;

    const step = (chartWidth - padding * 2) / (data.length - 1);
    
    return data.map((point, index) => {
      const x = padding + index * step;
      const shouldShow = index === 0 || index === data.length - 1 || index % 2 === 0;
      
      if (!shouldShow) return null;
      
      const formatLabel = (date: string) => {
        if (period === 'week') {
          return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        }
        if (period === 'month') {
          return new Date(date).getDate().toString();
        }
        return new Date(date).toLocaleDateString('en-US', { month: 'short' });
      };
      
      return (
        <SvgText
          key={index}
          x={x}
          y={chartHeight - 5}
          fontSize="12"
          fill="rgba(255, 255, 255, 0.6)"
          textAnchor="middle"
        >
          {formatLabel(point.date)}
        </SvgText>
      );
    });
  };

  const linePath = generatePath();
  const areaPath = generateAreaPath();
  const areaFillColor = fillColor || `${color}30`; // 30% opacity

  return (
    <ThemedView style={[styles.container, { height }]}>
      {title && (
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
      )}
      
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {generateGridLines()}
          
          {/* Area fill */}
          {fillColor !== 'none' && (
            <Path
              d={areaPath}
              fill={areaFillColor}
              fillOpacity={0.3}
            />
          )}
          
          {/* Line */}
          <Path
            d={linePath}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {generateDataPoints()}
          
          {/* Labels */}
          {generateLabels()}
        </Svg>
      </View>
      
      {/* Value range indicators */}
      <ThemedView style={styles.valueRange}>
        <ThemedText type="caption" style={styles.valueText}>
          {Math.round(minValue)}{unit}
        </ThemedText>
        <ThemedText type="caption" style={styles.valueText}>
          {Math.round(maxValue)}{unit}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  valueText: {
    opacity: 0.6,
  },
  noDataText: {
    textAlign: 'center',
    flex: 1,
    textAlignVertical: 'center',
    opacity: 0.6,
  },
});