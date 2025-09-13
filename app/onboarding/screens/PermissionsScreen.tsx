import { SafeContainer } from '@/components/ui';
import {
    PermissionsActions,
    PermissionsBenefits,
    PermissionsHeader,
    permissionsMessages,
    PermissionsStatus
} from '@/components/ui/PermissionsScreen';
import { DesignTokens } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { languageDetector } from '@/lib/languageDetection';
import HealthKitServiceInstance, { HealthPermissions } from '@/lib/services/healthKitService';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface PermissionsScreenProps {
  onNext?: () => void;
  onSkip?: () => void;
}


export default function PermissionsScreen({ onNext, onSkip }: PermissionsScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<HealthPermissions | null>(null);

  const backgroundColor = useThemeColor({}, 'background');

  const progressAnimation = useSharedValue(0);

  // Language detection
  const deviceLanguage = useMemo(() => {
    const detectedLang = languageDetector.getDeviceLanguage();
    return detectedLang === 'ru' ? 'ru' : 'en';
  }, []);

  const messages = permissionsMessages[deviceLanguage as keyof typeof permissionsMessages];

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
          messages.alerts.permissionsGranted.title,
          messages.alerts.permissionsGranted.message,
          [
            { text: messages.alerts.permissionsGranted.continue, onPress: () => onNext?.() }
          ]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          messages.alerts.partialPermissions.title,
          messages.alerts.partialPermissions.message,
          [
            { text: messages.alerts.partialPermissions.continue, onPress: () => onNext?.() },
            { text: messages.alerts.partialPermissions.tryAgain, onPress: requestHealthPermissions }
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
      message = messages.alerts.unsupportedPlatform.android;
    } else if (Platform.OS === 'ios') {
      if (Constants.platform?.ios?.simulator) {
        message = messages.alerts.unsupportedPlatform.iosSimulator;
      } else {
        message = messages.alerts.unsupportedPlatform.iosDevice;
      }
    } else {
      message = messages.alerts.unsupportedPlatform.web;
    }

    Alert.alert(
      messages.alerts.unsupportedPlatform.title,
      message,
      [
        { text: messages.alerts.unsupportedPlatform.continue, onPress: () => onNext?.() }
      ]
    );
  };

  const showPermissionError = () => {
    Alert.alert(
      messages.alerts.permissionError.title,
      messages.alerts.permissionError.message,
      [
        { text: messages.alerts.permissionError.tryAgain, onPress: requestHealthPermissions },
        { text: messages.alerts.permissionError.continueAnyway, onPress: () => onNext?.() },
        { text: messages.alerts.permissionError.skip, style: 'cancel', onPress: () => onSkip?.() }
      ]
    );
  };

  const continueWithoutPermissions = () => {
    Alert.alert(
      messages.alerts.continueWithout.title,
      messages.alerts.continueWithout.message,
      [
        { text: messages.alerts.continueWithout.goBack, style: 'cancel' },
        { text: messages.alerts.continueWithout.continue, onPress: () => onNext?.() }
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




  return (
    <SafeContainer style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedContainerStyle}>
          <PermissionsHeader messages={messages} />
          {/* <PermissionsPrivacy messages={messages} /> */}
          <PermissionsStatus messages={messages} permissions={permissions} />
          <PermissionsBenefits messages={messages} />
        </Animated.View>
      </ScrollView>

      <PermissionsActions
        messages={messages}
        isLoading={isLoading}
        onGrantAccess={requestHealthPermissions}
        onContinueWithout={continueWithoutPermissions}
      />
    </SafeContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: 140,
  },
});