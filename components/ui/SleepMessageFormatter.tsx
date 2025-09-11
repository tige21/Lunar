import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface SleepMessageFormatterProps {
  text: string;
  type?: 'text' | 'insight' | 'recommendation' | 'question';
}

/**
 * Enhanced message formatter for sleep-themed AI responses
 * Adds visual elements like sleep score highlights, time formatting, and sleep stage indicators
 */
export function SleepMessageFormatter({ text, type = 'text' }: SleepMessageFormatterProps) {
  const colorScheme = useColorScheme();

  const formatMessage = (message: string) => {
    // Enhanced formatting patterns for sleep data
    const patterns = [
      // Sleep scores (e.g., "87/100", "Your sleep score: 85")
      {
        regex: /(\b(?:sleep score|score):\s*)?(\d{1,3})(?:\/100|\%)?/gi,
        replacement: (match: string, prefix: string, score: string) => (
          <SleepScoreHighlight key={Math.random()} score={parseInt(score)} prefix={prefix} />
        ),
      },
      // Time formats (e.g., "10:30 PM", "7h 45m")
      {
        regex: /(\d{1,2}):(\d{2})\s*(AM|PM)|(\d{1,2})h\s*(\d{1,2})?m?/gi,
        replacement: (match: string) => (
          <TimeHighlight key={Math.random()} time={match} />
        ),
      },
      // Sleep stages
      {
        regex: /\b(deep sleep|REM sleep|light sleep|wake|awake)\b/gi,
        replacement: (match: string) => (
          <SleepStageHighlight key={Math.random()} stage={match.toLowerCase()} />
        ),
      },
      // Temperature
      {
        regex: /(\d{2,3})°?\s*([FC])/gi,
        replacement: (match: string) => (
          <TemperatureHighlight key={Math.random()} temp={match} />
        ),
      },
      // Bold formatting **text**
      {
        regex: /\*\*(.*?)\*\*/g,
        replacement: (match: string, content: string) => (
          <Text key={Math.random()} style={styles.boldText}>{content}</Text>
        ),
      },
      // Bullet points with sleep-themed icons
      {
        regex: /^[•·*-]\s/gm,
        replacement: () => (
          <SleepBulletPoint key={Math.random()} />
        ),
      },
    ];

    let formattedMessage: React.ReactNode[] = [text];
    
    patterns.forEach(pattern => {
      formattedMessage = formattedMessage.flatMap(part => {
        if (typeof part === 'string') {
          const parts: React.ReactNode[] = [];
          let lastIndex = 0;
          
          const matches = Array.from(part.matchAll(pattern.regex));
          matches.forEach(match => {
            if (match.index !== undefined) {
              // Add text before match
              if (match.index > lastIndex) {
                parts.push(part.slice(lastIndex, match.index));
              }
              
              // Add formatted match
              parts.push(pattern.replacement(match[0], ...match.slice(1)));
              
              lastIndex = match.index + match[0].length;
            }
          });
          
          // Add remaining text
          if (lastIndex < part.length) {
            parts.push(part.slice(lastIndex));
          }
          
          return parts.length > 0 ? parts : [part];
        }
        return [part];
      });
    });

    return formattedMessage;
  };

  return (
    <View>
      <Text style={styles.messageText}>
        {formatMessage(text)}
      </Text>
    </View>
  );
}

// Sleep Score Highlight Component
function SleepScoreHighlight({ score, prefix }: { score: number; prefix?: string }) {
  const colorScheme = useColorScheme();
  
  const getScoreColor = () => {
    if (score >= 85) return Colors.semantic.success;
    if (score >= 70) return Colors.semantic.warning;
    return Colors.semantic.error;
  };

  const getScoreGradient = () => {
    if (score >= 85) return [Colors.semantic.success, '#059669'];
    if (score >= 70) return [Colors.semantic.warning, '#D97706'];
    return [Colors.semantic.error, '#DC2626'];
  };

  return (
    <View style={styles.inlineHighlight}>
      {prefix && <Text style={styles.prefixText}>{prefix}</Text>}
      <LinearGradient
        colors={getScoreGradient()}
        style={styles.scoreContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.scoreText}>{score}</Text>
        <IconSymbol
          size={12}
          color="white"
          name={score >= 85 ? "star.fill" : score >= 70 ? "moon.fill" : "exclamationmark.triangle.fill"}
        />
      </LinearGradient>
    </View>
  );
}

// Time Highlight Component
function TimeHighlight({ time }: { time: string }) {
  return (
    <View style={[styles.inlineHighlight, styles.timeHighlight]}>
      <IconSymbol size={12} color={Colors.sleepStages.light} name="clock.fill" />
      <Text style={[styles.highlightText, { color: Colors.sleepStages.light }]}>
        {time}
      </Text>
    </View>
  );
}

// Sleep Stage Highlight Component
function SleepStageHighlight({ stage }: { stage: string }) {
  const getStageColor = () => {
    switch (stage) {
      case 'deep sleep': return Colors.sleepStages.deep;
      case 'rem sleep': return Colors.sleepStages.rem;
      case 'light sleep': return Colors.sleepStages.light;
      case 'wake':
      case 'awake': return Colors.sleepStages.wake;
      default: return Colors.sleepStages.light;
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case 'deep sleep': return 'moon.zzz.fill';
      case 'rem sleep': return 'brain.head.profile';
      case 'light sleep': return 'moon.fill';
      case 'wake':
      case 'awake': return 'sun.max.fill';
      default: return 'moon.fill';
    }
  };

  return (
    <View style={[styles.inlineHighlight, { backgroundColor: getStageColor() + '20' }]}>
      <IconSymbol size={12} color={getStageColor()} name={getStageIcon() as any} />
      <Text style={[styles.highlightText, { color: getStageColor() }]}>
        {stage}
      </Text>
    </View>
  );
}

// Temperature Highlight Component
function TemperatureHighlight({ temp }: { temp: string }) {
  return (
    <View style={[styles.inlineHighlight, styles.tempHighlight]}>
      <IconSymbol size={12} color={Colors.semantic.info} name="thermometer" />
      <Text style={[styles.highlightText, { color: Colors.semantic.info }]}>
        {temp}
      </Text>
    </View>
  );
}

// Sleep Bullet Point Component
function SleepBulletPoint() {
  return (
    <View style={styles.bulletContainer}>
      <LinearGradient
        colors={[Colors.sleepStages.rem, Colors.sleepStages.deep]}
        style={styles.bulletGradient}
      >
        <IconSymbol size={8} color="white" name="moon.stars.fill" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  messageText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  inlineHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 2,
    marginVertical: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  scoreText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  prefixText: {
    marginRight: 4,
    fontSize: 14,
  },
  timeHighlight: {
    backgroundColor: Colors.sleepStages.light + '20',
    gap: 4,
  },
  tempHighlight: {
    backgroundColor: Colors.semantic.info + '15',
    gap: 4,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '700',
  },
  bulletContainer: {
    marginRight: 8,
    marginLeft: 4,
  },
  bulletGradient: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});