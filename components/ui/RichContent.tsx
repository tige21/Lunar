import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LazyComponent from '@/components/optimizations/LazyComponent';

export type RichContentType = 
  | 'sleep_score'
  | 'sleep_trend'
  | 'sleep_phases'
  | 'bedtime_recommendation'
  | 'environment_tip'
  | 'progress_tracker'
  | 'sleep_comparison';

export interface RichContentData {
  type: RichContentType;
  data: any;
  metadata?: {
    title?: string;
    subtitle?: string;
    timestamp?: Date;
  };
}

interface RichContentProps {
  content: RichContentData;
  isUser?: boolean;
}

// Lazy-loaded content components
const SleepScoreContent = LazyComponent(
  () => import('@/components/ui/richcontent/SleepScoreContent'),
  { fallback: <ThemedView style={styles.fallback} /> }
);

const SleepTrendContent = LazyComponent(
  () => import('@/components/ui/richcontent/SleepTrendContent'),
  { fallback: <ThemedView style={styles.fallback} /> }
);

// Simple content components for non-complex types
const SimpleContent = memo(function SimpleContent({ 
  content 
}: { 
  content: RichContentData 
}) {
  const { type, data, metadata } = content;
  
  switch (type) {
    case 'bedtime_recommendation':
      return (
        <View style={styles.simpleContainer}>
          <ThemedText style={styles.simpleTitle}>
            💡 Bedtime Recommendation
          </ThemedText>
          <ThemedText style={styles.simpleText}>
            {data.recommendation}
          </ThemedText>
          {data.reason && (
            <ThemedText style={styles.simpleSubtext}>
              {data.reason}
            </ThemedText>
          )}
        </View>
      );
      
    case 'environment_tip':
      return (
        <View style={styles.simpleContainer}>
          <ThemedText style={styles.simpleTitle}>
            🌙 Sleep Environment Tip
          </ThemedText>
          <ThemedText style={styles.simpleText}>
            {data.tip}
          </ThemedText>
        </View>
      );
      
    case 'progress_tracker':
      return (
        <View style={styles.simpleContainer}>
          <ThemedText style={styles.simpleTitle}>
            📈 Progress Update
          </ThemedText>
          <ThemedText style={styles.simpleText}>
            {data.message}
          </ThemedText>
          {data.progress && (
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${data.progress}%` }
                ]} 
              />
            </View>
          )}
        </View>
      );
      
    default:
      return (
        <View style={styles.simpleContainer}>
          <ThemedText style={styles.simpleText}>
            {JSON.stringify(data, null, 2)}
          </ThemedText>
        </View>
      );
  }
});

export const RichContent = memo(function RichContent({ 
  content, 
  isUser = false 
}: RichContentProps) {
  const renderContent = () => {
    switch (content.type) {
      case 'sleep_score':
        return <SleepScoreContent data={content.data} />;
        
      case 'sleep_trend':
        return <SleepTrendContent data={content.data} />;
        
      case 'sleep_phases':
      case 'sleep_comparison':
        // These could be further optimized with their own lazy components
        return <SimpleContent content={content} />;
        
      default:
        return <SimpleContent content={content} />;
    }
  };

  return (
    <View style={[
      styles.container,
      isUser && styles.userContent
    ]}>
      {content.metadata?.title && (
        <ThemedText style={styles.metadataTitle}>
          {content.metadata.title}
        </ThemedText>
      )}
      {renderContent()}
      {content.metadata?.timestamp && (
        <ThemedText style={styles.metadataTimestamp}>
          {content.metadata.timestamp.toLocaleTimeString()}
        </ThemedText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  userContent: {
    alignSelf: 'flex-end',
  },
  fallback: {
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  metadataTimestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    textAlign: 'right',
  },
  simpleContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 4,
  },
  simpleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  simpleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  simpleSubtext: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 6,
    fontStyle: 'italic',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
});

export default RichContent;