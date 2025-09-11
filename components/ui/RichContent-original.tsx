import React, { memo } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { MiniChart } from '@/components/ui/MiniChart';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export type RichContentType = 
  | 'sleep_score'
  | 'sleep_trend'
  | 'sleep_phases'
  | 'bedtime_recommendation'
  | 'environment_tip'
  | 'progress_tracker'
  | 'sleep_comparison';

export interface RichContentData {
  type: RichContentType;
  data: any;
  metadata?: {
    title?: string;
    subtitle?: string;
    timestamp?: Date;
  };
}

interface RichContentProps {
  content: RichContentData;
  isUser?: boolean;
}

export const RichContent = memo(function RichContent({ content, isUser = false }: RichContentProps) {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const renderSleepScore = () => {
    const { score, previousScore, insights } = content.data;
    const improvement = score - (previousScore || score);
    
    return (
      <View style={styles.richContentContainer}>
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
  };

  const renderSleepTrend = () => {
    const { data, period, trend } = content.data;
    
    return (
      <View style={styles.richContentContainer}>
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
              data={data}
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
  };

  const renderSleepPhases = () => {
    const { deep, rem, light, awake, duration } = content.data;
    const total = deep + rem + light + awake;
    
    return (
      <View style={styles.richContentContainer}>
        <LinearGradient
          colors={colorScheme === 'dark'
            ? ['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.1)']
            : ['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.05)']
          }
          style={styles.phasesContainer}
        >
          <View style={styles.phasesHeader}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.phasesIcon}
            >
              <IconSymbol name="brain.head.profile" size={18} color="white" />
            </LinearGradient>
            <View style={styles.phasesInfo}>
              <ThemedText style={styles.phasesTitle}>Sleep Phases</ThemedText>
              <ThemedText style={styles.phasesSubtitle}>
                {duration} hours total
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.phasesChart}>
            <View style={styles.phasesBar}>
              <View style={[
                styles.phaseSegment,
                { 
                  flex: deep / total,
                  backgroundColor: Colors.sleepStages.deep,
                }
              ]} />
              <View style={[
                styles.phaseSegment,
                { 
                  flex: rem / total,
                  backgroundColor: Colors.sleepStages.rem,
                }
              ]} />
              <View style={[
                styles.phaseSegment,
                { 
                  flex: light / total,
                  backgroundColor: Colors.sleepStages.light,
                }
              ]} />
              <View style={[
                styles.phaseSegment,
                { 
                  flex: awake / total,
                  backgroundColor: Colors.sleepStages.awake,
                }
              ]} />
            </View>
          </View>
          
          <View style={styles.phasesLegend}>
            {[
              { label: 'Deep', value: deep, color: Colors.sleepStages.deep },
              { label: 'REM', value: rem, color: Colors.sleepStages.rem },
              { label: 'Light', value: light, color: Colors.sleepStages.light },
              { label: 'Awake', value: awake, color: Colors.sleepStages.awake },
            ].map((phase, index) => (
              <View key={index} style={styles.phaseItem}>
                <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
                <ThemedText style={styles.phaseLabel}>{phase.label}</ThemedText>
                <ThemedText style={styles.phaseValue}>
                  {phase.value.toFixed(1)}h
                </ThemedText>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderBedtimeRecommendation = () => {
    const { optimalBedtime, currentBedtime, adjustment, reasoning } = content.data;
    
    return (
      <View style={styles.richContentContainer}>
        <LinearGradient
          colors={colorScheme === 'dark'
            ? ['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.1)']
            : ['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.05)']
          }
          style={styles.bedtimeContainer}
        >
          <View style={styles.bedtimeHeader}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.bedtimeIcon}
            >
              <IconSymbol name="clock.fill" size={18} color="white" />
            </LinearGradient>
            <View style={styles.bedtimeInfo}>
              <ThemedText style={styles.bedtimeTitle}>Optimal Bedtime</ThemedText>
              <ThemedText style={styles.bedtimeSubtitle}>For better sleep</ThemedText>
            </View>
          </View>
          
          <View style={styles.timeComparison}>
            <View style={styles.timeItem}>
              <ThemedText style={styles.timeLabel}>Current</ThemedText>
              <ThemedText style={styles.timeValue}>{currentBedtime}</ThemedText>
            </View>
            <IconSymbol name="arrow.right" size={20} color={textColor as string} style={styles.arrow} />
            <View style={styles.timeItem}>
              <ThemedText style={styles.timeLabel}>Optimal</ThemedText>
              <ThemedText style={[styles.timeValue, styles.optimalTime]}>
                {optimalBedtime}
              </ThemedText>
            </View>
          </View>
          
          {adjustment && (
            <View style={styles.adjustmentContainer}>
              <LinearGradient
                colors={['#F59E0B20', '#D9770610']}
                style={styles.adjustmentBadge}
              >
                <IconSymbol name="clock.arrow.circlepath" size={14} color="#F59E0B" />
                <ThemedText style={[styles.adjustmentText, { color: '#F59E0B' }]}>
                  {adjustment}
                </ThemedText>
              </LinearGradient>
            </View>
          )}
          
          {reasoning && (
            <View style={styles.reasoningContainer}>
              <ThemedText style={styles.reasoningText}>{reasoning}</ThemedText>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderContent = () => {
    switch (content.type) {
      case 'sleep_score':
        return renderSleepScore();
      case 'sleep_trend':
        return renderSleepTrend();
      case 'sleep_phases':
        return renderSleepPhases();
      case 'bedtime_recommendation':
        return renderBedtimeRecommendation();
      default:
        return null;
    }
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContent : styles.aiContent
    ]}>
      {renderContent()}
    </View>
  );
});

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  userContent: {
    alignSelf: 'flex-end',
  },
  aiContent: {
    alignSelf: 'flex-start',
  },
  richContentContainer: {
    maxWidth: screenWidth * 0.85,
    minWidth: screenWidth * 0.6,
  },
  
  // Sleep Score Styles
  scoreContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(139, 92, 246, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  scoreSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  scoreMax: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  improvementContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'Inter',
  },
  insightsContainer: {
    marginTop: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  insightDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    marginRight: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.8,
  },
  
  // Sleep Trend Styles
  trendContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(16, 185, 129, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trendInfo: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  trendSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  chartContainer: {
    marginVertical: 12,
  },
  trendSummary: {
    alignItems: 'center',
    marginTop: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'Inter',
  },
  
  // Sleep Phases Styles
  phasesContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(59, 130, 246, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  phasesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  phasesIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phasesInfo: {
    flex: 1,
  },
  phasesTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  phasesSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  phasesChart: {
    marginBottom: 16,
  },
  phasesBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  phaseSegment: {
    height: '100%',
  },
  phasesLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  phaseValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  
  // Bedtime Recommendation Styles
  bedtimeContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(245, 158, 11, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bedtimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bedtimeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bedtimeInfo: {
    flex: 1,
  },
  bedtimeTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  bedtimeSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  timeComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timeItem: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  optimalTime: {
    color: '#F59E0B',
  },
  arrow: {
    marginHorizontal: 16,
    opacity: 0.5,
  },
  adjustmentContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  adjustmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  adjustmentText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'Inter',
  },
  reasoningContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.1)',
  },
  reasoningText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.8,
  },
});