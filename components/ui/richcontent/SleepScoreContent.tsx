import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

interface SleepScoreData {
  score: number;
  previousScore?: number;
  insights?: string[];
}

interface SleepScoreContentProps {
  data: SleepScoreData;
}

export const SleepScoreContent = memo(function SleepScoreContent({
  data,
}: SleepScoreContentProps) {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint');
  
  const { score, previousScore, insights } = data;
  const improvement = score - (previousScore || score);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colorScheme === 'dark' 
          ? ['rgba(91, 33, 182, 0.2)', 'rgba(139, 92, 246, 0.1)']
          : ['rgba(139, 92, 246, 0.1)', 'rgba(91, 33, 182, 0.05)']
        }
        style={styles.scoreContainer}
      >
        <View style={styles.scoreHeader}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.scoreIcon}
          >
            <IconSymbol name="moon.fill" size={20} color="white" />
          </LinearGradient>
          <View style={styles.scoreInfo}>
            <ThemedText style={styles.scoreTitle}>Sleep Score</ThemedText>
            <ThemedText style={styles.scoreSubtitle}>
              Last 7 days average
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.scoreDisplay}>
          <CircularProgress
            progress={score / 100}
            size={80}
            strokeWidth={8}
            color={score >= 80 ? Colors.semantic.success : score >= 70 ? '#F59E0B' : Colors.semantic.error}
            backgroundColor={colorScheme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'}
          />
          <View style={styles.scoreTextContainer}>
            <ThemedText style={styles.scoreValue}>{score}</ThemedText>
            <ThemedText style={styles.scoreMax}>/100</ThemedText>
          </View>
        </View>
        
        {improvement !== 0 && (
          <View style={styles.improvementContainer}>
            <LinearGradient
              colors={improvement > 0 
                ? [Colors.semantic.success + '20', Colors.semantic.success + '10']
                : [Colors.semantic.error + '20', Colors.semantic.error + '10']
              }
              style={styles.improvementBadge}
            >
              <IconSymbol 
                name={improvement > 0 ? 'arrow.up' : 'arrow.down'}
                size={12}
                color={improvement > 0 ? Colors.semantic.success : Colors.semantic.error}
              />
              <ThemedText style={[
                styles.improvementText,
                { color: improvement > 0 ? Colors.semantic.success : Colors.semantic.error }
              ]}>
                {Math.abs(improvement)} points
              </ThemedText>
            </LinearGradient>
          </View>
        )}
        
        {insights && insights.length > 0 && (
          <View style={styles.insightsContainer}>
            {insights.slice(0, 2).map((insight: string, index: number) => (
              <View key={index} style={styles.insightItem}>
                <View style={[styles.insightDot, { backgroundColor: tintColor as string }]} />
                <ThemedText style={styles.insightText}>{insight}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scoreContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  scoreSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 14,
    opacity: 0.6,
  },
  improvementContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  improvementText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  insightsContainer: {
    marginTop: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});

export default SleepScoreContent;