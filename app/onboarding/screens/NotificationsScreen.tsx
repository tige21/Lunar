// import {
//     BodyText,
//     CaptionText,
//     HeroText,
//     LabelText,
//     SafeContainer,
//     ThemedButton,
//     ThemedText,
//     ThemedView,
//     TimePicker,
//     TitleText,
//     ToggleButton,
// } from '@/components/ui';
// import { useThemeColor } from '@/hooks/useThemeColor';
// import * as Haptics from 'expo-haptics';
// import * as Notifications from 'expo-notifications';
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//     Alert,
//     Dimensions,
//     Platform,
//     Pressable,
//     ScrollView,
//     StyleSheet,
// } from 'react-native';
// import Animated, {
//     useAnimatedStyle,
//     useSharedValue,
//     withDelay,
//     withSpring,
//     withTiming
// } from 'react-native-reanimated';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // Responsive utility
// const scale = SCREEN_WIDTH / 375;
// function normalize(size: number): number {
//   const newSize = size * scale;
//   if (SCREEN_WIDTH <= 320) return Math.max(newSize * 0.9, size * 0.85);
//   if (SCREEN_WIDTH >= 768) return Math.min(newSize * 1.1, size * 1.25);
//   return Math.round(newSize);
// }

// interface NotificationsScreenProps {
//   onNext?: () => void;
// }

// type NotificationPermissionStatus = 'undetermined' | 'denied' | 'granted';

// interface NotificationSettings {
//   bedtimeReminders: boolean;
//   bedtimeReminderTime: Date;
//   morningInsights: boolean;
//   weeklyReports: boolean;
//   goalAchievements: boolean;
//   smartSuggestions: boolean;
// }

// // Mock notification examples for preview
// const NOTIFICATION_EXAMPLES = [
//   {
//     id: 'bedtime',
//     title: '🌙 Time for Bed',
//     body: 'Your optimal bedtime is in 30 minutes. Start winding down for better sleep quality.',
//     category: 'bedtimeReminders',
//   },
//   {
//     id: 'morning',
//     title: '☀️ Sleep Score: 85',
//     body: 'Great night! You got 7h 45m of quality sleep with 2h 15m deep sleep.',
//     category: 'morningInsights',
//   },
//   {
//     id: 'weekly',
//     title: '📊 Weekly Sleep Report',
//     body: 'This week: 7.2h average sleep, 15% improvement in deep sleep!',
//     category: 'weeklyReports',
//   },
//   {
//     id: 'achievement',
//     title: '🎉 Goal Achieved!',
//     body: 'Congratulations! You\'ve maintained consistent bedtime for 7 days straight.',
//     category: 'goalAchievements',
//   },
//   {
//     id: 'smart',
//     title: '💡 Sleep Tip',
//     body: 'Your sleep improved 23% when room temperature was 67°F. Consider adjusting tonight.',
//     category: 'smartSuggestions',
//   },
// ];

// export default function NotificationsScreen({ onNext }: NotificationsScreenProps) {
//   // Colors
//   const backgroundColor = useThemeColor({}, 'background');
//   const surfaceColor = useThemeColor({}, 'surface');
//   const borderColor = useThemeColor({}, 'border');
//   const tintColor = useThemeColor({}, 'tint');
//   const textColor = useThemeColor({}, 'text');
  
//   // State
//   const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('undetermined');
//   const [isRequestingPermission, setIsRequestingPermission] = useState(false);
//   const [settings, setSettings] = useState<NotificationSettings>({
//     bedtimeReminders: true,
//     bedtimeReminderTime: new Date(new Date().setHours(22, 0, 0, 0)), // 10:00 PM
//     morningInsights: true,
//     weeklyReports: true,
//     goalAchievements: true,
//     smartSuggestions: true,
//   });
//   const [showPreview, setShowPreview] = useState(false);

//   // Animation values
//   const titleOpacity = useSharedValue(0);
//   const contentOpacity = useSharedValue(0);
//   const permissionCardScale = useSharedValue(0.9);
//   const settingsOpacity = useSharedValue(0);
//   const previewOpacity = useSharedValue(0);
//   const buttonTranslateY = useSharedValue(50);

//   // Check permission status on mount
//   useEffect(() => {
//     checkNotificationPermission();
//     startEntranceAnimations();
//   }, []);

//   const startEntranceAnimations = () => {
//     titleOpacity.value = withTiming(1, { duration: 600 });
//     contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
//     permissionCardScale.value = withDelay(400, withSpring(1, { 
//       damping: 15, 
//       stiffness: 150 
//     }));
//     buttonTranslateY.value = withDelay(600, withTiming(0, { duration: 500 }));
//   };

//   const checkNotificationPermission = async () => {
//     try {
//       const { status } = await Notifications.getPermissionsAsync();
//       setPermissionStatus(status as NotificationPermissionStatus);
      
//       if (status === 'granted') {
//         // Animate settings visibility
//         settingsOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
//         previewOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
//       }
//     } catch (error) {
//       console.error('Error checking notification permissions:', error);
//     }
//   };

//   const requestNotificationPermission = async () => {
//     if (Platform.OS === 'web') {
//       Alert.alert(
//         'Notifications Not Available',
//         'Notifications are not supported on web. You can continue without notifications.',
//         [{ text: 'OK', onPress: () => onNext?.() }]
//       );
//       return;
//     }

//     setIsRequestingPermission(true);
    
//     try {
//       if (Platform.OS === 'ios') {
//         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//       }

//       const { status } = await Notifications.requestPermissionsAsync({
//         ios: {
//           allowAlert: true,
//           allowBadge: true,
//           allowSound: true,
//           allowDisplayInCarPlay: true,
//           allowCriticalAlerts: false,
//         },
//       });

//       setPermissionStatus(status as NotificationPermissionStatus);

//       if (status === 'granted') {
//         // Configure notification behavior
//         await Notifications.setNotificationHandler({
//           handleNotification: async () => ({
//             shouldShowAlert: true,
//             shouldPlaySound: true,
//             shouldSetBadge: true,
//             shouldShowBanner: true,
//             shouldShowList: true,
//           }),
//         });

//         // Animate settings appearance
//         settingsOpacity.value = withTiming(1, { duration: 600 });
//         previewOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
        
//         if (Platform.OS === 'ios') {
//           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//         }
//       } else if (status === 'denied') {
//         handlePermissionDenied();
//       }
//     } catch (error) {
//       console.error('Error requesting notification permissions:', error);
//       Alert.alert('Error', 'Failed to request notification permissions');
//     } finally {
//       setIsRequestingPermission(false);
//     }
//   };

//   const handlePermissionDenied = () => {
//     Alert.alert(
//       'Notifications Disabled',
//       'To enable sleep reminders and insights, you can allow notifications in Settings > Notifications > Lunar.',
//       [
//         { text: 'Skip for Now', style: 'cancel', onPress: () => onNext?.() },
//         { 
//           text: 'Open Settings', 
//           onPress: () => {
//             if (Platform.OS === 'ios') {
//               Notifications.requestPermissionsAsync();
//             }
//           }
//         }
//       ]
//     );
//   };

//   const updateSetting = useCallback(<K extends keyof NotificationSettings>(
//     key: K, 
//     value: NotificationSettings[K]
//   ) => {
//     setSettings(prev => ({ ...prev, [key]: value }));
    
//     if (Platform.OS === 'ios') {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
//   }, []);

//   const showNotificationPreview = async (exampleId: string) => {
//     const example = NOTIFICATION_EXAMPLES.find(ex => ex.id === exampleId);
//     if (!example || permissionStatus !== 'granted') return;

//     try {
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: example.title,
//           body: example.body,
//           data: { preview: true },
//         },
//         trigger: { seconds: 1 },
//       });
      
//       if (Platform.OS === 'ios') {
//         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//       }
//     } catch (error) {
//       console.error('Error showing notification preview:', error);
//     }
//   };

//   const handleNext = () => {
//     if (Platform.OS === 'ios') {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     }
    
//     // Save notification settings (would typically save to AsyncStorage or backend)
//     // await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    
//     onNext?.();
//   };

//   const handleSkip = () => {
//     if (Platform.OS === 'ios') {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
//     onNext?.();
//   };

//   // Animated styles
//   const titleAnimatedStyle = useAnimatedStyle(() => ({
//     opacity: titleOpacity.value,
//   }));

//   const contentAnimatedStyle = useAnimatedStyle(() => ({
//     opacity: contentOpacity.value,
//   }));

//   const permissionCardAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: permissionCardScale.value }],
//     opacity: contentOpacity.value,
//   }));

//   const settingsAnimatedStyle = useAnimatedStyle(() => ({
//     opacity: settingsOpacity.value,
//   }));

//   const previewAnimatedStyle = useAnimatedStyle(() => ({
//     opacity: previewOpacity.value,
//   }));

//   const buttonAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: buttonTranslateY.value }],
//     opacity: contentOpacity.value,
//   }));

//   const renderPermissionRequest = () => (
//     <Animated.View style={[styles.permissionCard, { backgroundColor: surfaceColor }, permissionCardAnimatedStyle]}>
//       <ThemedView style={styles.permissionIcon}>
//         <ThemedText style={[styles.iconEmoji, { color: tintColor }]}>
//           🔔
//         </ThemedText>
//       </ThemedView>

//       <TitleText style={styles.permissionTitle}>
//         Stay on Track with Smart Reminders
//       </TitleText>

//       <BodyText style={styles.permissionDescription}>
//         Enable notifications to receive personalized sleep reminders, insights, and progress updates that help you build better sleep habits.
//       </BodyText>

//       <ThemedView style={styles.benefitsList}>
//         {[
//           { icon: '🌙', text: 'Gentle bedtime reminders' },
//           { icon: '☀️', text: 'Morning sleep insights' },
//           { icon: '💡', text: 'AI-powered sleep tips' },
//           { icon: '🎯', text: 'Goal achievement alerts' },
//         ].map((benefit, index) => (
//           <ThemedView key={index} style={styles.benefitItem}>
//             <ThemedText style={styles.benefitIcon}>{benefit.icon}</ThemedText>
//             <LabelText style={styles.benefitText}>{benefit.text}</LabelText>
//           </ThemedView>
//         ))}
//       </ThemedView>

//       <ThemedView style={styles.permissionButtons}>
//         <ThemedButton
//           title={isRequestingPermission ? 'Requesting...' : 'Allow Notifications'}
//           variant="primary"
//           size="large"
//           fullWidth
//           loading={isRequestingPermission}
//           onPress={requestNotificationPermission}
//           disabled={isRequestingPermission}
//         />
        
//         <Pressable style={styles.skipButton} onPress={handleSkip}>
//           <CaptionText style={[styles.skipText, { color: textColor }]}>
//             Skip for Now
//           </CaptionText>
//         </Pressable>
//       </ThemedView>
//     </Animated.View>
//   );

//   const renderNotificationSettings = () => (
//     <Animated.View style={[styles.settingsSection, settingsAnimatedStyle]}>
//       <TitleText style={styles.sectionTitle}>
//         Notification Preferences
//       </TitleText>

//       <ThemedView style={styles.settingsCard}>
//         <ThemedView style={styles.settingItem}>
//           <ThemedView style={styles.settingInfo}>
//             <LabelText style={styles.settingLabel}>Bedtime Reminders</LabelText>
//             <CaptionText style={[styles.settingDescription, { color: textColor + '80' }]}>
//               Get notified 30 minutes before your optimal bedtime
//             </CaptionText>
//           </ThemedView>
//           <ToggleButton
//             value={settings.bedtimeReminders}
//             onValueChange={(value) => updateSetting('bedtimeReminders', value)}
//           />
//         </ThemedView>

//         {settings.bedtimeReminders && (
//           <ThemedView style={styles.timePickerContainer}>
//             <TimePicker
//               label="Reminder Time"
//               value={settings.bedtimeReminderTime}
//               onChange={(time) => updateSetting('bedtimeReminderTime', time)}
//               placeholder="Select bedtime"
//             />
//           </ThemedView>
//         )}

//         <ThemedView style={[styles.settingItem, styles.settingItemBorder]}>
//           <ThemedView style={styles.settingInfo}>
//             <LabelText style={styles.settingLabel}>Morning Insights</LabelText>
//             <CaptionText style={[styles.settingDescription, { color: textColor + '80' }]}>
//               Daily sleep score and quality summary
//             </CaptionText>
//           </ThemedView>
//           <ToggleButton
//             value={settings.morningInsights}
//             onValueChange={(value) => updateSetting('morningInsights', value)}
//           />
//         </ThemedView>

//         <ThemedView style={[styles.settingItem, styles.settingItemBorder]}>
//           <ThemedView style={styles.settingInfo}>
//             <LabelText style={styles.settingLabel}>Weekly Reports</LabelText>
//             <CaptionText style={[styles.settingDescription, { color: textColor + '80' }]}>
//               Comprehensive sleep pattern analysis
//             </CaptionText>
//           </ThemedView>
//           <ToggleButton
//             value={settings.weeklyReports}
//             onValueChange={(value) => updateSetting('weeklyReports', value)}
//           />
//         </ThemedView>

//         <ThemedView style={[styles.settingItem, styles.settingItemBorder]}>
//           <ThemedView style={styles.settingInfo}>
//             <LabelText style={styles.settingLabel}>Goal Achievements</LabelText>
//             <CaptionText style={[styles.settingDescription, { color: textColor + '80' }]}>
//               Celebrate your sleep improvement milestones
//             </CaptionText>
//           </ThemedView>
//           <ToggleButton
//             value={settings.goalAchievements}
//             onValueChange={(value) => updateSetting('goalAchievements', value)}
//           />
//         </ThemedView>

//         <ThemedView style={[styles.settingItem, styles.settingItemBorder]}>
//           <ThemedView style={styles.settingInfo}>
//             <LabelText style={styles.settingLabel}>AI Sleep Tips</LabelText>
//             <CaptionText style={[styles.settingDescription, { color: textColor + '80' }]}>
//               Personalized recommendations based on your data
//             </CaptionText>
//           </ThemedView>
//           <ToggleButton
//             value={settings.smartSuggestions}
//             onValueChange={(value) => updateSetting('smartSuggestions', value)}
//           />
//         </ThemedView>
//       </ThemedView>
//     </Animated.View>
//   );

//   const renderNotificationPreviews = () => (
//     <Animated.View style={[styles.previewSection, previewAnimatedStyle]}>
//       <TitleText style={styles.sectionTitle}>
//         Notification Examples
//       </TitleText>
      
//       <CaptionText style={[styles.previewDescription, { color: textColor + '80' }]}>
//         Tap any notification to see a preview
//       </CaptionText>

//       <ThemedView style={styles.previewList}>
//         {NOTIFICATION_EXAMPLES.map((example) => {
//           const isEnabled = settings[example.category as keyof NotificationSettings] as boolean;
          
//           return (
//             <Pressable
//               key={example.id}
//               style={[
//                 styles.previewCard,
//                 { 
//                   backgroundColor: surfaceColor,
//                   borderColor: borderColor,
//                   opacity: isEnabled ? 1 : 0.5,
//                 }
//               ]}
//               onPress={() => isEnabled && showNotificationPreview(example.id)}
//               disabled={!isEnabled || permissionStatus !== 'granted'}
//             >
//               <ThemedView style={styles.previewHeader}>
//                 <ThemedText style={styles.previewTitle}>
//                   {example.title}
//                 </ThemedText>
//                 {isEnabled && permissionStatus === 'granted' && (
//                   <CaptionText style={[styles.tapHint, { color: tintColor }]}>
//                     Tap to preview
//                   </CaptionText>
//                 )}
//               </ThemedView>
//               <CaptionText style={[styles.previewBody, { color: textColor + '80' }]}>
//                 {example.body}
//               </CaptionText>
//             </Pressable>
//           );
//         })}
//       </ThemedView>
//     </Animated.View>
//   );

//   return (
//     <SafeContainer style={[styles.container, { backgroundColor }]}>
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <ThemedView style={styles.header}>
//           <Animated.View style={titleAnimatedStyle}>
//             <HeroText style={styles.title}>
//               Smart Sleep Notifications
//             </HeroText>
//           </Animated.View>

//           <Animated.View style={contentAnimatedStyle}>
//             <BodyText style={styles.description}>
//               Stay motivated and informed about your sleep journey with intelligent notifications tailored to your patterns.
//             </BodyText>
//           </Animated.View>
//         </ThemedView>

//         {/* Main Content */}
//         <ThemedView style={styles.content}>
//           {permissionStatus === 'undetermined' && renderPermissionRequest()}
//           {permissionStatus === 'denied' && (
//             <Animated.View style={[styles.deniedCard, { backgroundColor: surfaceColor }, contentAnimatedStyle]}>
//               <ThemedText style={styles.deniedIcon}>⚠️</ThemedText>
//               <TitleText style={styles.deniedTitle}>
//                 Notifications Disabled
//               </TitleText>
//               <BodyText style={styles.deniedDescription}>
//                 You can still use Lunar, but you'll miss out on helpful sleep reminders and insights. You can enable them later in your device settings.
//               </BodyText>
//             </Animated.View>
//           )}
//           {permissionStatus === 'granted' && (
//             <>
//               {renderNotificationSettings()}
//               {renderNotificationPreviews()}
//             </>
//           )}
//         </ThemedView>
//       </ScrollView>

//       {/* Action Buttons */}
//       <Animated.View style={[styles.actions, buttonAnimatedStyle]}>
//         {permissionStatus === 'granted' ? (
//           <ThemedButton
//             title="Continue"
//             variant="primary"
//             size="large"
//             fullWidth
//             onPress={handleNext}
//           />
//         ) : (
//           <ThemedView style={styles.actionButtons}>
//             {permissionStatus === 'denied' && (
//               <ThemedButton
//                 title="Try Again"
//                 variant="outline"
//                 size="large"
//                 style={{ flex: 1 }}
//                 onPress={requestNotificationPermission}
//               />
//             )}
//             <ThemedButton
//               title={permissionStatus === 'denied' ? 'Continue' : 'Skip'}
//               variant={permissionStatus === 'denied' ? 'primary' : 'secondary'}
//               size="large"
//               style={{ flex: 1 }}
//               onPress={handleNext}
//             />
//           </ThemedView>
//         )}
//       </Animated.View>
//     </SafeContainer>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 120, // Space for fixed action buttons
//   },
//   header: {
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 20,
//     paddingBottom: 32,
//   },
//   title: {
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   description: {
//     textAlign: 'center',
//     opacity: 0.8,
//     maxWidth: '90%',
//   },
//   content: {
//     paddingHorizontal: 24,
//     gap: 32,
//   },
  
//   // Permission Request Styles
//   permissionCard: {
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   permissionIcon: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 24,
//     backgroundColor: 'rgba(139, 92, 246, 0.1)',
//   },
//   iconEmoji: {
//     fontSize: normalize(40),
//   },
//   permissionTitle: {
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   permissionDescription: {
//     textAlign: 'center',
//     opacity: 0.8,
//     marginBottom: 32,
//     lineHeight: 24,
//   },
//   benefitsList: {
//     width: '100%',
//     gap: 16,
//     marginBottom: 32,
//   },
//   benefitItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   benefitIcon: {
//     fontSize: 20,
//   },
//   benefitText: {
//     flex: 1,
//     opacity: 0.9,
//   },
//   permissionButtons: {
//     width: '100%',
//     gap: 16,
//   },
//   skipButton: {
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   skipText: {
//     opacity: 0.7,
//   },

//   // Denied State Styles
//   deniedCard: {
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(239, 68, 68, 0.2)',
//   },
//   deniedIcon: {
//     fontSize: normalize(48),
//     marginBottom: 16,
//   },
//   deniedTitle: {
//     textAlign: 'center',
//     marginBottom: 12,
//     color: '#EF4444',
//   },
//   deniedDescription: {
//     textAlign: 'center',
//     opacity: 0.8,
//     lineHeight: 24,
//   },

//   // Settings Styles
//   settingsSection: {
//     gap: 16,
//   },
//   sectionTitle: {
//     marginBottom: 8,
//   },
//   settingsCard: {
//     backgroundColor: 'rgba(255, 255, 255, 0.05)',
//     borderRadius: 16,
//     padding: 20,
//     gap: 20,
//   },
//   settingItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     gap: 16,
//   },
//   settingItemBorder: {
//     paddingTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   settingInfo: {
//     flex: 1,
//   },
//   settingLabel: {
//     marginBottom: 4,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   settingDescription: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   timePickerContainer: {
//     paddingLeft: 16,
//     paddingTop: 8,
//   },

//   // Preview Styles
//   previewSection: {
//     gap: 16,
//   },
//   previewDescription: {
//     marginBottom: 8,
//   },
//   previewList: {
//     gap: 12,
//   },
//   previewCard: {
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     gap: 8,
//   },
//   previewHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   previewTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     flex: 1,
//   },
//   tapHint: {
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   previewBody: {
//     fontSize: 14,
//     lineHeight: 20,
//   },

//   // Action Styles
//   actions: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 24,
//     paddingBottom: 40,
//     paddingTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
// });