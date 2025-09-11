// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { StyleSheet, ScrollView, RefreshControl, Dimensions, Pressable, View } from 'react-native';
// import Animated, { 
//   FadeInDown, 
//   FadeInUp, 
//   useSharedValue, 
//   useAnimatedStyle, 
//   withTiming,
//   withSpring
// } from 'react-native-reanimated';
// import * as Haptics from 'expo-haptics';
// import { LinearGradient } from 'expo-linear-gradient';

// // UI Components
// import { SafeContainer } from '@/components/ui/SafeContainer';
// import { ThemedView } from '@/components/ThemedView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedButton } from '@/components/ui/ThemedButton';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import { CircularProgress } from '@/components/ui/CircularProgress';
// import { MiniChart } from '@/components/ui/MiniChart';
// import { HealthSyncStatus } from '@/components/ui/HealthSyncStatus';

// // Hooks and Utils
// import { useThemeColor } from '@/hooks/useThemeColor';
// import { Colors } from '@/constants/Colors';
// import { router } from 'expo-router';

// // Services
// import sleepService, { type SleepData } from '@/lib/services/sleepService';
// import { analyticsService } from '@/lib/services';

// // Types
// interface DashboardState {
//   isLoading: boolean;
//   sleepData: SleepData | null;
//   error: string | null;
// }

// const { width } = Dimensions.get('window');

// export default function DashboardScreen() {
//   const [state, setState] = useState<DashboardState>({
//     isLoading: true,
//     sleepData: null,
//     error: null
//   });
//   const [refreshing, setRefreshing] = useState(false);

//   const scoreAnimation = useSharedValue(0);
//   const cardAnimation = useSharedValue(0);

//   const primaryColor = useThemeColor({}, 'tint');
//   const backgroundColor = useThemeColor({}, 'background');
//   const textColor = useThemeColor({}, 'text');

//   const loadSleepData = useCallback(async () => {
//     try {
//       console.log('🚀 Dashboard: Starting to load sleep data');
//       setState(prev => ({ ...prev, isLoading: true, error: null }));
      
//       // Clear cache to force fresh data fetch (helpful for testing HealthKit)
//       sleepService.clearCache();
//       console.log('🗑️ Dashboard: Cleared sleep data cache');
      
//       const data = await sleepService.getCurrentSleepData();
//       console.log('📊 Dashboard: Received sleep data:', data ? 'success' : 'no data');
      
//       if (data) {
//         console.log('💤 Dashboard: Sleep score:', data.score);
//         console.log('⏰ Dashboard: Duration:', data.duration);
//         console.log('🎯 Dashboard: Efficiency:', data.efficiency + '%');
//       }
      
//       setState({
//         isLoading: false,
//         sleepData: data,
//         error: data ? null : 'No sleep data available'
//       });
//     } catch (error) {
//       console.error('❌ Dashboard: Failed to load sleep data:', error);
//       setState({
//         isLoading: false,
//         sleepData: null,
//         error: 'Failed to load sleep data'
//       });
//     }
//   }, []);

//   useEffect(() => {
//     loadSleepData();
    
//     // Track screen view for analytics
//     analyticsService.trackScreen('dashboard');
//   }, [loadSleepData]);

//   // Memoized animation trigger to prevent excessive re-renders
//   const animationTrigger = useMemo(() => state.sleepData?.score, [state.sleepData?.score]);
  
//   useEffect(() => {
//     if (animationTrigger) {
//       // Batch animations to reduce frame drops
//       requestAnimationFrame(() => {
//         scoreAnimation.value = withTiming(animationTrigger / 100, {
//           duration: 1200, // Reduced duration for snappier feel
//         });
//         cardAnimation.value = withTiming(1, {
//           duration: 600,
//         });
//       });
//     }
    
//     // Cleanup function to prevent memory leaks
//     return () => {
//       scoreAnimation.value = 0;
//       cardAnimation.value = 0;
//     };
//   }, [animationTrigger, scoreAnimation, cardAnimation]);

//   // Debounced refresh to prevent excessive API calls
//   const onRefresh = useCallback(async () => {
//     if (refreshing) return; // Prevent double refresh
    
//     console.log('🔄 Dashboard: User triggered refresh');
//     setRefreshing(true);
//     analyticsService.track('dashboard_refresh');
    
//     try {
//       await loadSleepData();
//     } catch (error) {
//       console.error('Refresh failed:', error);
//     } finally {
//       setRefreshing(false);
//       console.log('✅ Dashboard: Refresh completed');
//     }
//   }, [refreshing, loadSleepData]);

//   // Memoize expensive color calculations
//   const getScoreColor = useCallback((score: number) => {
//     if (score >= 71) return Colors.semantic.success;
//     if (score >= 41) return Colors.semantic.warning;
//     return Colors.semantic.error;
//   }, []);

//   // Memoize score description to avoid service calls on every render
//   const getScoreDescription = useCallback((score: number) => {
//     return sleepService.getSleepQuality(score);
//   }, []);

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 5) return 'Good night';
//     if (hour < 12) return 'Good morning';
//     if (hour < 18) return 'Good afternoon';
//     return 'Good evening';
//   };

//   const getCurrentDate = () => {
//     return new Date().toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const animatedScoreStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: withTiming(scoreAnimation.value > 0 ? 1 : 0.8) }]
//     };
//   });

//   const animatedCardStyle = useAnimatedStyle(() => {
//     return {
//       opacity: cardAnimation.value,
//       transform: [{ translateY: withTiming(cardAnimation.value === 1 ? 0 : 20) }]
//     };
//   });

//   if (state.isLoading) {
//     return (
//       <SafeContainer>
//         <ThemedView style={styles.loadingContainer}>
//           <IconSymbol
//             name="moon.stars.fill"
//             size={60}
//             color={primaryColor}
//             style={styles.loadingIcon}
//           />
//           <ThemedText type="title" style={styles.loadingText}>
//             Loading your sleep data...
//           </ThemedText>
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
//             onPress={() => {
//               analyticsService.track('error_retry', { error: state.error });
//               loadSleepData();
//             }}
//             style={styles.retryButton}
//           >
//             Try Again
//           </ThemedButton>
//         </ThemedView>
//       </SafeContainer>
//     );
//   }

//   const { sleepData } = state;

//   if (!sleepData) {
//     return (
//       <SafeContainer>
//         <ScrollView
//           contentContainerStyle={styles.scrollContainer}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//         >
//           <Animated.View entering={FadeInDown.delay(200)}>
//             <ThemedView style={styles.emptyState}>
//               <IconSymbol
//                 name="moon.zzz.fill"
//                 size={80}
//                 color={primaryColor}
//                 style={styles.emptyIcon}
//               />
//               <ThemedText type="heading" style={{ textAlign: 'center' }}>
//                 Start Your Sleep Journey
//               </ThemedText>
//               <ThemedText type="body" style={[styles.emptyDescription, { textAlign: 'center' }]}>
//                 Connect Apple Health for automatic sleep tracking, or track manually to see your personalized dashboard with insights and trends.
//               </ThemedText>
              
//               {/* HealthKit connection reminder */}
//               <ThemedView style={styles.healthPrompt}>
//                 <HealthSyncStatus 
//                   compact={false}
//                   showDetails={true}
//                   onSyncPress={onRefresh}
//                 />
//               </ThemedView>
//               <ThemedButton
//                 variant="sleep-action"
//                 size="lg"
//                 fullWidth
//                 style={styles.startTrackingButton}
//                 onPress={() => {
//                   analyticsService.trackSleepEvent('start_tracking', { from: 'empty_state' });
//                   console.log('Starting sleep tracking from empty state...');
//                 }}
//               >
//                 Start Sleep Tracking
//               </ThemedButton>
//             </ThemedView>
//           </Animated.View>
//         </ScrollView>
//       </SafeContainer>
//     );
//   }

//   return (
//     <SafeContainer>
//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header Section */}
//         <Animated.View entering={FadeInUp.delay(100)}>
//           <ThemedView style={styles.header}>
//             <ThemedView style={styles.headerTop}>
//               <ThemedView>
//                 <ThemedText type="heading">
//                   {getGreeting()}, Luna
//                 </ThemedText>
//                 <ThemedText type="caption">
//                   {getCurrentDate()}
//                 </ThemedText>
//               </ThemedView>
//               <Pressable style={styles.profileButton}>
//                 <IconSymbol
//                   name="person.circle.fill"
//                   size={40}
//                   color={primaryColor}
//                 />
//               </Pressable>
//             </ThemedView>
            
//             {/* Health Integration Status */}
//             <ThemedView style={styles.healthStatus}>
//               <HealthSyncStatus 
//                 compact={true}
//                 onSyncPress={() => {
//                   analyticsService.track('dashboard_health_sync_pressed');
//                   onRefresh(); // Refresh dashboard data after sync
//                 }}
//               />
              
//               {/* Debug: Force HealthKit sync button */}
//               {__DEV__ && (
//                 <View style={{ gap: 4 }}>
//                   <Pressable
//                     style={styles.debugButton}
//                     onPress={async () => {
//                       console.log('🧪 Debug: Force HealthKit sync triggered');
//                       try {
//                         const result = await sleepService.syncFromHealthKit();
//                         console.log('🧪 Debug: Sync result:', result);
//                         await onRefresh();
//                       } catch (error) {
//                         console.error('🧪 Debug: Sync failed:', error);
//                       }
//                     }}
//                   >
//                     <ThemedText style={styles.debugButtonText}>
//                       🧪 Force HealthKit Sync
//                     </ThemedText>
//                   </Pressable>
                  
//                   <Pressable
//                     style={[styles.debugButton, { borderColor: 'rgba(0, 255, 0, 0.3)', backgroundColor: 'rgba(0, 255, 0, 0.1)' }]}
//                     onPress={async () => {
//                       console.log('🧪 Debug: Direct permission request');
//                       try {
//                         const granted = await sleepService.requestHealthKitPermissions();
//                         console.log('🧪 Debug: Permissions granted:', granted);
//                         alert(`Permissions granted: ${granted}`);
//                       } catch (error) {
//                         console.error('🧪 Debug: Permission request failed:', error);
//                         alert(`Error: ${error}`);
//                       }
//                     }}
//                   >
//                     <ThemedText style={[styles.debugButtonText, { color: 'green' }]}>
//                       🔐 Request Permissions
//                     </ThemedText>
//                   </Pressable>
//                 </View>
//               )}
//             </ThemedView>
//           </ThemedView>
//         </Animated.View>

//         {/* Sleep Score Hero Section */}
//         <Animated.View entering={FadeInDown.delay(200)} style={animatedScoreStyle}>
//           <LinearGradient
//             colors={[
//               getScoreColor(sleepData.score) + '10',
//               getScoreColor(sleepData.score) + '05',
//               'transparent'
//             ]}
//             style={styles.scoreGradientWrapper}
//           >
//             <ThemedView variant="glass" shadow="glow" borderRadius="3xl" style={styles.scoreCard}>
//               <ThemedView style={styles.scoreHeader}>
//                 <ThemedView style={styles.scoreHeaderTop}>
//                   <ThemedText type="label" variant="muted">
//                     SLEEP SCORE
//                   </ThemedText>
//                   <ThemedView style={styles.scoreBadge}>
//                     <ThemedText type="caption" style={[styles.scoreBadgeText, { color: getScoreColor(sleepData.score) }]}>
//                       {getScoreDescription(sleepData.score).toUpperCase()}
//                     </ThemedText>
//                   </ThemedView>
//                 </ThemedView>
//                 <ThemedText type="caption" variant="muted">
//                   Last night • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                 </ThemedText>
//               </ThemedView>
              
//               <ThemedView style={styles.scoreDisplay}>
//                 <ThemedView style={styles.scoreCircleContainer}>
//                   <CircularProgress
//                     progress={sleepData.score}
//                     size={240}
//                     strokeWidth={16}
//                     color={getScoreColor(sleepData.score)}
//                     backgroundColor={backgroundColor + '40'}
//                     interactive={true}
//                     onPress={() => {
//                       analyticsService.track('dashboard_score_pressed');
//                       router.push('/analytics');
//                     }}
//                   >
//                     <ThemedView style={styles.scoreContent}>
//                       <ThemedText type="hero" style={[styles.scoreNumber, { color: getScoreColor(sleepData.score) }]}>
//                         {sleepData.score}
//                       </ThemedText>
//                       <ThemedText type="small-metric" variant="muted">
//                         out of 100
//                       </ThemedText>
//                     </ThemedView>
//                   </CircularProgress>
                  
//                   {/* Floating achievement indicators */}
//                   <ThemedView style={[styles.floatingIndicator, styles.floatingLeft]}>
//                     <IconSymbol
//                       name="sparkles"
//                       size={20}
//                       color={getScoreColor(sleepData.score)}
//                     />
//                   </ThemedView>
//                   <ThemedView style={[styles.floatingIndicator, styles.floatingRight]}>
//                     <IconSymbol
//                       name="moon.stars.fill"
//                       size={18}
//                       color={Colors.sleepStages.deep}
//                     />
//                   </ThemedView>
//                 </ThemedView>
                
//                 <ThemedView style={styles.scoreInsights}>
//                   <ThemedView style={styles.insightItem}>
//                     <ThemedView style={[styles.trendIndicator, { backgroundColor: Colors.semantic.success + '20' }]}>
//                       <IconSymbol
//                         name="arrow.up.right"
//                         size={16}
//                         color={Colors.semantic.success}
//                       />
//                       <ThemedText type="caption" style={{ color: Colors.semantic.success }}>
//                         +4 from average
//                       </ThemedText>
//                     </ThemedView>
//                   </ThemedView>
//                   <ThemedView style={styles.insightItem}>
//                     <IconSymbol
//                       name="target"
//                       size={16}
//                       color={primaryColor}
//                     />
//                     <ThemedText type="caption" variant="muted">
//                       87% of weekly goal
//                     </ThemedText>
//                   </ThemedView>
//                 </ThemedView>
//               </ThemedView>
//             </ThemedView>
//           </LinearGradient>
//         </Animated.View>

//         {/* Enhanced Key Metrics Grid */}
//         <Animated.View entering={FadeInDown.delay(300)} style={animatedCardStyle}>
//           <ThemedView style={styles.metricsContainer}>
//             <ThemedText type="subtitle" style={styles.sectionTitle}>
//               Night Summary
//             </ThemedText>
//             <ThemedView style={styles.metricsGrid}>
//               <EnhancedMetricCard
//                 title="Sleep Duration"
//                 value={sleepData.duration}
//                 subtitle="8h 15m target"
//                 icon="moon.fill"
//                 color={Colors.sleepStages.deep}
//                 progress={85}
//                 trend="up"
//               />
//               <EnhancedMetricCard
//                 title="Sleep Efficiency"
//                 value={`${sleepData.efficiency}%`}
//                 subtitle="Great efficiency"
//                 icon="chart.line.uptrend.xyaxis"
//                 color={Colors.semantic.success}
//                 progress={sleepData.efficiency}
//                 trend="stable"
//               />
//               <EnhancedMetricCard
//                 title="Time to Sleep"
//                 value={`${sleepData.timeToFallAsleep}m`}
//                 subtitle="Average: 12m"
//                 icon="timer"
//                 color={Colors.sleepStages.light}
//                 progress={Math.max(0, 100 - (sleepData.timeToFallAsleep * 5))}
//                 trend="down"
//               />
//               <EnhancedMetricCard
//                 title="Awakenings"
//                 value={sleepData.awakenings.toString()}
//                 subtitle="times woken up"
//                 icon="eye.slash.fill"
//                 color={sleepData.awakenings <= 2 ? Colors.semantic.success : Colors.sleepStages.wake}
//                 progress={Math.max(0, 100 - (sleepData.awakenings * 20))}
//                 trend={sleepData.awakenings <= 2 ? "up" : "down"}
//               />
//             </ThemedView>
//           </ThemedView>
//         </Animated.View>

//         {/* Enhanced Sleep Phases Visualization */}
//         <Animated.View entering={FadeInDown.delay(400)}>
//           <ThemedView variant="sleep-card" shadow="soft" borderRadius="2xl" style={styles.phasesCard}>
//             <ThemedView style={styles.phasesHeader}>
//               <ThemedText type="subtitle" style={styles.sectionTitle}>
//                 Sleep Architecture
//               </ThemedText>
//               <ThemedText type="caption" variant="muted">
//                 Phase breakdown for optimal recovery
//               </ThemedText>
//             </ThemedView>
            
//             <ThemedView style={styles.phasesContainer}>
//               <EnhancedPhaseBar
//                 label="Deep Sleep"
//                 percentage={sleepData.phases.deep}
//                 color={Colors.sleepStages.deep}
//                 target={20}
//                 description="Physical recovery"
//                 icon="moon.fill"
//               />
//               <EnhancedPhaseBar
//                 label="REM Sleep"
//                 percentage={sleepData.phases.rem}
//                 color={Colors.sleepStages.rem}
//                 target={25}
//                 description="Memory consolidation"
//                 icon="brain.head.profile"
//               />
//               <EnhancedPhaseBar
//                 label="Light Sleep"
//                 percentage={sleepData.phases.light}
//                 color={Colors.sleepStages.light}
//                 target={50}
//                 description="Transition phase"
//                 icon="cloud.fill"
//               />
//               <EnhancedPhaseBar
//                 label="Awake Time"
//                 percentage={sleepData.phases.wake}
//                 color={sleepData.phases.wake <= 5 ? Colors.semantic.success : Colors.sleepStages.wake}
//                 target={5}
//                 description="Brief awakenings"
//                 icon="eye.fill"
//               />
//             </ThemedView>
            
//             <ThemedView style={styles.phasesFooter}>
//               <ThemedView style={styles.phasesSummary}>
//                 <IconSymbol
//                   name="checkmark.circle.fill"
//                   size={16}
//                   color={Colors.semantic.success}
//                 />
//                 <ThemedText type="caption" variant="muted">
//                   Healthy sleep architecture detected
//                 </ThemedText>
//               </ThemedView>
//             </ThemedView>
//           </ThemedView>
//         </Animated.View>

//         {/* Quick Actions */}
//         <Animated.View entering={FadeInDown.delay(500)}>
//           <ThemedView style={styles.actionsContainer}>
//             <ThemedText type="subtitle" style={styles.sectionTitle}>
//               Quick Actions
//             </ThemedText>
            
//             <ThemedView style={styles.actionsGrid}>
//               <ActionButton
//                 title="Detailed Analysis"
//                 subtitle="View complete report"
//                 icon="chart.bar.doc.horizontal"
//                 color={Colors.semantic.info}
//                 onPress={() => {
//                   analyticsService.track('dashboard_action', { action: 'view_analysis' });
//                   router.push('/analytics');
//                 }}
//               />
//               <ActionButton
//                 title="AI Chat"
//                 subtitle="Get insights"
//                 icon="message.fill"
//                 color={Colors.sleepStages.rem}
//                 onPress={() => {
//                   analyticsService.track('dashboard_action', { action: 'open_chat' });
//                   router.push('/chat');
//                 }}
//               />
//               <ActionButton
//                 title="Track Tonight"
//                 subtitle="Start tracking"
//                 icon="moon.stars.fill"
//                 color={Colors.sleepStages.deep}
//                 onPress={() => {
//                   analyticsService.trackSleepEvent('start_tracking');
//                   // TODO: Implement sleep tracking start
//                   console.log('Starting sleep tracking...');
//                 }}
//               />
//               <ActionButton
//                 title="View Trends"
//                 subtitle="7-day history"
//                 icon="chart.line.uptrend.xyaxis"
//                 color={Colors.semantic.success}
//                 onPress={() => {
//                   analyticsService.track('dashboard_action', { action: 'view_trends' });
//                   router.push('/analytics');
//                 }}
//               />
//             </ThemedView>
//           </ThemedView>
//         </Animated.View>

//         {/* Recent Trends */}
//         <Animated.View entering={FadeInDown.delay(600)}>
//           <ThemedView variant="card" style={styles.trendsCard}>
//             <ThemedView style={styles.trendsHeader}>
//               <ThemedText type="subtitle">
//                 Recent Trends
//               </ThemedText>
//               <ThemedView style={styles.streakContainer}>
//                 <IconSymbol
//                   name="flame.fill"
//                   size={16}
//                   color={Colors.semantic.warning}
//                 />
//                 <ThemedText type="caption">
//                   {sleepData.streak} day streak
//                 </ThemedText>
//               </ThemedView>
//             </ThemedView>
            
//             <ThemedView style={styles.miniChart}>
//               <ThemedText type="caption">
//                 Last 7 days sleep scores
//               </ThemedText>
//               <MiniChart
//                 data={sleepData.weekTrend}
//                 height={40}
//                 barWidth={8}
//                 barGap={6}
//                 maxValue={100}
//                 interactive={true}
//                 animated={true}
//                 onBarPress={(value, index) => {
//                   analyticsService.track('mini_chart_bar_pressed', { value, index });
//                   // Could show detailed info for that day
//                 }}
//               />
//             </ThemedView>
//           </ThemedView>
//         </Animated.View>

//         <ThemedView style={styles.bottomPadding} />
//       </ScrollView>
//     </SafeContainer>
//   );
// }

// // Helper Components
// const MetricCard = ({ title, value, icon, color }: {
//   title: string;
//   value: string;
//   icon: string;
//   color: string;
// }) => (
//   <ThemedView style={[styles.metricCard, styles.card]}>
//     <ThemedView style={styles.metricHeader}>
//       <IconSymbol name={icon} size={20} color={color} />
//       <ThemedText type="caption">
//         {title}
//       </ThemedText>
//     </ThemedView>
//     <ThemedText type="sleep-data">
//       {value}
//     </ThemedText>
//   </ThemedView>
// );

// const EnhancedMetricCard = ({ title, value, subtitle, icon, color, progress, trend }: {
//   title: string;
//   value: string;
//   subtitle: string;
//   icon: string;
//   color: string;
//   progress: number;
//   trend: 'up' | 'down' | 'stable';
// }) => {
//   const getTrendIcon = () => {
//     switch (trend) {
//       case 'up': return 'arrow.up.right';
//       case 'down': return 'arrow.down.right';
//       case 'stable': return 'minus';
//     }
//   };

//   const getTrendColor = () => {
//     switch (trend) {
//       case 'up': return Colors.semantic.success;
//       case 'down': return Colors.semantic.error;
//       case 'stable': return Colors.semantic.warning;
//     }
//   };

//   return (
//     <ThemedView variant="metric-card" shadow="soft" borderRadius="2xl" style={styles.enhancedMetricCard}>
//       <ThemedView style={styles.metricCardHeader}>
//         <ThemedView style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
//           <IconSymbol name={icon} size={24} color={color} />
//         </ThemedView>
//         <ThemedView style={styles.metricTrend}>
//           <IconSymbol name={getTrendIcon()} size={14} color={getTrendColor()} />
//         </ThemedView>
//       </ThemedView>
      
//       <ThemedView style={styles.metricCardContent}>
//         <ThemedText type="small-metric" style={styles.metricValue}>
//           {value}
//         </ThemedText>
//         <ThemedText type="caption" variant="muted" style={styles.metricTitle}>
//           {title}
//         </ThemedText>
//         <ThemedText type="caption" variant="muted" style={styles.metricSubtitle}>
//           {subtitle}
//         </ThemedText>
//       </ThemedView>
      
//       {/* Progress indicator */}
//       <ThemedView style={styles.metricProgress}>
//         <ThemedView style={[styles.metricProgressBg]}>
//           <Animated.View 
//             style={[styles.metricProgressFill, { 
//               width: `${progress}%`,
//               backgroundColor: color
//             }]}
//           />
//         </ThemedView>
//       </ThemedView>
//     </ThemedView>
//   );
// };

// const PhaseBar = ({ label, percentage, color }: {
//   label: string;
//   percentage: number;
//   color: string;
// }) => (
//   <ThemedView style={styles.phaseBar}>
//     <ThemedView style={styles.phaseLabel}>
//       <ThemedText type="caption">{label}</ThemedText>
//       <ThemedText type="caption">
//         {percentage}%
//       </ThemedText>
//     </ThemedView>
//     <ThemedView style={styles.phaseProgress}>
//       <ThemedView
//         style={[
//           styles.phaseProgressFill,
//           {
//             width: `${percentage}%`,
//             backgroundColor: color
//           }
//         ]}
//       />
//     </ThemedView>
//   </ThemedView>
// );

// const EnhancedPhaseBar = ({ label, percentage, color, target, description, icon }: {
//   label: string;
//   percentage: number;
//   color: string;
//   target: number;
//   description: string;
//   icon: string;
// }) => {
//   const isOptimal = Math.abs(percentage - target) <= 5;
//   const statusColor = isOptimal ? Colors.semantic.success : 
//                      percentage < target ? Colors.semantic.warning : color;
  
//   return (
//     <ThemedView style={styles.enhancedPhaseBar}>
//       <ThemedView style={styles.phaseBarHeader}>
//         <ThemedView style={styles.phaseBarLeft}>
//           <ThemedView style={[styles.phaseIcon, { backgroundColor: color + '20' }]}>
//             <IconSymbol name={icon} size={16} color={color} />
//           </ThemedView>
//           <ThemedView style={styles.phaseBarLabels}>
//             <ThemedText type="defaultSemiBold">{label}</ThemedText>
//             <ThemedText type="caption" variant="muted">{description}</ThemedText>
//           </ThemedView>
//         </ThemedView>
        
//         <ThemedView style={styles.phaseBarRight}>
//           <ThemedText type="small-metric" style={{ color }}>
//             {percentage}%
//           </ThemedText>
//           <ThemedView style={[styles.phaseStatus, { backgroundColor: statusColor + '20' }]}>
//             <IconSymbol 
//               name={isOptimal ? 'checkmark' : percentage < target ? 'arrow.up' : 'arrow.down'} 
//               size={12} 
//               color={statusColor} 
//             />
//           </ThemedView>
//         </ThemedView>
//       </ThemedView>
      
//       <ThemedView style={styles.enhancedPhaseProgress}>
//         <ThemedView style={styles.phaseProgressTrack}>
//           {/* Target indicator */}
//           <ThemedView 
//             style={[
//               styles.targetIndicator,
//               { left: `${Math.min(target, 95)}%` }
//             ]}
//           >
//             <ThemedView style={[styles.targetLine, { backgroundColor: Colors.semantic.info }]} />
//           </ThemedView>
          
//           {/* Progress fill */}
//           <Animated.View
//             entering={FadeInUp.delay(200)}
//             style={[
//               styles.enhancedPhaseProgressFill,
//               {
//                 width: `${percentage}%`,
//                 backgroundColor: color
//               }
//             ]}
//           />
//         </ThemedView>
//       </ThemedView>
//     </ThemedView>
//   );
// };

// const ActionButton = ({ title, subtitle, icon, color, onPress }: {
//   title: string;
//   subtitle: string;
//   icon: string;
//   color: string;
//   onPress: () => void;
// }) => {
//   const scaleValue = useSharedValue(1);
  
//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: scaleValue.value }]
//     };
//   });
  
//   const handlePressIn = () => {
//     scaleValue.value = withSpring(0.95, { damping: 15, stiffness: 300 });
//   };
  
//   const handlePressOut = () => {
//     scaleValue.value = withSpring(1, { damping: 15, stiffness: 300 });
//   };
  
//   const handlePress = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     onPress();
//   };
  
//   return (
//     <Animated.View style={[styles.actionButton, animatedStyle]}>
//       <Pressable
//         onPress={handlePress}
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         android_ripple={{ color: `${color}20`, borderless: false }}
//         style={styles.actionButtonPressable}
//       >
//         <ThemedView style={[styles.actionCard, styles.card]}>
//           <IconSymbol name={icon} size={24} color={color} />
//           <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
//             {title}
//           </ThemedText>
//           <ThemedText type="caption">
//             {subtitle}
//           </ThemedText>
//         </ThemedView>
//       </Pressable>
//     </Animated.View>
//   );
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
  
//   // Empty State
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//     marginTop: 60,
//   },
//   emptyIcon: {
//     marginBottom: 24,
//   },
//   emptyDescription: {
//     marginTop: 12,
//     marginBottom: 24,
//     maxWidth: 280,
//   },
//   healthPrompt: {
//     width: '100%',
//     marginBottom: 24,
//   },
//   startTrackingButton: {
//     maxWidth: 200,
//   },
  
//   // Enhanced Header with better spacing and typography
//   header: {
//     paddingHorizontal: 24,
//     paddingTop: 16,
//     paddingBottom: 8,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 4,
//   },
//   profileButton: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: 'rgba(91, 33, 182, 0.1)',
//   },
//   healthStatus: {
//     marginTop: 12,
//     alignItems: 'flex-start',
//     gap: 8,
//   },
//   debugButton: {
//     backgroundColor: 'rgba(255, 165, 0, 0.1)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 165, 0, 0.3)',
//   },
//   debugButtonText: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: 'orange',
//   },
  
//   // Enhanced Sleep Score Section with better visual hierarchy
//   scoreGradientWrapper: {
//     marginHorizontal: 16,
//     marginBottom: 24,
//     borderRadius: 32,
//     overflow: 'hidden',
//   },
//   scoreCard: {
//     padding: 28,
//     margin: 4,
//     marginHorizontal: 4,
//     marginVertical: 4,
//   },
//   scoreHeader: {
//     marginBottom: 20,
//   },
//   scoreHeaderTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   scoreBadge: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     backdropFilter: 'blur(10px)',
//   },
//   scoreBadgeText: {
//     fontWeight: '600',
//     fontSize: 11,
//     letterSpacing: 0.8,
//   },
//   scoreDisplay: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   scoreCircleContainer: {
//     position: 'relative',
//     marginBottom: 24,
//   },
//   scoreContent: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scoreNumber: {
//     marginBottom: -4,
//   },
//   scoreInsights: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 16,
//   },
//   insightItem: {
//     alignItems: 'center',
//     gap: 6,
//   },
//   trendIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
  
//   // Floating indicators for visual delight
//   floatingIndicator: {
//     position: 'absolute',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 20,
//     padding: 8,
//     backdropFilter: 'blur(10px)',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   floatingLeft: {
//     top: 40,
//     left: -20,
//   },
//   floatingRight: {
//     bottom: 60,
//     right: -24,
//   },
  
//   // Enhanced Metrics Grid with better card design
//   metricsContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 24,
//   },
//   metricsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   enhancedMetricCard: {
//     width: (width - 64) / 2,
//     minHeight: 120,
//     padding: 16,
//   },
//   metricCardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   metricIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   metricTrend: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   metricCardContent: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   metricValue: {
//     marginBottom: 2,
//   },
//   metricTitle: {
//     marginBottom: 2,
//     fontSize: 11,
//     fontWeight: '500',
//   },
//   metricSubtitle: {
//     fontSize: 10,
//     opacity: 0.7,
//     marginBottom: 8,
//   },
//   metricProgress: {
//     width: '100%',
//     height: 3,
//     overflow: 'hidden',
//   },
//   metricProgressBg: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 2,
//   },
//   metricProgressFill: {
//     height: '100%',
//     borderRadius: 2,
//   },
  
//   // Legacy metric card styles (keep for compatibility)
//   metricCard: {
//     flex: 1,
//     padding: 16,
//     alignItems: 'center',
//   },
//   metricHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     gap: 6,
//   },
  
//   // Enhanced Sleep Phases Section
//   phasesCard: {
//     marginHorizontal: 20,
//     marginBottom: 24,
//     padding: 24,
//   },
//   phasesHeader: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     marginBottom: 4,
//   },
//   phasesContainer: {
//     gap: 16,
//   },
//   phasesFooter: {
//     marginTop: 20,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   phasesSummary: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
  
//   // Enhanced Phase Bars
//   enhancedPhaseBar: {
//     gap: 12,
//   },
//   phaseBarHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   phaseBarLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     flex: 1,
//   },
//   phaseIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   phaseBarLabels: {
//     flex: 1,
//   },
//   phaseBarRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   phaseStatus: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   enhancedPhaseProgress: {
//     height: 8,
//     position: 'relative',
//   },
//   phaseProgressTrack: {
//     width: '100%',
//     height: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     borderRadius: 4,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   enhancedPhaseProgressFill: {
//     height: '100%',
//     borderRadius: 4,
//     position: 'absolute',
//     left: 0,
//     top: 0,
//   },
//   targetIndicator: {
//     position: 'absolute',
//     top: -2,
//     width: 2,
//     height: 12,
//     zIndex: 2,
//   },
//   targetLine: {
//     width: 2,
//     height: '100%',
//     borderRadius: 1,
//   },
  
//   // Legacy phase bar styles (keep for compatibility)
//   phaseBar: {
//     gap: 8,
//   },
//   phaseLabel: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   phaseProgress: {
//     height: 8,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 4,
//     overflow: 'hidden',
//   },
//   phaseProgressFill: {
//     height: '100%',
//     borderRadius: 4,
//   },
  
//   // Enhanced Quick Actions with better visual design
//   actionsContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 24,
//   },
//   actionsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   actionButton: {
//     width: (width - 64) / 2,
//   },
//   actionButtonPressable: {
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   actionCard: {
//     padding: 20,
//     alignItems: 'center',
//     gap: 12,
//     minHeight: 110,
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//     backdropFilter: 'blur(10px)',
//   },
//   actionTitle: {
//     textAlign: 'center',
//     fontSize: 15,
//     fontWeight: '600',
//   },
  
//   // Enhanced Recent Trends with better visual hierarchy
//   trendsCard: {
//     marginHorizontal: 20,
//     padding: 24,
//     marginBottom: 8,
//   },
//   trendsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   streakContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: 'rgba(245, 158, 11, 0.15)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   miniChart: {
//     gap: 16,
//     alignItems: 'center',
//   },
  
//   bottomPadding: {
//     height: 32,
//   },
  
//   // Enhanced card styles with better shadows and colors
//   card: {
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: 'rgba(91, 33, 182, 0.1)',
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.15,
//     shadowRadius: 16,
//     elevation: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//     backdropFilter: 'blur(20px)',
//   },
// });
