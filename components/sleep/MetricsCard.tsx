import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type MetricData = {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  color?: string;
  icon?: string;
};

export type MetricsCardProps = {
  metrics: MetricData[];
  title?: string;
  layout?: 'grid' | 'list' | 'horizontal';
  onMetricPress?: (metric: MetricData, index: number) => void;
  showTrends?: boolean;
  compact?: boolean;
};

export function MetricsCard({
  metrics,
  title,
  layout = 'grid',
  onMetricPress,
  showTrends = true,
  compact = false,
}: MetricsCardProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral'): string => {
    switch (trend) {
      case 'up':
        return Colors.semantic.success;
      case 'down':
        return Colors.semantic.error;
      default:
        return textColor;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral'): string => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const renderMetric = (metric: MetricData, index: number) => {
    const isInteractive = !!onMetricPress;
    const metricColor = metric.color || Colors.light.tint;

    const content = (
      <ThemedView
        style={[
          styles.metricItem,
          layout === 'list' && styles.listMetricItem,
          layout === 'horizontal' && styles.horizontalMetricItem,
          compact && styles.compactMetricItem,
          {
            backgroundColor: surfaceColor,
            borderColor: borderColor,
          },
        ]}
      >
        {metric.icon && (
          <ThemedText style={styles.metricIcon}>
            {metric.icon}
          </ThemedText>
        )}
        
        <ThemedView style={styles.metricContent}>
          <ThemedText
            type="label"
            style={[
              styles.metricLabel,
              compact && styles.compactLabel,
            ]}
          >
            {metric.label}
          </ThemedText>
          
          <ThemedView style={styles.metricValueContainer}>
            <ThemedText
              type={compact ? 'sleep-data' : 'metric'}
              style={[
                styles.metricValue,
                { color: metricColor },
                compact && styles.compactValue,
              ]}
            >
              {metric.value}
            </ThemedText>
            
            {metric.unit && (
              <ThemedText
                type="caption"
                style={[
                  styles.metricUnit,
                  { color: metricColor },
                ]}
              >
                {metric.unit}
              </ThemedText>
            )}
          </ThemedView>
          
          {showTrends && metric.trend && (
            <ThemedView style={styles.trendContainer}>
              <ThemedText
                style={[
                  styles.trendIcon,
                  { color: getTrendColor(metric.trend) },
                ]}
              >
                {getTrendIcon(metric.trend)}
              </ThemedText>
              {metric.trendValue && (
                <ThemedText
                  type="caption"
                  style={[
                    styles.trendValue,
                    { color: getTrendColor(metric.trend) },
                  ]}
                >
                  {metric.trendValue}
                </ThemedText>
              )}
            </ThemedView>
          )}
          
          {metric.description && !compact && (
            <ThemedText
              type="caption"
              style={styles.metricDescription}
            >
              {metric.description}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    );

    if (isInteractive) {
      return (
        <Pressable
          key={index}
          onPress={() => onMetricPress(metric, index)}
          style={[
            layout === 'grid' && styles.gridPressable,
            layout === 'horizontal' && styles.horizontalPressable,
          ]}
        >
          {content}
        </Pressable>
      );
    }

    return <ThemedView key={index}>{content}</ThemedView>;
  };

  const getContainerStyle = () => {
    switch (layout) {
      case 'list':
        return styles.listContainer;
      case 'horizontal':
        return styles.horizontalContainer;
      default:
        return styles.gridContainer;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {title && (
        <ThemedText type="heading" style={styles.title}>
          {title}
        </ThemedText>
      )}
      
      <ThemedView style={getContainerStyle()}>
        {metrics.map((metric, index) => renderMetric(metric, index))}
      </ThemedView>
    </ThemedView>
  );
}

// Predefined metric cards for common sleep metrics
export function SleepMetricsCard({
  sleepDuration,
  sleepEfficiency,
  deepSleep,
  remSleep,
  onMetricPress,
}: {
  sleepDuration: number; // in hours
  sleepEfficiency: number; // percentage
  deepSleep: number; // in hours
  remSleep: number; // in hours
  onMetricPress?: (metric: MetricData, index: number) => void;
}) {
  const metrics: MetricData[] = [
    {
      label: 'Sleep Duration',
      value: sleepDuration.toFixed(1),
      unit: 'h',
      trend: sleepDuration >= 7 ? 'up' : 'down',
      trendValue: sleepDuration >= 7 ? 'Good' : 'Low',
      icon: '⏰',
      color: Colors.sleepStages.light,
    },
    {
      label: 'Sleep Efficiency',
      value: sleepEfficiency,
      unit: '%',
      trend: sleepEfficiency >= 85 ? 'up' : sleepEfficiency >= 70 ? 'neutral' : 'down',
      trendValue: `${sleepEfficiency}%`,
      icon: '🎯',
      color: Colors.semantic.info,
    },
    {
      label: 'Deep Sleep',
      value: deepSleep.toFixed(1),
      unit: 'h',
      trend: deepSleep >= 1.5 ? 'up' : 'down',
      trendValue: `${Math.round((deepSleep / sleepDuration) * 100)}%`,
      icon: '🛌',
      color: Colors.sleepStages.deep,
    },
    {
      label: 'REM Sleep',
      value: remSleep.toFixed(1),
      unit: 'h',
      trend: remSleep >= 1.0 ? 'up' : 'down',
      trendValue: `${Math.round((remSleep / sleepDuration) * 100)}%`,
      icon: '🧠',
      color: Colors.sleepStages.rem,
    },
  ];

  return (
    <MetricsCard
      title="Sleep Metrics"
      metrics={metrics}
      layout="grid"
      onMetricPress={onMetricPress}
      showTrends={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  listContainer: {
    gap: 8,
  },
  horizontalContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listMetricItem: {
    width: '100%',
  },
  horizontalMetricItem: {
    flex: 1,
    minWidth: 120,
  },
  compactMetricItem: {
    padding: 12,
  },
  gridPressable: {
    flex: 1,
    minWidth: '47%',
  },
  horizontalPressable: {
    flex: 1,
  },
  metricIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 4,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    marginBottom: 8,
    opacity: 0.8,
  },
  compactLabel: {
    marginBottom: 4,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  metricValue: {
    // Styles handled by type
  },
  compactValue: {
    fontSize: 24,
    lineHeight: 28,
  },
  metricUnit: {
    marginLeft: 4,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  trendValue: {
    fontWeight: '600',
  },
  metricDescription: {
    opacity: 0.7,
    lineHeight: 16,
  },
});