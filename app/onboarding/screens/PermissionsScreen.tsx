import {
  BodyText,
  CaptionText,
  SafeContainer,
  ThemedButton,
  ThemedText,
  TitleText,
} from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors, DesignTokens } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import HealthKitServiceInstance, { HealthPermissions } from '@/lib/services/healthKitService';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface PermissionsScreenProps {
  onNext?: () => void;
  onSkip?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PermissionsScreen({ onNext, onSkip }: PermissionsScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<HealthPermissions | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  const progressAnimation = useSharedValue(0);

  useEffect(() => {
    progressAnimation.value = withSpring(1, {
      damping: 20,
      stiffness: 100,
    });
    checkHealthService();
  }, [progressAnimation]);

  const checkHealthService = async () => {
    try {
      const status = HealthKitServiceInstance.getStatus();
      console.log('Health service status:', status);
      
      if (status.available) {
        const currentPermissions = await HealthKitServiceInstance.checkPermissions();
        setPermissions(currentPermissions);
      }
    } catch (error) {
      console.warn('Error checking health service:', error);
    }
  };

  const requestHealthPermissions = async () => {
    setIsLoading(true);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (!HealthKitServiceInstance.isAvailable()) {
        handleUnsupportedPlatform();
        return;
      }

      const grantedPermissions = await HealthKitServiceInstance.requestPermissions();
      setPermissions(grantedPermissions);
      
      const allGranted = Object.values(grantedPermissions).every(Boolean);
      
      if (allGranted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Permissions Granted',
          'Great! We can now access your health data to provide better sleep insights.',
          [
            { text: 'Continue', onPress: () => onNext?.() }
          ]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Partial Permissions',
          'Some permissions were not granted. You can still use the app with manual tracking.',
          [
            { text: 'Continue', onPress: () => onNext?.() },
            { text: 'Try Again', onPress: requestHealthPermissions }
          ]
        );
      }
    } catch (error) {
      console.error('Health permissions error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showPermissionError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsupportedPlatform = () => {
    let message: string;
    
    if (Platform.OS === 'android') {
      message = 'Health data integration will be available in the next update. You can continue with manual tracking.';
    } else if (Platform.OS === 'ios') {
      if (Constants.platform?.ios?.simulator) {
        message = 'HealthKit is not available on iOS Simulator. Please test on a physical device or continue with manual tracking.';
      } else {
        message = 'HealthKit is not available on this device. You can continue with manual sleep tracking.';
      }
    } else {
      message = 'Health data integration is only available on mobile devices. You can continue with manual sleep tracking.';
    }
    
    Alert.alert(
      'Health Data Not Available',
      message,
      [
        { text: 'Continue', onPress: () => onNext?.() }
      ]
    );
  };

  const showPermissionError = () => {
    Alert.alert(
      'Permission Error',
      'There was an issue accessing health data. You can continue with manual tracking or try again.',
      [
        { text: 'Try Again', onPress: requestHealthPermissions },
        { text: 'Continue Anyway', onPress: () => onNext?.() },
        { text: 'Skip', style: 'cancel', onPress: () => onSkip?.() }
      ]
    );
  };

  const continueWithoutPermissions = () => {
    Alert.alert(
      'Continue Without Health Data?',
        'You can still track your sleep manually, but you&apos;ll miss out on automatic insights and correlations.',
      [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Continue', onPress: () => onNext?.() }
      ]
    );
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: progressAnimation.value,
      transform: [
        {
          translateY: (1 - progressAnimation.value) * 50,
        },
      ],
    };
  });

  const renderPrivacySection = () => (
    <Animated.View 
      entering={FadeIn.delay(200).duration(600)}
      style={styles.privacySection}
    >
      <LinearGradient
        colors={['rgba(91, 33, 182, 0.1)', 'rgba(139, 92, 246, 0.05)']}
        style={styles.privacyCard}
      >
        <View style={styles.privacyHeader}>
          <IconSymbol
            name="lock.shield.fill"
            size={20}
            color={tintColor}
          />
          <ThemedText type="defaultSemiBold" style={styles.privacyTitle}>
            Your Privacy is Protected
          </ThemedText>
        </View>
        
        <View style={styles.privacyPoints}>
          <PrivacyPoint text="All health data stays on your device" />
          <PrivacyPoint text="No data is sent to cloud servers" />
          <PrivacyPoint text="You control what data to share" />
          <PrivacyPoint text="Can be revoked at any time" />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderPermissionStatus = () => {
    if (!permissions) return null;

    return (
      <Animated.View 
        entering={FadeIn.delay(400).duration(600)}
        style={styles.statusSection}
      >
        <ThemedText type="defaultSemiBold" style={styles.statusTitle}>
          Current Permissions:
        </ThemedText>
        
        <View style={styles.statusGrid}>
          <PermissionStatusItem 
            icon="moon.stars.fill"
            title="Sleep Data"
            granted={permissions.sleep}
          />
          <PermissionStatusItem 
            icon="heart.fill"
            title="Heart Rate"
            granted={permissions.heartRate}
          />
          <PermissionStatusItem 
            icon="figure.walk"
            title="Steps"
            granted={permissions.steps}
          />
          <PermissionStatusItem 
            icon="flame.fill"
            title="Workouts"
            granted={permissions.workout}
          />
        </View>
      </Animated.View>
    );
  };

  const PrivacyPoint = ({ text }: { text: string }) => (
    <View style={styles.privacyPoint}>
      <IconSymbol
        name="checkmark.circle.fill"
        size={12}
        color={tintColor}
      />
      <CaptionText style={styles.privacyPointText}>{text}</CaptionText>
    </View>
  );

  const PermissionStatusItem = ({ 
    icon, 
    title, 
    granted 
  }: { 
    icon: string; 
    title: string; 
    granted: boolean; 
  }) => (
    <View style={[styles.statusItem, { backgroundColor: surfaceColor }]}>
      <IconSymbol
        name={icon as any}
        size={16}
        color={granted ? Colors.semantic.success : textColor}
      />
      <CaptionText style={[
        styles.statusItemText,
        { color: granted ? Colors.semantic.success : textColor }
      ]}>
        {title}
      </CaptionText>
      <IconSymbol
        name={granted ? "checkmark.circle.fill" : "xmark.circle.fill"}
        size={14}
        color={granted ? Colors.semantic.success : Colors.semantic.error}
      />
    </View>
  );

  return (
    <SafeContainer style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedContainerStyle}>
          {/* Header */}
          <View style={styles.header}>
            <TitleText style={styles.title}>
              Health Data Access
            </TitleText>
            <BodyText style={styles.subtitle}>
              Connect your health data to get personalized sleep insights and automatic tracking.
            </BodyText>
          </View>

          {/* Privacy Section */}
          {renderPrivacySection()}

          {/* Permission Status */}
          {renderPermissionStatus()}

          {/* Benefits Preview */}
          <Animated.View 
            entering={FadeIn.delay(600).duration(600)}
            style={styles.benefitsPreview}
          >
            <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
              What You&apos;ll Get:
            </ThemedText>
            <View style={styles.previewGrid}>
              <BenefitPreview
                icon="chart.line.uptrend.xyaxis"
                title="Smart Insights"
                description="AI-powered sleep analysis"
              />
              <BenefitPreview
                icon="moon.zzz.fill"
                title="Auto Tracking"
                description="Effortless sleep monitoring"
              />
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View 
        entering={SlideInDown.delay(800).duration(500)}
        style={styles.actionButtons}
      >
        <ThemedButton
          title={isLoading ? "Requesting Access..." : "Grant Access"}
          variant="primary"
          size="large"
          fullWidth
          loading={isLoading}
          onPress={requestHealthPermissions}
          style={styles.primaryButton}
        />
        
        <Pressable
          style={styles.skipButton}
          onPress={continueWithoutPermissions}
        >
          <CaptionText style={styles.skipText}>
            Continue without health data
          </CaptionText>
        </Pressable>
      </Animated.View>
    </SafeContainer>
  );
}

const BenefitPreview = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: string; 
  title: string; 
  description: string; 
}) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  
  return (
    <View style={[styles.benefitPreviewCard, { backgroundColor: surfaceColor }]}>
      <IconSymbol
        name={icon as any}
        size={20}
        color={tintColor}
        style={styles.benefitPreviewIcon}
      />
      <ThemedText type="defaultSemiBold" style={styles.benefitPreviewTitle}>
        {title}
      </ThemedText>
      <CaptionText style={styles.benefitPreviewDescription}>
        {description}
      </CaptionText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: 120,
  },
  header: {
    paddingVertical: DesignTokens.spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: DesignTokens.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: '90%',
  },
  privacySection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  privacyCard: {
    padding: DesignTokens.spacing.lg,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.sm,
  },
  privacyTitle: {
    color: Colors.light.tint,
  },
  privacyPoints: {
    gap: DesignTokens.spacing.sm,
  },
  privacyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
  },
  privacyPointText: {
    opacity: 0.8,
  },
  statusSection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  statusTitle: {
    marginBottom: DesignTokens.spacing.md,
    textAlign: 'center',
  },
  statusGrid: {
    gap: DesignTokens.spacing.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing.sm,
  },
  statusItemText: {
    flex: 1,
    fontSize: DesignTokens.fontSize.sm,
  },
  benefitsPreview: {
    marginBottom: DesignTokens.spacing.xl,
  },
  previewTitle: {
    marginBottom: DesignTokens.spacing.lg,
    textAlign: 'center',
    fontSize: DesignTokens.fontSize.lg,
  },
  previewGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
    justifyContent: 'space-between',
  },
  benefitPreviewCard: {
    width: (SCREEN_WIDTH - DesignTokens.spacing.lg * 2 - DesignTokens.spacing.md) / 2,
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.md,
    alignItems: 'center',
    ...DesignTokens.shadows.soft,
  },
  benefitPreviewIcon: {
    marginBottom: DesignTokens.spacing.sm,
  },
  benefitPreviewTitle: {
    marginBottom: 4,
    textAlign: 'center',
    fontSize: DesignTokens.fontSize.sm,
  },
  benefitPreviewDescription: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: DesignTokens.fontSize.xs,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  primaryButton: {
    marginBottom: DesignTokens.spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.sm,
  },
  skipText: {
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
});