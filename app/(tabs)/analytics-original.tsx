// import * as FileSystem from 'expo-file-system';
// import * as Haptics from 'expo-haptics';
// import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
// import {
//   Alert,
//   Dimensions,
//   LayoutAnimation,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   Share,
//   StyleSheet
// } from 'react-native';
// import Animated, {
//   Extrapolate,
//   FadeInDown,
//   FadeInLeft,
//   FadeInUp,
//   interpolate,
//   SlideInDown,
//   useAnimatedStyle,
//   useSharedValue,
//   withDelay,
//   withSequence,
//   withSpring,
//   withTiming
// } from 'react-native-reanimated';
// import { captureRef } from 'react-native-view-shot';

// // UI Components
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import CorrelationChart from '@/components/ui/CorrelationChart';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import { MetricsCard } from '@/components/ui/MetricsCard';
// import { SafeContainer } from '@/components/ui/SafeContainer';
// import SleepGoalProgressCard from '@/components/ui/SleepGoalProgressCard';
// import { SleepPhaseChart } from '@/components/ui/SleepPhaseChart';
// import { ThemedButton } from '@/components/ui/ThemedButton';
// import { TrendChart } from '@/components/ui/TrendChart';

// // Hooks and Utils
// import { Colors } from '@/constants/Colors';
// import { useThemeColor } from '@/hooks/useThemeColor';

// // Services
// import { analyticsService } from '@/lib/services';
// import sleepService, { type SleepData } from '@/lib/services/sleepService';

// // Types
// interface AnalyticsData {
//   sleepScores: { date: string; value: number }[];
//   sleepEfficiency: { date: string; value: number }[];
//   sleepDuration: { date: string; value: number }[];
//   bedtimeConsistency: { date: string; value: number }[];
//   sleepDebt: { date: string; value: number }[];
//   weekdayVsWeekend: {
//     weekday: { duration: number; efficiency: number; score: number };
//     weekend: { duration: number; efficiency: number; score: number };
//   };
//   currentSleepData: SleepData | null;
//   sleepQualityTrend: 'improving' | 'declining' | 'stable';
//   consistencyScore: number;
//   sleepGoal: { target: number; current: number };
//   insights: string[];
//   environmentCorrelations: { factor: string; impact: number }[];
// }

// interface AnalyticsState {
//   data: AnalyticsData | null;
//   isLoading: boolean;
//   error: string | null;
//   selectedPeriod: 'week' | 'month' | 'year';
//   selectedChart: 'scores' | 'efficiency' | 'duration' | 'consistency' | 'debt';
//   selectedInsightCategory: 'overview' | 'patterns' | 'environment' | 'goals';
//   showAdvancedMetrics: boolean;
//   chartInteractionEnabled: boolean;
// }

// const { width, height } = Dimensions.get('window');
// const chartHeight = 200;

// export default function AnalyticsScreen() {
//   const [state, setState] = useState<AnalyticsState>({
//     data: null,
//     isLoading: true,
//     error: null,
//     selectedPeriod: 'week',
//     selectedChart: 'scores',
//     selectedInsightCategory: 'overview',
//     showAdvancedMetrics: false,
//     chartInteractionEnabled: true
//   });
//   const [refreshing, setRefreshing] = useState(false);
//   const [showExportMenu, setShowExportMenu] = useState(false);
//   const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(null);

//   const chartRef = useRef(null);
//   const scrollRef = useRef<ScrollView>(null);
//   const scrollAnimation = useSharedValue(0);
//   const cardAnimation = useSharedValue(0);
//   const headerAnimation = useSharedValue(0);
//   const insightAnimation = useSharedValue(0);
//   const pulseAnimation = useSharedValue(1);

//   const primaryColor = useThemeColor({}, 'tint');
//   const backgroundColor = useThemeColor({}, 'background');
//   const textColor = useThemeColor({}, 'text');
//   const surfaceColor = useThemeColor({}, 'surface');

//   useEffect(() => {
//     loadAnalyticsData();
    
//     // Track screen view
//     analyticsService.trackScreen('analytics');
//   }, [state.selectedPeriod]);

//   useEffect(() => {
//     if (state.data) {
//       cardAnimation.value = withTiming(1, { duration: 800 });
//       insightAnimation.value = withDelay(400, withTiming(1, { duration: 600 }));
//       // Add subtle pulse effect for key metrics
//       pulseAnimation.value = withSequence(
//         withDelay(1000, withTiming(1.02, { duration: 1000 })),
//         withTiming(1, { duration: 1000 })
//       );
//     }
//   }, [state.data]);

//   // Memoize expensive data generation to prevent recalculation on every render
//   const cachedAnalyticsData = useMemo(() => {
//     return generateMockAnalyticsData(state.selectedPeriod);
//   }, [state.selectedPeriod]);
  
//   const loadAnalyticsData = useCallback(async () => {
//     try {
//       setState(prev => ({ ...prev, isLoading: true, error: null }));
      
//       // Use cached data instead of regenerating
//       const currentData = await sleepService.getCurrentSleepData();
      
//       // Reduce loading simulation time for better UX
//       await new Promise(resolve => setTimeout(resolve, 300));
      
//       // Add layout animation for smooth transitions
//       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
//       setState(prev => ({
//         ...prev,
//         data: { ...cachedAnalyticsData, currentSleepData: currentData },
//         isLoading: false,
//         error: null
//       }));
      
//     } catch (error) {
//       setState(prev => ({
//         ...prev,
//         isLoading: false,
//         error: 'Failed to load analytics data'
//       }));
//     }
//   }, [cachedAnalyticsData]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     analyticsService.track('analytics_refresh', { period: state.selectedPeriod });
//     await loadAnalyticsData();
//     setRefreshing(false);
//   };

//   const changePeriod = (period: 'week' | 'month' | 'year') => {
//     if (period !== state.selectedPeriod) {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//       setState(prev => ({ ...prev, selectedPeriod: period }));
//       analyticsService.track('analytics_period_change', { period });
      
//       // Reset animations for new data
//       cardAnimation.value = 0;
//       insightAnimation.value = 0;
//     }
//   };

//   const changeChart = (chart: AnalyticsState['selectedChart']) => {
//     if (chart !== state.selectedChart) {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//       setState(prev => ({ ...prev, selectedChart: chart }));
//       analyticsService.track('analytics_chart_change', { chart });
//       setSelectedDataPoint(null); // Reset selection when changing charts
//     }
//   };
  
//   const toggleAdvancedMetrics = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setState(prev => ({ ...prev, showAdvancedMetrics: !prev.showAdvancedMetrics }));
//     analyticsService.track('analytics_advanced_toggle', { enabled: !state.showAdvancedMetrics });
//   };
  
//   const changeInsightCategory = (category: AnalyticsState['selectedInsightCategory']) => {
//     if (category !== state.selectedInsightCategory) {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//       setState(prev => ({ ...prev, selectedInsightCategory: category }));
//       analyticsService.track('analytics_insight_category', { category });
//     }
//   };

//   const exportData = async (format: 'image' | 'csv') => {
//     try {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
//       if (format === 'image' && chartRef.current) {
//         const uri = await captureRef(chartRef.current, {
//           format: 'png',
//           quality: 1.0,
//         });
        
//         await Share.share({
//           url: uri,
//           title: `Sleep Analytics - ${state.selectedPeriod}`,
//         });
//       } else if (format === 'csv' && state.data) {
//         const csvData = generateCSVData(state.data, state.selectedChart);
//         const fileUri = FileSystem.documentDirectory + `sleep-analytics-${Date.now()}.csv`;
        
//         await FileSystem.writeAsStringAsync(fileUri, csvData);
//         await Share.share({
//           url: fileUri,
//           title: 'Sleep Analytics Data',
//         });
//       }
      
//       analyticsService.track('analytics_export', { format, period: state.selectedPeriod });
//       setShowExportMenu(false);
      
//     } catch (error) {
//       Alert.alert('Export Failed', 'Unable to export data. Please try again.');
//     }
//   };

//   // Memoize chart data selection to prevent unnecessary recalculations
//   const getCurrentChartData = useCallback(() => {
//     if (!state.data) return [];
    
//     switch (state.selectedChart) {
//       case 'scores': return state.data.sleepScores;
//       case 'efficiency': return state.data.sleepEfficiency;
//       case 'duration': return state.data.sleepDuration;
//       case 'consistency': return state.data.bedtimeConsistency;
//       case 'debt': return state.data.sleepDebt;
//       default: return state.data.sleepScores;
//     }
//   }, [state.data, state.selectedChart]);

//   const getChartTitle = () => {
//     switch (state.selectedChart) {
//       case 'scores': return 'Sleep Quality Scores';
//       case 'efficiency': return 'Sleep Efficiency';
//       case 'duration': return 'Sleep Duration';
//       case 'consistency': return 'Bedtime Consistency';
//       case 'debt': return 'Sleep Debt';
//       default: return 'Sleep Metrics';
//     }
//   };

//   const getChartColor = () => {
//     switch (state.selectedChart) {
//       case 'scores': return primaryColor;
//       case 'efficiency': return Colors.semantic.success;
//       case 'duration': return Colors.sleepStages.deep;
//       case 'consistency': return Colors.semantic.info;
//       case 'debt': return Colors.semantic.warning;
//       default: return primaryColor;
//     }
//   };

//   const formatChartValue = (value: number) => {
//     switch (state.selectedChart) {
//       case 'scores': return `${value}`;
//       case 'efficiency': return `${value}%`;
//       case 'duration': return `${(value / 60).toFixed(1)}h`;
//       case 'consistency': return `${value}%`;
//       case 'debt': return `${(value / 60).toFixed(1)}h`;
//       default: return value.toString();
//     }
//   };

//   const animatedScrollStyle = useAnimatedStyle(() => {
//     return {
//       opacity: interpolate(scrollAnimation.value, [0, 100], [1, 0.8], Extrapolate.CLAMP),
//       transform: [{
//         translateY: interpolate(scrollAnimation.value, [0, 100], [0, -10], Extrapolate.CLAMP)
//       }]
//     };
//   });

//   const animatedCardStyle = useAnimatedStyle(() => {
//     return {
//       opacity: cardAnimation.value,
//       transform: [
//         { translateY: interpolate(cardAnimation.value, [0, 1], [30, 0], Extrapolate.CLAMP) },
//         { scale: interpolate(cardAnimation.value, [0, 1], [0.95, 1], Extrapolate.CLAMP) }
//       ]
//     };
//   });
  
//   const animatedHeaderStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{
//         translateY: interpolate(scrollAnimation.value, [0, 50], [0, -20], Extrapolate.CLAMP)
//       }],
//       opacity: interpolate(scrollAnimation.value, [0, 100], [1, 0.9], Extrapolate.CLAMP)
//     };
//   });
  
//   const animatedInsightStyle = useAnimatedStyle(() => {
//     return {
//       opacity: insightAnimation.value,
//       transform: [{ 
//         translateY: interpolate(insightAnimation.value, [0, 1], [20, 0], Extrapolate.CLAMP)
//       }]
//     };
//   });
  
//   const animatedPulseStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: pulseAnimation.value }]
//     };
//   });

//   if (state.isLoading) {
//     return (
//       <SafeContainer>
//         <ThemedView style={styles.loadingContainer}>
//           <Animated.View entering={FadeInUp}>
//             <IconSymbol
//               name="chart.bar.fill"
//               size={60}
//               color={primaryColor}
//               style={styles.loadingIcon}
//             />
//             <ThemedText type="title" style={styles.loadingText}>
//               Analyzing your sleep data...
//             </ThemedText>
//             <ThemedText type="body" variant="secondary" style={styles.loadingSubtext}>
//               This may take a moment
//             </ThemedText>
//           </Animated.View>
//         </ThemedView>
//       </SafeContainer>
//     );
//   }

//   if (state.error) {
//     return (
//       <SafeContainer>
//         <ThemedView style={styles.errorContainer}>
//           <IconSymbol
//             name="exclamationmark.triangle.fill"
//             size={60}
//             color={Colors.semantic.error}
//             style={styles.errorIcon}
//           />
//           <ThemedText type="title" style={[styles.errorText, { color: Colors.semantic.error }]}>
//             {state.error}
//           </ThemedText>
//           <ThemedButton
//             variant="primary"
//             onPress={loadAnalyticsData}
//             style={styles.retryButton}
//           >
//             Try Again
//           </ThemedButton>
//         </ThemedView>
//       </SafeContainer>
//     );
//   }

//   const { data } = state;

//   return (
//     <SafeContainer>
//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         showsVerticalScrollIndicator={false}
//         onScroll={(e) => {
//           scrollAnimation.value = e.nativeEvent.contentOffset.y;
//         }}
//         scrollEventThrottle={16}
//       >
//         {/* Enhanced Header with Better Visual Hierarchy */}
//         <Animated.View entering={FadeInUp.delay(100)} style={[animatedScrollStyle, animatedHeaderStyle]}>
//           <ThemedView style={styles.header}>
//             <ThemedView style={styles.headerContent}>
//               <ThemedView style={styles.headerTitleRow}>
//                 <ThemedText type="title" variant="primary" style={styles.headerTitle}>
//                   Sleep Analytics
//                 </ThemedText>
//                 {data?.sleepQualityTrend && (
//                   <Animated.View style={animatedPulseStyle}>
//                     <ThemedView style={[
//                       styles.trendBadge,
//                       { backgroundColor: getTrendBadgeColor(data.sleepQualityTrend) + '20' }
//                     ]}>
//                       <IconSymbol
//                         name={getTrendBadgeIcon(data.sleepQualityTrend)}
//                         size={14}
//                         color={getTrendBadgeColor(data.sleepQualityTrend)}
//                       />
//                       <ThemedText 
//                         type="caption" 
//                         style={[styles.trendBadgeText, { color: getTrendBadgeColor(data.sleepQualityTrend) }]}
//                       >
//                         {data.sleepQualityTrend}
//                       </ThemedText>
//                     </ThemedView>
//                   </Animated.View>
//                 )}
//               </ThemedView>
//               <ThemedText type="body" variant="secondary" style={styles.headerSubtitle}>
//                 Deep insights into your sleep patterns • {state.selectedPeriod === 'week' ? '7 days' : state.selectedPeriod === 'month' ? '30 days' : '365 days'}
//               </ThemedText>
//             </ThemedView>
            
//             <ThemedView style={styles.headerActions}>
//               <Pressable
//                 onPress={toggleAdvancedMetrics}
//                 style={[styles.actionButton, state.showAdvancedMetrics && { backgroundColor: primaryColor + '20' }]}
//               >
//                 <IconSymbol
//                   name="chart.bar.xaxis"
//                   size={20}
//                   color={state.showAdvancedMetrics ? primaryColor : textColor}
//                 />
//               </Pressable>
//               <Pressable
//                 onPress={() => setShowExportMenu(!showExportMenu)}
//                 style={styles.actionButton}
//               >
//                 <IconSymbol
//                   name="square.and.arrow.up"
//                   size={20}
//                   color={primaryColor}
//                 />
//               </Pressable>
//             </ThemedView>
//           </ThemedView>
//         </Animated.View>

//         {/* Export Menu */}
//         {showExportMenu && (
//           <Animated.View entering={FadeInDown.duration(200)}>
//             <ThemedView variant="card" style={styles.exportMenu}>
//               <ThemedText type="subtitle" style={styles.exportTitle}>
//                 Export Data
//               </ThemedText>
//               <ThemedView style={styles.exportButtons}>
//                 <ThemedButton
//                   variant="outline"
//                   size="sm"
//                   onPress={() => exportData('image')}
//                   leftIcon={<IconSymbol name="photo" size={16} color={primaryColor} />}
//                 >
//                   Save as Image
//                 </ThemedButton>
//                 <ThemedButton
//                   variant="outline"
//                   size="sm"
//                   onPress={() => exportData('csv')}
//                   leftIcon={<IconSymbol name="doc.text" size={16} color={primaryColor} />}
//                 >
//                   Export CSV
//                 </ThemedButton>
//               </ThemedView>
//             </ThemedView>
//           </Animated.View>
//         )}

//         {/* Time Period Selector */}
//         <Animated.View entering={FadeInDown.delay(200)} style={animatedCardStyle}>
//           <ThemedView style={styles.periodSelector}>
//             <PeriodTab
//               title="Week"
//               isSelected={state.selectedPeriod === 'week'}
//               onPress={() => changePeriod('week')}
//             />
//             <PeriodTab
//               title="Month"
//               isSelected={state.selectedPeriod === 'month'}
//               onPress={() => changePeriod('month')}
//             />
//             <PeriodTab
//               title="Year"
//               isSelected={state.selectedPeriod === 'year'}
//               onPress={() => changePeriod('year')}
//             />
//           </ThemedView>
//         </Animated.View>

//         {/* Enhanced Overview Metrics with Better Spacing */}
//         <Animated.View entering={FadeInDown.delay(300)} style={animatedCardStyle}>
//           <ThemedView style={styles.metricsSection}>
//             <ThemedView style={styles.sectionHeader}>
//               <ThemedText type="subtitle" style={styles.sectionTitle}>
//                 Sleep Overview
//               </ThemedText>
//               {data?.consistencyScore && (
//                 <ThemedView style={styles.consistencyBadge}>
//                   <ThemedText type="caption" style={styles.consistencyText}>
//                     {data.consistencyScore}% consistent
//                   </ThemedText>
//                 </ThemedView>
//               )}
//             </ThemedView>
            
//             <ThemedView style={styles.metricsGrid}>
//               <MetricsCard
//                 title="Sleep Quality"
//                 value={data?.sleepScores.reduce((sum, d) => sum + d.value, 0) / data?.sleepScores.length || 0}
//                 format="score"
//                 icon="star.fill"
//                 color={primaryColor}
//                 trend={5}
//                 subtitle="Daily average"
//                 interactive={true}
//                 showGlow={true}
//                 onPress={() => changeChart('scores')}
//                 delay={100}
//               />
//               <MetricsCard
//                 title="Sleep Duration"
//                 value={data?.sleepDuration.reduce((sum, d) => sum + d.value, 0) / data?.sleepDuration.length || 0}
//                 format="duration"
//                 icon="moon.fill"
//                 color={Colors.sleepStages.deep}
//                 trend={15}
//                 subtitle="Nightly average"
//                 interactive={true}
//                 onPress={() => changeChart('duration')}
//                 delay={200}
//               />
//               <MetricsCard
//                 title="Sleep Efficiency"
//                 value={data?.sleepEfficiency.reduce((sum, d) => sum + d.value, 0) / data?.sleepEfficiency.length || 0}
//                 format="percentage"
//                 icon="chart.line.uptrend.xyaxis"
//                 color={Colors.semantic.success}
//                 trend={3}
//                 subtitle="Time asleep vs bed"
//                 interactive={true}
//                 onPress={() => changeChart('efficiency')}
//                 delay={300}
//               />
//               <MetricsCard
//                 title="Bedtime Consistency"
//                 value={data?.bedtimeConsistency.reduce((sum, d) => sum + d.value, 0) / data?.bedtimeConsistency.length || 0}
//                 format="percentage"
//                 icon="clock.fill"
//                 color={Colors.semantic.info}
//                 trend={-2}
//                 subtitle="Schedule regularity"
//                 interactive={true}
//                 onPress={() => changeChart('consistency')}
//                 delay={400}
//               />
//             </ThemedView>
            
//             {/* Advanced Metrics - Show when toggled */}
//             {state.showAdvancedMetrics && (
//               <Animated.View entering={SlideInDown.duration(400)}>
//                 <ThemedView style={styles.advancedMetrics}>
//                   <ThemedView style={styles.advancedMetricsHeader}>
//                     <ThemedText type="defaultSemiBold" style={styles.advancedTitle}>
//                       Advanced Metrics
//                     </ThemedText>
//                   </ThemedView>
//                   <ThemedView style={styles.advancedMetricsGrid}>
//                     <MetricsCard
//                       title="Sleep Debt"
//                       value={data?.sleepDebt.reduce((sum, d) => sum + d.value, 0) / data?.sleepDebt.length || 0}
//                       format="duration"
//                       icon="minus.circle.fill"
//                       color={Colors.semantic.warning}
//                       trend={-8}
//                       subtitle="Cumulative deficit"
//                       size="small"
//                       interactive={true}
//                       onPress={() => changeChart('debt')}
//                       delay={500}
//                     />
//                     <MetricsCard
//                       title="REM Sleep"
//                       value={data?.currentSleepData?.phases.rem ? data.currentSleepData.phases.rem * 100 : 22}
//                       format="percentage"
//                       icon="brain.head.profile"
//                       color={Colors.sleepStages.rem}
//                       trend={2}
//                       subtitle="Of total sleep"
//                       size="small"
//                       delay={600}
//                     />
//                     <MetricsCard
//                       title="Deep Sleep"
//                       value={data?.currentSleepData?.phases.deep ? data.currentSleepData.phases.deep * 100 : 18}
//                       format="percentage"
//                       icon="moon.stars.fill"
//                       color={Colors.sleepStages.deep}
//                       trend={-1}
//                       subtitle="Of total sleep"
//                       size="small"
//                       delay={700}
//                     />
//                     <MetricsCard
//                       title="Wake Episodes"
//                       value={data?.currentSleepData?.phases.wake ? data.currentSleepData.phases.wake * 10 : 3}
//                       format="number"
//                       icon="eye.fill"
//                       color={Colors.semantic.warning}
//                       trend={-12}
//                       subtitle="Per night"
//                       size="small"
//                       delay={800}
//                     />
//                   </ThemedView>
//                 </ThemedView>
//               </Animated.View>
//             )}
//           </ThemedView>
//         </Animated.View>

//         {/* Chart Type Selector */}
//         <Animated.View entering={FadeInDown.delay(400)} style={animatedCardStyle}>
//           <ThemedView style={styles.chartSelector}>
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.chartSelectorContent}
//             >
//               <ChartTab
//                 title="Scores"
//                 icon="star.fill"
//                 isSelected={state.selectedChart === 'scores'}
//                 onPress={() => changeChart('scores')}
//                 color={primaryColor}
//               />
//               <ChartTab
//                 title="Efficiency"
//                 icon="chart.line.uptrend.xyaxis"
//                 isSelected={state.selectedChart === 'efficiency'}
//                 onPress={() => changeChart('efficiency')}
//                 color={Colors.semantic.success}
//               />
//               <ChartTab
//                 title="Duration"
//                 icon="moon.fill"
//                 isSelected={state.selectedChart === 'duration'}
//                 onPress={() => changeChart('duration')}
//                 color={Colors.sleepStages.deep}
//               />
//               <ChartTab
//                 title="Consistency"
//                 icon="clock.fill"
//                 isSelected={state.selectedChart === 'consistency'}
//                 onPress={() => changeChart('consistency')}
//                 color={Colors.semantic.info}
//               />
//               <ChartTab
//                 title="Sleep Debt"
//                 icon="minus.circle.fill"
//                 isSelected={state.selectedChart === 'debt'}
//                 onPress={() => changeChart('debt')}
//                 color={Colors.semantic.warning}
//               />
//             </ScrollView>
//           </ThemedView>
//         </Animated.View>

//         {/* Enhanced Main Chart with Interactive Features */}
//         <Animated.View 
//           entering={FadeInDown.delay(500)} 
//           style={animatedCardStyle}
//           ref={chartRef}
//           collapsable={false}
//         >
//           <ThemedView style={styles.chartSection}>
//             <ThemedView style={styles.chartHeader}>
//               <ThemedView style={styles.chartTitleContainer}>
//                 <ThemedText type="subtitle" style={styles.chartTitle}>
//                   {getChartTitle()}
//                 </ThemedText>
//                 <ThemedText type="caption" variant="secondary" style={styles.chartSubtitle}>
//                   {getChartDescription(state.selectedChart)}
//                 </ThemedText>
//               </ThemedView>
//               <ThemedView style={styles.chartControls}>
//                 <Pressable
//                   onPress={() => setState(prev => ({ ...prev, chartInteractionEnabled: !prev.chartInteractionEnabled }))}
//                   style={[styles.chartControlButton, state.chartInteractionEnabled && { backgroundColor: primaryColor + '20' }]}
//                 >
//                   <IconSymbol
//                     name={state.chartInteractionEnabled ? "hand.tap.fill" : "hand.tap"}
//                     size={16}
//                     color={state.chartInteractionEnabled ? primaryColor : Colors.semantic.info}
//                   />
//                 </Pressable>
//               </ThemedView>
//             </ThemedView>
            
//             <TrendChart
//               data={getCurrentChartData()}
//               height={chartHeight}
//               color={getChartColor()}
//               formatValue={formatChartValue}
//               showGradient={true}
//               showPoints={true}
//               interactive={state.chartInteractionEnabled}
//               onDataPointPress={(point, index) => {
//                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                 setSelectedDataPoint(index);
//                 analyticsService.track('chart_data_point_pressed', {
//                   chart: state.selectedChart,
//                   value: point.value,
//                   date: point.date
//                 });
//               }}
//             />
            
//             {/* Chart Insights */}
//             {selectedDataPoint !== null && getCurrentChartData()[selectedDataPoint] && (
//               <Animated.View entering={FadeInUp.duration(300)} style={styles.chartInsight}>
//                 <ThemedView style={styles.chartInsightContent}>
//                   <ThemedText type="caption" variant="secondary">
//                     {new Date(getCurrentChartData()[selectedDataPoint].date).toLocaleDateString('en-US', { 
//                       weekday: 'long', 
//                       month: 'short', 
//                       day: 'numeric' 
//                     })}
//                   </ThemedText>
//                   <ThemedText type="defaultSemiBold" style={[styles.chartInsightValue, { color: getChartColor() }]}>
//                     {formatChartValue(getCurrentChartData()[selectedDataPoint].value)}
//                   </ThemedText>
//                   <ThemedText type="caption">
//                     {getDataPointInsight(getCurrentChartData()[selectedDataPoint], state.selectedChart)}
//                   </ThemedText>
//                 </ThemedView>
//               </Animated.View>
//             )}
//           </ThemedView>
//         </Animated.View>

//         {/* Sleep Phase Analysis */}
//         {data?.currentSleepData && (
//           <Animated.View entering={FadeInDown.delay(600)} style={animatedCardStyle}>
//             <SleepPhaseChart
//               phases={[
//                 { phase: 'deep', duration: Math.round(data.currentSleepData.phases.deep * 4.8), percentage: data.currentSleepData.phases.deep },
//                 { phase: 'rem', duration: Math.round(data.currentSleepData.phases.rem * 4.8), percentage: data.currentSleepData.phases.rem },
//                 { phase: 'light', duration: Math.round(data.currentSleepData.phases.light * 4.8), percentage: data.currentSleepData.phases.light },
//                 { phase: 'awake', duration: Math.round(data.currentSleepData.phases.wake * 4.8), percentage: data.currentSleepData.phases.wake }
//               ]}
//               totalDuration={480}
//               interactive={true}
//               animated={true}
//             />
//           </Animated.View>
//         )}

//         {/* Sleep Goal Progress Card */}
//         {data?.sleepGoal && (
//           <Animated.View entering={FadeInDown.delay(600)} style={animatedCardStyle}>
//             <SleepGoalProgressCard
//               goalHours={data.sleepGoal.target / 60} // Convert minutes to hours
//               currentAverage={data.sleepDuration.reduce((sum, d) => sum + d.value, 0) / data.sleepDuration.length / 60}
//               weeklyData={data.sleepDuration.slice(-7).map(d => d.value / 60)} // Last 7 days in hours
//               consistency={data.consistencyScore}
//               streak={7} // Mock streak data
//               onGoalAdjust={(newGoal) => {
//                 analyticsService.track('sleep_goal_adjusted', { newGoal });
//                 // In a real app, this would update the user's goal
//               }}
//               onViewDetails={() => {
//                 analyticsService.track('goal_details_viewed');
//                 // Navigate to detailed goal view
//               }}
//               animated={true}
//               interactive={true}
//             />
//           </Animated.View>
//         )}
        
//         {/* Environment Correlations */}
//         {data?.environmentCorrelations && (
//           <Animated.View entering={FadeInDown.delay(650)} style={animatedCardStyle}>
//             <ThemedView variant="card" style={styles.correlationCard}>
//               <CorrelationChart
//                 factors={[
//                   {
//                     id: 'temperature',
//                     name: 'Room Temperature',
//                     icon: 'thermometer',
//                     correlation: 0.72,
//                     impact: 'high',
//                     trend: 'improving',
//                     description: 'Cooler temperatures (65-68°F) correlate with better sleep quality and deeper sleep phases.',
//                     values: [22, 19, 20, 18, 17, 19, 18]
//                   },
//                   {
//                     id: 'exercise',
//                     name: 'Daily Exercise',
//                     icon: 'figure.run',
//                     correlation: 0.64,
//                     impact: 'high',
//                     trend: 'stable',
//                     description: 'Regular exercise improves sleep quality, but avoid intense workouts 3+ hours before bedtime.',
//                     values: [45, 30, 60, 40, 50, 35, 55]
//                   },
//                   {
//                     id: 'screen_time',
//                     name: 'Evening Screen Time',
//                     icon: 'iphone',
//                     correlation: -0.58,
//                     impact: 'medium',
//                     trend: 'declining',
//                     description: 'Blue light exposure before bed disrupts melatonin production and sleep onset.',
//                     values: [120, 90, 135, 110, 95, 140, 85]
//                   },
//                   {
//                     id: 'caffeine',
//                     name: 'Caffeine Intake',
//                     icon: 'cup.and.saucer.fill',
//                     correlation: -0.41,
//                     impact: 'medium',
//                     trend: 'stable',
//                     description: 'Caffeine consumed within 6 hours of bedtime can significantly impact sleep quality.',
//                     values: [2, 3, 1, 2, 3, 2, 1]
//                   },
//                   {
//                     id: 'noise',
//                     name: 'Environmental Noise',
//                     icon: 'speaker.wave.2.fill',
//                     correlation: -0.35,
//                     impact: 'low',
//                     trend: 'improving',
//                     description: 'Consistent background noise or complete silence promotes better sleep continuity.',
//                     values: [35, 28, 42, 30, 25, 38, 20]
//                   }
//                 ]}
//                 onFactorPress={(factor) => {
//                   analyticsService.track('correlation_factor_viewed', { factor: factor.name });
//                 }}
//                 showTrends={true}
//                 animated={true}
//                 interactive={true}
//               />
//             </ThemedView>
//           </Animated.View>
//         )}
        
//         {/* Weekday vs Weekend Comparison */}
//         <Animated.View entering={FadeInDown.delay(700)} style={animatedCardStyle}>
//           <ThemedView variant="card" style={styles.comparisonCard}>
//             <ThemedText type="subtitle" style={styles.sectionTitle}>
//               Weekday vs Weekend
//             </ThemedText>
            
//             <ThemedView style={styles.comparisonContent}>
//               <ComparisonColumn
//                 title="Weekdays"
//                 data={data?.weekdayVsWeekend.weekday}
//                 color={Colors.semantic.info}
//               />
//               <ThemedView style={styles.comparisonDivider} />
//               <ComparisonColumn
//                 title="Weekends"
//                 data={data?.weekdayVsWeekend.weekend}
//                 color={Colors.semantic.success}
//               />
//             </ThemedView>
//           </ThemedView>
//         </Animated.View>

//         {/* Enhanced Smart Insights with Categories */}
//         {data?.insights && (
//           <Animated.View entering={FadeInDown.delay(800)} style={[animatedCardStyle, animatedInsightStyle]}>
//             <ThemedView variant="card" style={styles.insightsCard}>
//               <ThemedView style={styles.insightsHeader}>
//                 <ThemedView style={styles.insightsTitleRow}>
//                   <IconSymbol
//                     name="brain.head.profile"
//                     size={24}
//                     color={Colors.semantic.warning}
//                   />
//                   <ThemedText type="subtitle" style={styles.insightsTitle}>
//                     Smart Insights
//                   </ThemedText>
//                 </ThemedView>
                
//                 {/* Insight Category Tabs */}
//                 <ThemedView style={styles.insightTabs}>
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                     {(['overview', 'patterns', 'environment', 'goals'] as const).map((category) => (
//                       <Pressable
//                         key={category}
//                         onPress={() => changeInsightCategory(category)}
//                         style={[
//                           styles.insightTab,
//                           state.selectedInsightCategory === category && {
//                             backgroundColor: primaryColor + '20',
//                             borderColor: primaryColor + '40'
//                           }
//                         ]}
//                       >
//                         <IconSymbol
//                           name={getInsightCategoryIcon(category)}
//                           size={14}
//                           color={state.selectedInsightCategory === category ? primaryColor : Colors.semantic.info}
//                         />
//                         <ThemedText 
//                           type="caption" 
//                           style={[
//                             styles.insightTabText,
//                             { color: state.selectedInsightCategory === category ? primaryColor : Colors.semantic.info }
//                           ]}
//                         >
//                           {category.charAt(0).toUpperCase() + category.slice(1)}
//                         </ThemedText>
//                       </Pressable>
//                     ))}
//                   </ScrollView>
//                 </ThemedView>
//               </ThemedView>
              
//               <ThemedView style={styles.insightsList}>
//                 {getInsightsForCategory(state.selectedInsightCategory, data).map((insight, index) => (
//                   <Animated.View key={index} entering={FadeInLeft.delay(index * 100)}>
//                     <ThemedView style={styles.insightItem}>
//                       <ThemedView style={styles.insightIcon}>
//                         <IconSymbol
//                           name={getInsightIcon(insight.type)}
//                           size={16}
//                           color={getInsightColor(insight.type)}
//                         />
//                       </ThemedView>
//                       <ThemedView style={styles.insightContent}>
//                         <ThemedText type="defaultSemiBold" style={styles.insightTitle}>
//                           {insight.title}
//                         </ThemedText>
//                         <ThemedText type="body" style={styles.insightText}>
//                           {insight.message}
//                         </ThemedText>
//                         {insight.actionable && (
//                           <Pressable
//                             style={styles.insightAction}
//                             onPress={() => {
//                               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                               analyticsService.track('insight_action_tapped', { insight: insight.title });
//                             }}
//                           >
//                             <ThemedText type="caption" style={[styles.insightActionText, { color: primaryColor }]}>
//                               Take Action
//                             </ThemedText>
//                             <IconSymbol name="chevron.right" size={12} color={primaryColor} />
//                           </Pressable>
//                         )}
//                       </ThemedView>
//                     </ThemedView>
//                   </Animated.View>
//                 ))}
//               </ThemedView>
//             </ThemedView>
//           </Animated.View>
//         )}

//         <ThemedView style={styles.bottomPadding} />
//       </ScrollView>
//     </SafeContainer>
//   );
// }

// // Helper Components
// const PeriodTab = ({ title, isSelected, onPress }: {
//   title: string;
//   isSelected: boolean;
//   onPress: () => void;
// }) => {
//   const primaryColor = useThemeColor({}, 'tint');
//   const scaleValue = useSharedValue(1);

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: scaleValue.value }]
//     };
//   });

//   const handlePressIn = () => {
//     scaleValue.value = withSpring(0.95);
//   };

//   const handlePressOut = () => {
//     scaleValue.value = withSpring(1);
//   };

//   return (
//     <Animated.View style={[styles.periodTab, animatedStyle]}>
//       <Pressable
//         onPress={onPress}
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         style={[
//           styles.periodTabPressable,
//           isSelected && { backgroundColor: primaryColor }
//         ]}
//       >
//         <ThemedText
//           type="defaultSemiBold"
//           style={[
//             styles.periodTabText,
//             { color: isSelected ? '#FFFFFF' : primaryColor }
//           ]}
//         >
//           {title}
//         </ThemedText>
//       </Pressable>
//     </Animated.View>
//   );
// };

// const ChartTab = ({ title, icon, isSelected, onPress, color }: {
//   title: string;
//   icon: string;
//   isSelected: boolean;
//   onPress: () => void;
//   color: string;
// }) => {
//   const scaleValue = useSharedValue(1);

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: scaleValue.value }]
//     };
//   });

//   const handlePressIn = () => {
//     scaleValue.value = withSpring(0.95);
//   };

//   const handlePressOut = () => {
//     scaleValue.value = withSpring(1);
//   };

//   return (
//     <Animated.View style={[styles.chartTab, animatedStyle]}>
//       <Pressable
//         onPress={onPress}
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         style={[
//           styles.chartTabPressable,
//           isSelected && { backgroundColor: color + '20', borderColor: color }
//         ]}
//       >
//         <IconSymbol
//           name={icon}
//           size={18}
//           color={isSelected ? color : '#9CA3AF'}
//         />
//         <ThemedText
//           type="caption"
//           style={[
//             styles.chartTabText,
//             { color: isSelected ? color : '#9CA3AF' }
//           ]}
//         >
//           {title}
//         </ThemedText>
//       </Pressable>
//     </Animated.View>
//   );
// };

// const ComparisonColumn = ({ title, data, color }: {
//   title: string;
//   data: any;
//   color: string;
// }) => (
//   <ThemedView style={styles.comparisonColumn}>
//     <ThemedText type="subtitle" style={[styles.comparisonTitle, { color }]}>
//       {title}
//     </ThemedText>
    
//     <ThemedView style={styles.comparisonMetrics}>
//       <ThemedView style={styles.comparisonMetric}>
//         <ThemedText type="caption" variant="secondary">Duration</ThemedText>
//         <ThemedText type="smallMetric">
//           {(data?.duration / 60).toFixed(1)}h
//         </ThemedText>
//       </ThemedView>
      
//       <ThemedView style={styles.comparisonMetric}>
//         <ThemedText type="caption" variant="secondary">Efficiency</ThemedText>
//         <ThemedText type="smallMetric">
//           {data?.efficiency}%
//         </ThemedText>
//       </ThemedView>
      
//       <ThemedView style={styles.comparisonMetric}>
//         <ThemedText type="caption" variant="secondary">Score</ThemedText>
//         <ThemedText type="smallMetric">
//           {data?.score}
//         </ThemedText>
//       </ThemedView>
//     </ThemedView>
//   </ThemedView>
// );

// // Enhanced Mock Data Generation with More Realistic Patterns
// function generateMockAnalyticsData(period: 'week' | 'month' | 'year'): Omit<AnalyticsData, 'currentSleepData'> {
//   const dataPoints = period === 'week' ? 7 : period === 'month' ? 30 : 365;
//   const now = new Date();
  
//   const generateDataArray = (baseValue: number, variance: number, trend: number = 0) => {
//     return Array.from({ length: dataPoints }, (_, i) => {
//       const date = new Date(now);
//       date.setDate(date.getDate() - (dataPoints - 1 - i));
      
//       // Add subtle trend and weekly patterns
//       const trendValue = (i / dataPoints) * trend;
//       const weeklyPattern = Math.sin((i / 7) * Math.PI) * (variance * 0.2);
//       const randomVariation = (Math.random() - 0.5) * variance;
      
//       return {
//         date: date.toISOString(),
//         value: Math.max(0, baseValue + trendValue + weeklyPattern + randomVariation)
//       };
//     });
//   };

//   const sleepScores = generateDataArray(75, 20, 5);
//   const avgScore = sleepScores.reduce((sum, d) => sum + d.value, 0) / sleepScores.length;
  
//   // Determine trend based on recent data
//   const recentScores = sleepScores.slice(-7).map(d => d.value);
//   const olderScores = sleepScores.slice(0, 7).map(d => d.value);
//   const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
//   const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
  
//   let sleepQualityTrend: 'improving' | 'declining' | 'stable';
//   if (recentAvg > olderAvg + 3) sleepQualityTrend = 'improving';
//   else if (recentAvg < olderAvg - 3) sleepQualityTrend = 'declining';
//   else sleepQualityTrend = 'stable';

//   return {
//     sleepScores,
//     sleepEfficiency: generateDataArray(85, 15, 2),
//     sleepDuration: generateDataArray(450, 90, -5), // minutes
//     bedtimeConsistency: generateDataArray(78, 25, 3),
//     sleepDebt: generateDataArray(30, 60, -8), // minutes
//     weekdayVsWeekend: {
//       weekday: {
//         duration: 435, // minutes
//         efficiency: 82,
//         score: 73
//       },
//       weekend: {
//         duration: 485, // minutes
//         efficiency: 86,
//         score: 78
//       }
//     },
//     sleepQualityTrend,
//     consistencyScore: 78 + Math.round(Math.random() * 15),
//     sleepGoal: {
//       target: 480, // 8 hours
//       current: avgScore
//     },
//     insights: generateSmartInsights(sleepScores, sleepQualityTrend),
//     environmentCorrelations: [
//       { factor: 'Room Temperature', impact: 0.7 },
//       { factor: 'Screen Time', impact: -0.6 },
//       { factor: 'Exercise', impact: 0.8 },
//       { factor: 'Caffeine', impact: -0.4 }
//     ]
//   };
// }

// // Generate contextual insights based on data patterns
// function generateSmartInsights(sleepScores: any[], trend: string): string[] {
//   const insights = [];
  
//   if (trend === 'improving') {
//     insights.push('Your sleep quality has improved by 8% this week');
//     insights.push('Consistent bedtime is paying off - keep it up!');
//   } else if (trend === 'declining') {
//     insights.push('Your sleep quality has declined recently');
//     insights.push('Consider reviewing your evening routine');
//   } else {
//     insights.push('Your sleep quality is stable');
//     insights.push('Try establishing a more consistent bedtime routine');
//   }
  
//   insights.push('Your REM sleep is optimal for memory consolidation');
//   insights.push('Deep sleep phases are supporting your recovery');
  
//   return insights;
// }

// function generateCSVData(data: AnalyticsData, chartType: string): string {
//   const currentData = data[chartType as keyof typeof data] as any[];
//   if (!Array.isArray(currentData)) return '';
  
//   const headers = ['Date', 'Value'];
//   const rows = currentData.map(item => [
//     new Date(item.date).toLocaleDateString(),
//     item.value.toString()
//   ]);
  
//   return [headers, ...rows].map(row => row.join(',')).join('\n');
// }

// // Helper functions for enhanced UI
// const getTrendBadgeIcon = (trend: string) => {
//   switch (trend) {
//     case 'improving': return 'arrow.up.circle.fill';
//     case 'declining': return 'arrow.down.circle.fill';
//     default: return 'minus.circle.fill';
//   }
// };

// const getTrendBadgeColor = (trend: string) => {
//   switch (trend) {
//     case 'improving': return Colors.semantic.success;
//     case 'declining': return Colors.semantic.error;
//     default: return Colors.semantic.info;
//   }
// };

// const getChartDescription = (selectedChart: string) => {
//   switch (selectedChart) {
//     case 'scores': return 'Overall sleep quality rating from 0-100';
//     case 'efficiency': return 'Percentage of time in bed spent sleeping';
//     case 'duration': return 'Total hours of sleep per night';
//     case 'consistency': return 'How regular your bedtime schedule is';
//     case 'debt': return 'Cumulative sleep deficit over time';
//     default: return 'Sleep metric trends over time';
//   }
// };

// const getInsightCategoryIcon = (category: string) => {
//   switch (category) {
//     case 'overview': return 'chart.bar.fill';
//     case 'patterns': return 'waveform.path';
//     case 'environment': return 'house.fill';
//     case 'goals': return 'target';
//     default: return 'lightbulb.fill';
//   }
// };

// const getInsightIcon = (type: string) => {
//   switch (type) {
//     case 'positive': return 'checkmark.circle.fill';
//     case 'warning': return 'exclamationmark.triangle.fill';
//     case 'info': return 'info.circle.fill';
//     case 'action': return 'arrow.right.circle.fill';
//     default: return 'lightbulb.fill';
//   }
// };

// const getInsightColor = (type: string) => {
//   switch (type) {
//     case 'positive': return Colors.semantic.success;
//     case 'warning': return Colors.semantic.warning;
//     case 'info': return Colors.semantic.info;
//     case 'action': return primaryColor;
//     default: return Colors.semantic.info;
//   }
// };

// const getInsightsForCategory = (category: string, data: AnalyticsData) => {
//   const baseInsights = {
//     overview: [
//       { type: 'positive', title: 'Sleep Quality Trending Up', message: 'Your average sleep score has improved by 8% this week', actionable: false },
//       { type: 'info', title: 'Optimal Sleep Duration', message: 'You\'re getting close to your 8-hour target most nights', actionable: false },
//     ],
//     patterns: [
//       { type: 'warning', title: 'Weekend Sleep Pattern', message: 'You sleep 50 minutes longer on weekends. Try to keep a consistent schedule', actionable: true },
//       { type: 'info', title: 'Deep Sleep Timing', message: 'Your deepest sleep occurs between 11 PM - 2 AM', actionable: false },
//     ],
//     environment: [
//       { type: 'action', title: 'Room Temperature Impact', message: 'Cooler room temperatures (65-68°F) correlate with better sleep quality', actionable: true },
//       { type: 'warning', title: 'Screen Time Before Bed', message: 'Reduce screen exposure 1 hour before sleep for better REM cycles', actionable: true },
//     ],
//     goals: [
//       { type: 'positive', title: 'Sleep Goal Progress', message: 'You\'ve hit your sleep duration target 5 out of 7 nights this week', actionable: false },
//       { type: 'action', title: 'Consistency Challenge', message: 'Try going to bed at the same time for 7 days to improve sleep quality', actionable: true },
//     ]
//   };
  
//   return baseInsights[category] || baseInsights.overview;
// };

// const getDataPointInsight = (dataPoint: any, chartType: string) => {
//   const insights = {
//     scores: 'Above your weekly average',
//     efficiency: 'Excellent sleep efficiency',
//     duration: 'Met your sleep goal',
//     consistency: 'Consistent with your schedule',
//     debt: 'Low sleep debt - well rested'
//   };
  
//   return insights[chartType] || 'Data point selected';
// };

// const styles = StyleSheet.create({
//   scrollContainer: {
//     paddingBottom: 32,
//   },
  
//   // Loading and Error States
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//   },
//   loadingIcon: {
//     marginBottom: 16,
//   },
//   loadingText: {
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   loadingSubtext: {
//     textAlign: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//   },
//   errorIcon: {
//     marginBottom: 16,
//   },
//   errorText: {
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   retryButton: {
//     minWidth: 120,
//   },
  
//   // Enhanced Header Styles
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     padding: 20,
//     paddingBottom: 16,
//   },
//   headerContent: {
//     flex: 1,
//   },
//   headerTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     gap: 12,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     letterSpacing: -0.5,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     opacity: 0.8,
//     lineHeight: 20,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   actionButton: {
//     padding: 10,
//     borderRadius: 12,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   trendBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   trendBadgeText: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'capitalize',
//   },
  
//   // Export Menu
//   exportMenu: {
//     margin: 20,
//     marginTop: 8,
//     padding: 16,
//   },
//   exportTitle: {
//     marginBottom: 12,
//   },
//   exportButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
  
//   // Period Selector
//   periodSelector: {
//     flexDirection: 'row',
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 16,
//     padding: 4,
//   },
//   periodTab: {
//     flex: 1,
//   },
//   periodTabPressable: {
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   periodTabText: {
//     fontSize: 14,
//   },
  
//   // Enhanced Metrics Section
//   metricsSection: {
//     paddingHorizontal: 20,
//     marginBottom: 24,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     letterSpacing: -0.3,
//   },
//   consistencyBadge: {
//     backgroundColor: Colors.semantic.success + '20',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   consistencyText: {
//     color: Colors.semantic.success,
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   metricsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//     marginBottom: 16,
//   },
//   advancedMetrics: {
//     marginTop: 20,
//     paddingTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(156, 163, 175, 0.2)',
//   },
//   advancedMetricsHeader: {
//     marginBottom: 16,
//   },
//   advancedTitle: {
//     fontSize: 16,
//     opacity: 0.9,
//   },
//   advancedMetricsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
  
//   // Chart Selector
//   chartSelector: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//   },
//   chartSelectorContent: {
//     paddingHorizontal: 4,
//     gap: 8,
//   },
//   chartTab: {
//     marginHorizontal: 4,
//   },
//   chartTabPressable: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'transparent',
//     gap: 6,
//   },
//   chartTabText: {
//     fontSize: 11,
//     fontWeight: '600',
//   },
  
//   // Correlation Chart
//   correlationCard: {
//     margin: 20,
//     padding: 0, // CorrelationChart handles its own padding
//     minHeight: 300,
//   },
  
//   // Comparison
//   comparisonCard: {
//     margin: 20,
//     padding: 20,
//   },
//   comparisonContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   comparisonColumn: {
//     flex: 1,
//   },
//   comparisonDivider: {
//     width: 1,
//     backgroundColor: '#E5E7EB',
//     marginHorizontal: 20,
//   },
//   comparisonTitle: {
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   comparisonMetrics: {
//     gap: 12,
//   },
//   comparisonMetric: {
//     alignItems: 'center',
//   },
  
//   // Enhanced Chart Section
//   chartSection: {
//     margin: 20,
//   },
//   chartHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//     paddingHorizontal: 4,
//   },
//   chartTitleContainer: {
//     flex: 1,
//   },
//   chartTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   chartSubtitle: {
//     fontSize: 13,
//     opacity: 0.7,
//   },
//   chartControls: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   chartControlButton: {
//     padding: 8,
//     borderRadius: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   chartInsight: {
//     marginTop: 16,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(156, 163, 175, 0.1)',
//   },
//   chartInsightContent: {
//     alignItems: 'center',
//     gap: 6,
//   },
//   chartInsightValue: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
  
//   // Enhanced Insights
//   insightsCard: {
//     margin: 20,
//     padding: 24,
//   },
//   insightsHeader: {
//     marginBottom: 20,
//   },
//   insightsTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 16,
//   },
//   insightsTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   insightTabs: {
//     marginBottom: 4,
//   },
//   insightTab: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     marginRight: 8,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(156, 163, 175, 0.3)',
//     gap: 6,
//   },
//   insightTabText: {
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   insightsList: {
//     gap: 16,
//   },
//   insightItem: {
//     flexDirection: 'row',
//     gap: 12,
//     alignItems: 'flex-start',
//     padding: 16,
//     backgroundColor: 'rgba(255, 255, 255, 0.05)',
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   insightIcon: {
//     marginTop: 2,
//   },
//   insightContent: {
//     flex: 1,
//     gap: 6,
//   },
//   insightTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   insightText: {
//     fontSize: 14,
//     lineHeight: 20,
//     opacity: 0.9,
//   },
//   insightAction: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginTop: 8,
//   },
//   insightActionText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
  
//   bottomPadding: {
//     height: 40,
//   },
// });