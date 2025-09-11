import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SafeContainer } from '@/components/ui/SafeContainer';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ChatScreen() {
  const backgroundColorRaw = useThemeColor({}, 'background');
  const backgroundColor = typeof backgroundColorRaw === 'string' ? backgroundColorRaw : '#F8FAFC';

  return (
    <SafeContainer>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            AI Chat Coming Soon! 🤖
          </ThemedText>
          <ThemedText type="body" style={styles.description}>
            Your AI sleep assistant Luna will be available here soon.
            We're working on making the chat experience amazing for you.
          </ThemedText>
          
          <ThemedView style={styles.preview}>
            <ThemedText style={styles.emoji}>💭</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.previewText}>
              "How did I sleep last night?"
            </ThemedText>
            <ThemedText type="body" style={styles.previewResponse}>
              Luna: "Based on your sleep data, you had 7.5 hours of sleep with 85% efficiency. Your deep sleep was particularly good last night!"
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 40,
    maxWidth: '90%',
  },
  preview: {
    backgroundColor: 'rgba(91, 33, 182, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxWidth: '90%',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#5B21B6',
  },
  previewResponse: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
});