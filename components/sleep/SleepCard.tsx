import React from 'react';
import { StyleSheet, Pressable, type PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export type SleepCardProps = PressableProps & {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'metric' | 'compact';
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
};

export function SleepCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  trend,
  loading = false,
  style,
  children,
  ...rest
}: SleepCardProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#10B981'; // Success green
      case 'down':
        return '#EF4444'; // Error red
      default:
        return textColor;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '';
    }
  };

  const renderContent = () => (
    <ThemedView style={styles.content}>
      {icon && (
        <ThemedView style={styles.iconContainer}>
          {icon}
        </ThemedView>
      )}
      
      <ThemedView style={styles.textContainer}>
        <ThemedText type="label" style={styles.title}>
          {title}
        </ThemedText>
        
        {value && (
          <ThemedView style={styles.valueContainer}>
            <ThemedText
              type={variant === 'metric' ? 'metric' : 'sleep-data'}
              style={styles.value}
            >
              {value}
            </ThemedText>
            {trend && (
              <ThemedText
                style={[
                  styles.trend,
                  { color: getTrendColor() }
                ]}
              >
                {getTrendIcon()}
              </ThemedText>
            )}
          </ThemedView>
        )}
        
        {subtitle && (
          <ThemedText type="caption" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </ThemedView>
      
      {children}
    </ThemedView>
  );

  if (variant === 'gradient') {
    return (
      <Pressable
        style={[
          styles.card,
          variant === 'compact' && styles.compactCard,
          style
        ]}
        {...rest}
      >
        <LinearGradient
          colors={['#8B5CF6', '#5B21B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, styles.gradient]}
        />
        {renderContent()}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: surfaceColor,
          borderColor: borderColor,
        },
        variant === 'compact' && styles.compactCard,
        style
      ]}
      {...rest}
    >
      {renderContent()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  compactCard: {
    padding: 12,
  },
  gradient: {
    borderRadius: 16,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
    opacity: 0.8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  value: {
    flex: 1,
  },
  trend: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
});