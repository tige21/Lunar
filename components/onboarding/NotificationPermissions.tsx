import React, { memo } from 'react';
import { StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { ThemedView, ThemedText, ThemedButton } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

interface NotificationPermissionsProps {
  isGranted: boolean;
  isRequesting: boolean;
  onRequestPermissions: () => Promise<void>;
}

export const NotificationPermissions = memo(function NotificationPermissions({
  isGranted,
  isRequesting,
  onRequestPermissions,
}: NotificationPermissionsProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({
    light: Colors.light.background,
    dark: Colors.dark.cardBackground,
  }, 'background');

  const bannerScale = useSharedValue(isGranted ? 1 : 0.98);
  const bannerOpacity = useSharedValue(isGranted ? 1 : 0.8);

  const bannerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bannerScale.value }],
    opacity: bannerOpacity.value,
  }));

  const handleRequest = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await onRequestPermissions();
  };

  if (isGranted) {
    return (
      <Animated.View style={[styles.permissionBanner, styles.grantedBanner, bannerStyle]}>
        <IconSymbol name="checkmark.circle.fill" size={24} color={Colors.light.success} />
        <ThemedText style={styles.permissionText}>Notifications enabled</ThemedText>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.permissionBanner, { backgroundColor: cardBackground }, bannerStyle]}>
      <IconSymbol name="bell.badge" size={24} color={primaryColor} />
      <ThemedView style={styles.permissionContent}>
        <ThemedText style={styles.permissionTitle}>
          Enable notifications for better sleep tracking
        </ThemedText>
        <ThemedText style={styles.permissionSubtitle}>
          Get personalized reminders and insights
        </ThemedText>
      </ThemedView>
      <ThemedButton
        title={isRequesting ? "Requesting..." : "Enable"}
        onPress={handleRequest}
        disabled={isRequesting}
        variant="primary"
        size="small"
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  grantedBanner: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  permissionContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  permissionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    color: Colors.light.success,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  permissionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default NotificationPermissions;