import React from 'react';
import { ViewProps } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

export type SleepCardProps = ViewProps & {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  sleepStage?: 'deep' | 'rem' | 'light' | 'wake';
  trend?: 'up' | 'down' | 'stable';
  size?: 'compact' | 'default' | 'large';
  interactive?: boolean;
  loading?: boolean;
};

export function SleepCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  sleepStage,
  trend,
  size = 'default',
  interactive = false,
  loading = false,
  style,
  ...otherProps
}: SleepCardProps) {
  const getSleepStageColor = (stage?: string) => {
    switch (stage) {
      case 'deep':
        return '#1E1B3C';
      case 'rem':
        return '#3B1A78';
      case 'light':
        return '#4C1D95';
      case 'wake':
        return '#EA580C';
      default:
        return undefined;
    }
  };

  const getTrendColor = (trendDirection?: string) => {
    switch (trendDirection) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      case 'stable':
        return 'muted';
      default:
        return 'default';
    }
  };

  const getCardVariant = () => {
    switch (size) {
      case 'compact':
        return 'compact-card';
      case 'large':
        return 'metric-card';
      default:
        return 'sleep-card';
    }
  };

  const getCardHeight = () => {
    switch (size) {
      case 'compact':
        return 80;
      case 'large':
        return 140;
      default:
        return 120;
    }
  };

  const getShadow = () => {
    if (interactive) return 'soft';
    if (sleepStage) return 'glow';
    return 'soft';
  };

  return (
    <ThemedView
      variant={getCardVariant()}
      shadow={getShadow()}
      borderRadius="xl"
      style={[
        {
          minHeight: getCardHeight(),
          backgroundColor: getSleepStageColor(sleepStage),
          opacity: loading ? 0.7 : 1,
          padding: size === 'compact' ? 12 : size === 'large' ? 24 : 16,
        },
        style,
      ]}
      {...otherProps}
    >
      {/* Header with icon and title */}
      <ThemedView style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: size === 'compact' ? 8 : 12,
        justifyContent: 'space-between'
      }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {icon && (
            <ThemedView style={{ marginRight: 8 }}>
              {icon}
            </ThemedView>
          )}
          <ThemedText 
            type="label" 
            variant="secondary"
            style={{ 
              fontSize: size === 'compact' ? 11 : 12,
              flex: 1,
            }}
          >
            {title}
          </ThemedText>
        </ThemedView>
        {trend && (
          <ThemedText 
            type="caption" 
            variant={getTrendColor(trend)}
            style={{ fontSize: 16, marginLeft: 8 }}
          >
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </ThemedText>
        )}
      </ThemedView>

      {/* Main value */}
      <ThemedView style={{ 
        flexDirection: 'row', 
        alignItems: 'baseline', 
        marginBottom: subtitle ? 8 : 0,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ThemedText 
          type={size === 'compact' ? 'small-metric' : size === 'large' ? 'sleep-score' : 'sleep-data'}
          style={{
            color: sleepStage ? '#FFFFFF' : undefined,
            fontSize: size === 'compact' ? 18 : size === 'large' ? 48 : 28,
            textAlign: 'center'
          }}
        >
          {loading ? '••' : value}
        </ThemedText>
        {unit && !loading && (
          <ThemedText 
            type="body" 
            variant="secondary" 
            style={{ 
              marginLeft: 4,
              color: sleepStage ? 'rgba(255,255,255,0.8)' : undefined,
              fontSize: size === 'compact' ? 12 : size === 'large' ? 18 : 14,
            }}
          >
            {unit}
          </ThemedText>
        )}
      </ThemedView>

      {/* Subtitle */}
      {subtitle && (
        <ThemedView style={{ 
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <ThemedText 
            type="caption" 
            variant={getTrendColor(trend)}
            style={{
              fontSize: size === 'compact' ? 10 : 11,
              textAlign: 'center',
              color: sleepStage ? 'rgba(255,255,255,0.9)' : undefined,
            }}
          >
            {subtitle}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

export default SleepCard;