import { ThemedView } from '@/components/ui';
import NotificationsActions from '@/components/ui/NotificationsScreen/NotificationsActions';
import NotificationsBenefits from '@/components/ui/NotificationsScreen/NotificationsBenefits';
import NotificationsHeader from '@/components/ui/NotificationsScreen/NotificationsHeader';
import NotificationsPrivacy from '@/components/ui/NotificationsScreen/NotificationsPrivacy';
import { TRANSLATIONS } from '@/components/ui/NotificationsScreen/messages';
import { useThemeColor } from '@/hooks/useThemeColor';
import { languageDetector } from '@/lib/languageDetection';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet } from 'react-native';

interface NotificationsScreenProps {
  onNext?: () => void;
}

export default function NotificationsScreen({ onNext }: NotificationsScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const [isRequesting, setIsRequesting] = useState(false);
  const [, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');

  // Detect system language
  const deviceLanguage = useMemo(() => {
    const detectedLang = languageDetector.getDeviceLanguage();
    return detectedLang === 'ru' ? 'ru' : 'en';
  }, []);

  const t = useMemo(() => TRANSLATIONS[deviceLanguage], [deviceLanguage]);

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        t.notAvailableTitle,
        t.notAvailableMessage,
        [{ text: t.notAvailableOk, onPress: () => onNext?.() }]
      );
      return;
    }

    setIsRequesting(true);
    
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      setPermissionStatus(status);

      if (status === 'granted') {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        Alert.alert(
          t.enabledTitle,
          t.enabledMessage,
          [{ text: t.enabledContinue, onPress: () => onNext?.() }]
        );
      } else if (status === 'denied') {
        Alert.alert(
          t.disabledTitle,
          t.disabledMessage,
          [{ text: t.disabledContinue, onPress: () => onNext?.() }]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      Alert.alert(t.errorTitle, t.errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onNext?.();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <NotificationsHeader
          language={deviceLanguage}
          tintColor={tintColor}
        />

        {/* Benefits */}
        <NotificationsBenefits
          language={deviceLanguage}
          surfaceColor={surfaceColor}
        />

        {/* Privacy Note */}
        <NotificationsPrivacy
          language={deviceLanguage}
        />
      </ThemedView>

      {/* Action Buttons */}
      <NotificationsActions
        language={deviceLanguage}
        isRequesting={isRequesting}
        onEnableNotifications={requestNotificationPermission}
        onSkip={handleSkip}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
});