import React from 'react';
import { ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SleepCard } from '@/components/ui/SleepCard';
import { SleepProgressBar } from '@/components/ui/SleepProgressBar';
import { ThemedButton } from '@/components/ui/ThemedButton';

/**
 * Example component demonstrating the Lunar sleep app theme system
 * This showcases how to use the themed components for sleep data visualization
 */
export function SleepDashboardExample() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={{ marginBottom: 24 }}>
          <ThemedText type="title" style={{ marginBottom: 8 }}>
            Good Evening
          </ThemedText>
          <ThemedText type="subtitle" style={{ opacity: 0.8 }}>
            Ready for quality sleep?
          </ThemedText>
        </ThemedView>

        {/* Sleep Quality Cards */}
        <ThemedView style={{ marginBottom: 24 }}>
          <ThemedText type="heading" style={{ marginBottom: 16 }}>
            Last Night's Sleep
          </ThemedText>
          
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <SleepCard
              title="Total Sleep"
              value="7h 42m"
              subtitle="+23 min"
              trend="up"
              sleepStage="deep"
              style={{ flex: 1 }}
            />
            <SleepCard
              title="Sleep Score"
              value="87"
              unit="/100"
              subtitle="Excellent"
              trend="up"
              sleepStage="rem"
              style={{ flex: 1 }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SleepCard
              title="Deep Sleep"
              value="2h 15m"
              subtitle="Optimal"
              trend="stable"
              sleepStage="deep"
              style={{ flex: 1 }}
            />
            <SleepCard
              title="REM Sleep"
              value="1h 58m"
              subtitle="Good"
              trend="up"
              sleepStage="rem"
              style={{ flex: 1 }}
            />
          </View>
        </ThemedView>

        {/* Sleep Stage Progress */}
        <ThemedView variant="card" style={{ marginBottom: 24, padding: 20 }}>
          <ThemedText type="heading" style={{ marginBottom: 20 }}>
            Sleep Stages
          </ThemedText>
          
          <View style={{ gap: 16 }}>
            <SleepProgressBar
              label="Deep Sleep"
              progress={0.65}
              sleepStage="deep"
              showPercentage
            />
            <SleepProgressBar
              label="REM Sleep"
              progress={0.45}
              sleepStage="rem"
              showPercentage
            />
            <SleepProgressBar
              label="Light Sleep"
              progress={0.75}
              sleepStage="light"
              showPercentage
            />
            <SleepProgressBar
              label="Awake Time"
              progress={0.15}
              sleepStage="wake"
              showPercentage
            />
          </View>
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={{ gap: 12, marginBottom: 24 }}>
          <ThemedButton variant="sleep-action" size="lg">
            Start Sleep Tracking
          </ThemedButton>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <ThemedButton variant="outline" style={{ flex: 1 }}>
              View History
            </ThemedButton>
            <ThemedButton variant="ghost" style={{ flex: 1 }}>
              Settings
            </ThemedButton>
          </View>
        </ThemedView>

        {/* Sleep Tips */}
        <ThemedView variant="surface" style={{ padding: 16, borderRadius: 12 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
            Tonight's Tip
          </ThemedText>
          <ThemedText type="default" style={{ opacity: 0.9 }}>
            Try keeping your bedroom temperature between 65-68°F (18-20°C) for optimal sleep quality.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

export default SleepDashboardExample;