import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MiniChart } from '@/components/ui/MiniChart';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface SleepTrendData {
  data: number[];
  period: string;
  trend: 'improving' | 'stable' | 'declining';
}

interface SleepTrendContentProps {
  data: SleepTrendData;
}

export const SleepTrendContent = memo(function SleepTrendContent({
  data,
}: SleepTrendContentProps) {
  const colorScheme = useColorScheme();
  const { data: chartData, period, trend } = data;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.1)']
          : ['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']
        }
        style={styles.trendContainer}
      >
        <View style={styles.trendHeader}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.trendIcon}
          >
            <IconSymbol name="chart.line.uptrend.xyaxis" size={18} color="white" />
          </LinearGradient>
          <View style={styles.trendInfo}>
            <ThemedText style={styles.trendTitle}>Sleep Trend</ThemedText>
            <ThemedText style={styles.trendSubtitle}>{period}</ThemedText>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <MiniChart
            data={chartData}
            height={80}
            color={trend === 'improving' ? Colors.semantic.success : '#F59E0B'}
            showGradient={true}
          />
        </View>
        
        <View style={styles.trendSummary}>
          <LinearGradient
            colors={trend === 'improving'
              ? [Colors.semantic.success + '20', Colors.semantic.success + '10']
              : ['#F59E0B20', '#F59E0B10']
            }
            style={styles.trendBadge}
          >
            <IconSymbol
              name={trend === 'improving' ? 'arrow.up.circle.fill' : 'minus.circle.fill'}
              size={16}
              color={trend === 'improving' ? Colors.semantic.success : '#F59E0B'}
            />
            <ThemedText style={[
              styles.trendText,
              { color: trend === 'improving' ? Colors.semantic.success : '#F59E0B' }
            ]}>
              {trend === 'improving' ? 'Improving trend' : 'Stable trend'}
            </ThemedText>
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  trendContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trendInfo: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  trendSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  chartContainer: {
    marginBottom: 16,
    height: 80,
  },
  trendSummary: {
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SleepTrendContent;