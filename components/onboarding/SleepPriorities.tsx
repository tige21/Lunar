import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, ThemedText, ToggleButton } from '@/components/ui';

interface SleepPriority {
  id: string;
  label: string;
  icon: string;
}

interface SleepPrioritiesProps {
  priorities: string[];
  onPrioritiesChange: (priorities: string[]) => void;
}

const SLEEP_PRIORITIES: SleepPriority[] = [
  { id: 'duration', label: 'Sleep Duration', icon: '⏰' },
  { id: 'quality', label: 'Sleep Quality', icon: '✨' },
  { id: 'consistency', label: 'Sleep Schedule', icon: '📅' },
  { id: 'recovery', label: 'Recovery', icon: '💪' },
  { id: 'energy', label: 'Morning Energy', icon: '☀️' },
  { id: 'mood', label: 'Mood & Focus', icon: '🧠' },
];

const SleepPriorities = memo(({ priorities, onPrioritiesChange }: SleepPrioritiesProps) => {
  
  const handlePriorityToggle = (priorityId: string) => {
    const newPriorities = priorities.includes(priorityId)
      ? priorities.filter(id => id !== priorityId)
      : [...priorities, priorityId];
    
    onPrioritiesChange(newPriorities);
  };

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        What are your sleep priorities?
      </ThemedText>
      <ThemedText type="body" style={styles.sectionDescription}>
        Choose the areas you'd like to focus on improving (select multiple)
      </ThemedText>
      
      <ThemedView style={styles.prioritiesGrid}>
        {SLEEP_PRIORITIES.map((priority) => (
          <ToggleButton
            key={priority.id}
            isSelected={priorities.includes(priority.id)}
            onPress={() => handlePriorityToggle(priority.id)}
            style={styles.priorityButton}
          >
            <ThemedView style={styles.priorityContent}>
              <ThemedText style={styles.priorityIcon}>{priority.icon}</ThemedText>
              <ThemedText type="body" style={styles.priorityLabel}>
                {priority.label}
              </ThemedText>
            </ThemedView>
          </ToggleButton>
        ))}
      </ThemedView>
    </ThemedView>
  );
});

SleepPriorities.displayName = 'SleepPriorities';

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
  },
  prioritiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priorityButton: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  priorityContent: {
    alignItems: 'center',
    gap: 8,
  },
  priorityIcon: {
    fontSize: 24,
  },
  priorityLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SleepPriorities;