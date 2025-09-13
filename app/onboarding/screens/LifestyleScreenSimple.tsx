import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView, ThemedText, TitleText, BodyText } from "@/components/ui";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { onboardingService } from "@/lib/database/onboardingService";

interface LifestyleScreenProps {
  onNext?: () => void;
}

export default function LifestyleScreenSimple({
  onNext,
}: LifestyleScreenProps) {
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  const [exerciseFrequency, setExerciseFrequency] = useState<
    "none" | "rarely" | "weekly" | "several_times_week" | "daily"
  >("weekly");
  const [exerciseTime, setExerciseTime] = useState<
    "morning" | "afternoon" | "evening"
  >("afternoon");
  const [screenTime, setScreenTime] = useState("30");
  const [caffeineIntake, setCaffeineIntake] = useState<
    "none" | "low" | "moderate" | "high"
  >("moderate");
  const [alcoholIntake, setAlcoholIntake] = useState<
    "none" | "rarely" | "moderate" | "frequent"
  >("rarely");
  const [stressLevel, setStressLevel] = useState("3");
  const [workSchedule, setWorkSchedule] = useState<
    "regular" | "shift" | "flexible" | "irregular"
  >("regular");
  const [isLoading, setIsLoading] = useState(false);

  const exerciseOptions = [
    { value: "none", label: "None" },
    { value: "rarely", label: "Rarely" },
    { value: "weekly", label: "Weekly" },
    { value: "several_times_week", label: "2-3x/week" },
    { value: "daily", label: "Daily" },
  ] as const;

  const exerciseTimeOptions = [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
  ] as const;

  const caffeineOptions = [
    { value: "none", label: "None" },
    { value: "low", label: "Low (1 cup)" },
    { value: "moderate", label: "Moderate (2-3)" },
    { value: "high", label: "High (4+)" },
  ] as const;

  const alcoholOptions = [
    { value: "none", label: "None" },
    { value: "rarely", label: "Rarely" },
    { value: "moderate", label: "Moderate" },
    { value: "frequent", label: "Frequent" },
  ] as const;

  const workOptions = [
    { value: "regular", label: "9-5 Regular" },
    { value: "shift", label: "Shift Work" },
    { value: "flexible", label: "Flexible Hours" },
    { value: "irregular", label: "Irregular" },
  ] as const;

  const handleNext = async () => {
    setIsLoading(true);

    try {
      await onboardingService.updateExtendedDataSection("lifestyle", {
        exerciseFrequency,
        exerciseTime: exerciseFrequency !== "none" ? exerciseTime : undefined,
        screenTimeBeforeBed: parseInt(screenTime) || 30,
        caffeineIntake,
        alcoholIntake,
        stressLevel: parseInt(stressLevel) || 3,
        workSchedule,
      });

      onNext?.();
    } catch (error) {
      console.error("Error saving lifestyle data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const SimpleButton = ({
    title,
    selected,
    onPress,
  }: {
    title: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        {
          backgroundColor: selected ? tintColor : "transparent",
          borderColor: tintColor,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedText
        style={[styles.optionText, { color: selected ? "#FFFFFF" : textColor }]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  const getStressLevelText = (level: string) => {
    const num = parseInt(level) || 3;
    if (num <= 2) return "Low";
    if (num <= 3) return "Moderate";
    if (num <= 4) return "High";
    return "Very High";
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedView
          style={[styles.iconContainer, { backgroundColor: tintColor + "20" }]}
        >
          <IconSymbol name="figure.run" size={32} color={tintColor} />
        </ThemedView>

        <TitleText style={styles.title}>Lifestyle & Habits</TitleText>

        <BodyText style={styles.description}>
          Your daily habits affect your sleep quality. Let&apos;s understand
          your lifestyle better.
        </BodyText>
      </ThemedView>

      {/* Exercise */}
      <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
        <ThemedText style={styles.sectionTitle}>🏃‍♀️ Exercise</ThemedText>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>
            How often do you exercise?
          </ThemedText>
          <ThemedView style={styles.optionsGrid}>
            {exerciseOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={exerciseFrequency === option.value}
                onPress={() => setExerciseFrequency(option.value)}
              />
            ))}
          </ThemedView>
        </ThemedView>

        {exerciseFrequency !== "none" && (
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              When do you usually exercise?
            </ThemedText>
            <ThemedView style={styles.optionsRow}>
              {exerciseTimeOptions.map((option) => (
                <SimpleButton
                  key={option.value}
                  title={option.label}
                  selected={exerciseTime === option.value}
                  onPress={() => setExerciseTime(option.value)}
                />
              ))}
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>

      {/* Screen Time */}
      <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
        <ThemedText style={styles.sectionTitle}>📱 Screen Time</ThemedText>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>
            Screen time before bed (minutes)
          </ThemedText>
          <TextInput
            style={[
              styles.numberInput,
              { borderColor: tintColor + "30", color: textColor },
            ]}
            value={screenTime}
            onChangeText={setScreenTime}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor={textColor + "60"}
          />
        </ThemedView>
      </ThemedView>

      {/* Substances */}
      <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
        <ThemedText style={styles.sectionTitle}>
          ☕ Caffeine & Alcohol
        </ThemedText>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>
            Daily caffeine intake
          </ThemedText>
          <ThemedView style={styles.optionsGrid}>
            {caffeineOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={caffeineIntake === option.value}
                onPress={() => setCaffeineIntake(option.value)}
              />
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Alcohol consumption</ThemedText>
          <ThemedView style={styles.optionsGrid}>
            {alcoholOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={alcoholIntake === option.value}
                onPress={() => setAlcoholIntake(option.value)}
              />
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Stress & Work */}
      <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
        <ThemedText style={styles.sectionTitle}>💼 Work & Stress</ThemedText>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>
            Current stress level (1-5)
          </ThemedText>
          <ThemedText style={styles.valueText}>
            Level {stressLevel} - {getStressLevelText(stressLevel)}
          </ThemedText>
          <TextInput
            style={[
              styles.numberInput,
              { borderColor: tintColor + "30", color: textColor },
            ]}
            value={stressLevel}
            onChangeText={(text) => {
              const num = parseInt(text) || 1;
              if (num >= 1 && num <= 5) {
                setStressLevel(text);
              }
            }}
            keyboardType="numeric"
            placeholder="3"
            placeholderTextColor={textColor + "60"}
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Work schedule type</ThemedText>
          <ThemedView style={styles.optionsGrid}>
            {workOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={workSchedule === option.value}
                onPress={() => setWorkSchedule(option.value)}
              />
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.spacer} />

      {/* Action Button */}
      <ThemedView style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: isLoading ? tintColor + "60" : tintColor,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleNext}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.continueButtonText}>
            {isLoading ? "Saving..." : "Continue"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 22,
    maxWidth: "90%",
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "center",
    width: 80,
    alignSelf: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  spacer: {
    height: 40,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
