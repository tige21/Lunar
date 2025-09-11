import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView, ThemedText, ToggleButton, TimePicker } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export interface NotificationSettings {
  bedtimeReminder: {
    enabled: boolean;
    time: string;
    advanceMinutes: number;
  };
  wakeUpAlarm: {
    enabled: boolean;
    time: string;
    smartWake: boolean;
  };
  sleepTracking: {
    enabled: boolean;
    autoDetect: boolean;
  };
  insights: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
  };
  permissions: {
    granted: boolean;
    requestedAt?: string;
  };
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
}

export const NotificationSettingsComponent = memo(function NotificationSettingsComponent({
  settings,
  onSettingsChange,
}: NotificationSettingsProps) {
  const cardBackground = useThemeColor({
    light: Colors.light.background,
    dark: Colors.dark.cardBackground,
  }, 'background');
  const primaryColor = useThemeColor({}, 'tint');

  const updateSetting = <T extends keyof NotificationSettings>(
    section: T,
    updates: Partial<NotificationSettings[T]>
  ) => {
    onSettingsChange({
      ...settings,
      [section]: {
        ...settings[section],
        ...updates,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Bedtime Reminder Section */}
      <ThemedView style={[styles.settingSection, { backgroundColor: cardBackground }]}>
        <View style={styles.settingHeader}>
          <IconSymbol name="moon.fill" size={20} color={primaryColor} />
          <ThemedText style={styles.sectionTitle}>Bedtime Reminder</ThemedText>
          <ToggleButton
            value={settings.bedtimeReminder.enabled}
            onValueChange={(enabled) => updateSetting('bedtimeReminder', { enabled })}
          />
        </View>
        
        {settings.bedtimeReminder.enabled && (
          <View style={styles.settingContent}>
            <View style={styles.timeRow}>
              <ThemedText style={styles.settingLabel}>Remind me at:</ThemedText>
              <TimePicker
                value={settings.bedtimeReminder.time}
                onChange={(time) => updateSetting('bedtimeReminder', { time })}
              />
            </View>
            
            <View style={styles.advanceRow}>
              <ThemedText style={styles.settingLabel}>Minutes before:</ThemedText>
              <View style={styles.advanceOptions}>
                {[15, 30, 45, 60].map((minutes) => (
                  <ToggleButton
                    key={minutes}
                    value={settings.bedtimeReminder.advanceMinutes === minutes}
                    onValueChange={() => updateSetting('bedtimeReminder', { advanceMinutes: minutes })}
                    title={`${minutes}m`}
                    variant="chip"
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ThemedView>

      {/* Wake Up Alarm Section */}
      <ThemedView style={[styles.settingSection, { backgroundColor: cardBackground }]}>
        <View style={styles.settingHeader}>
          <IconSymbol name="sun.max.fill" size={20} color={primaryColor} />
          <ThemedText style={styles.sectionTitle}>Wake Up Alarm</ThemedText>
          <ToggleButton
            value={settings.wakeUpAlarm.enabled}
            onValueChange={(enabled) => updateSetting('wakeUpAlarm', { enabled })}
          />
        </View>
        
        {settings.wakeUpAlarm.enabled && (
          <View style={styles.settingContent}>
            <View style={styles.timeRow}>
              <ThemedText style={styles.settingLabel}>Wake me at:</ThemedText>
              <TimePicker
                value={settings.wakeUpAlarm.time}
                onChange={(time) => updateSetting('wakeUpAlarm', { time })}
              />
            </View>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <ThemedText style={styles.settingLabel}>Smart Wake</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Wake you during lighter sleep phases
                </ThemedText>
              </View>
              <ToggleButton
                value={settings.wakeUpAlarm.smartWake}
                onValueChange={(smartWake) => updateSetting('wakeUpAlarm', { smartWake })}
              />
            </View>
          </View>
        )}
      </ThemedView>

      {/* Sleep Tracking Section */}
      <ThemedView style={[styles.settingSection, { backgroundColor: cardBackground }]}>
        <View style={styles.settingHeader}>
          <IconSymbol name="bed.double.fill" size={20} color={primaryColor} />
          <ThemedText style={styles.sectionTitle}>Sleep Tracking</ThemedText>
          <ToggleButton
            value={settings.sleepTracking.enabled}
            onValueChange={(enabled) => updateSetting('sleepTracking', { enabled })}
          />
        </View>
        
        {settings.sleepTracking.enabled && (
          <View style={styles.settingContent}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <ThemedText style={styles.settingLabel}>Auto Detection</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Automatically detect when you sleep
                </ThemedText>
              </View>
              <ToggleButton
                value={settings.sleepTracking.autoDetect}
                onValueChange={(autoDetect) => updateSetting('sleepTracking', { autoDetect })}
              />
            </View>
          </View>
        )}
      </ThemedView>

      {/* Insights Section */}
      <ThemedView style={[styles.settingSection, { backgroundColor: cardBackground }]}>
        <View style={styles.settingHeader}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={primaryColor} />
          <ThemedText style={styles.sectionTitle}>Sleep Insights</ThemedText>
          <ToggleButton
            value={settings.insights.enabled}
            onValueChange={(enabled) => updateSetting('insights', { enabled })}
          />
        </View>
        
        {settings.insights.enabled && (
          <View style={styles.settingContent}>
            <View style={styles.frequencyRow}>
              <ThemedText style={styles.settingLabel}>Frequency:</ThemedText>
              <View style={styles.frequencyOptions}>
                <ToggleButton
                  value={settings.insights.frequency === 'daily'}
                  onValueChange={() => updateSetting('insights', { frequency: 'daily' })}
                  title="Daily"
                  variant="chip"
                />
                <ToggleButton
                  value={settings.insights.frequency === 'weekly'}
                  onValueChange={() => updateSetting('insights', { frequency: 'weekly' })}
                  title="Weekly"
                  variant="chip"
                />
              </View>
            </View>
          </View>
        )}
      </ThemedView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingSection: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  settingContent: {
    marginTop: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  advanceRow: {
    marginTop: 12,
  },
  advanceOptions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleInfo: {
    flex: 1,
  },
  frequencyRow: {
    marginTop: 8,
  },
  frequencyOptions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
});

export default NotificationSettingsComponent;