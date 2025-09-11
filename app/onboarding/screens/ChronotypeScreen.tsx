import { ThemedButton, ThemedText, ThemedView } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface ChronotypeScreenProps {
  onNext?: (chronotype: ChronotypeResult) => void;
}

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    value: number; // Points toward morning (negative) or evening (positive)
    emoji: string;
  }[];
}

interface ChronotypeResult {
  type: 'morning' | 'evening' | 'neither';
  score: number;
  description: string;
  recommendations: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "When do you naturally feel most alert and energetic?",
    options: [
      { text: "Early morning (6-9 AM)", value: -2, emoji: "🌅" },
      { text: "Late morning (9-12 PM)", value: -1, emoji: "☀️" },
      { text: "Afternoon (12-6 PM)", value: 0, emoji: "🏃‍♀️" },
      { text: "Evening (6-10 PM)", value: 1, emoji: "🌆" },
      { text: "Late evening (after 10 PM)", value: 2, emoji: "🌙" },
    ]
  },
  {
    id: 2,
    question: "If you had no commitments, what time would you naturally go to bed?",
    options: [
      { text: "Before 10 PM", value: -2, emoji: "😴" },
      { text: "10 PM - 11 PM", value: -1, emoji: "🛌" },
      { text: "11 PM - 12 AM", value: 0, emoji: "💤" },
      { text: "12 AM - 1 AM", value: 1, emoji: "🌃" },
      { text: "After 1 AM", value: 2, emoji: "🦉" },
    ]
  },
  {
    id: 3,
    question: "What time would you naturally wake up without an alarm?",
    options: [
      { text: "Before 6 AM", value: -2, emoji: "🐓" },
      { text: "6 AM - 7 AM", value: -1, emoji: "🌅" },
      { text: "7 AM - 8 AM", value: 0, emoji: "☀️" },
      { text: "8 AM - 10 AM", value: 1, emoji: "😊" },
      { text: "After 10 AM", value: 2, emoji: "😴" },
    ]
  },
  {
    id: 4,
    question: "When do you prefer to exercise?",
    options: [
      { text: "Early morning", value: -2, emoji: "🏃‍♂️" },
      { text: "Late morning", value: -1, emoji: "🚴‍♀️" },
      { text: "Afternoon", value: 0, emoji: "⚽" },
      { text: "Early evening", value: 1, emoji: "🏋️‍♀️" },
      { text: "Late evening", value: 2, emoji: "🌙" },
    ]
  },
  {
    id: 5,
    question: "When is your appetite strongest?",
    options: [
      { text: "Right after waking up", value: -2, emoji: "🥞" },
      { text: "Mid-morning", value: -1, emoji: "🥯" },
      { text: "Lunch time", value: 0, emoji: "🥗" },
      { text: "Dinner time", value: 1, emoji: "🍽️" },
      { text: "Late evening/night", value: 2, emoji: "🍕" },
    ]
  },
  {
    id: 6,
    question: "How do you feel immediately after waking up?",
    options: [
      { text: "Fully alert and ready", value: -2, emoji: "⚡" },
      { text: "Fairly alert", value: -1, emoji: "😊" },
      { text: "Neither alert nor tired", value: 0, emoji: "😐" },
      { text: "A little tired", value: 1, emoji: "😴" },
      { text: "Very tired", value: 2, emoji: "🥱" },
    ]
  },
  {
    id: 7,
    question: "At what time do you feel tired and ready for sleep?",
    options: [
      { text: "8 PM - 9 PM", value: -2, emoji: "😴" },
      { text: "9 PM - 10:15 PM", value: -1, emoji: "💤" },
      { text: "10:15 PM - 12:45 AM", value: 0, emoji: "🛌" },
      { text: "12:45 AM - 2 AM", value: 1, emoji: "🌃" },
      { text: "After 2 AM", value: 2, emoji: "🦉" },
    ]
  }
];

function getChronotypeResult(score: number): ChronotypeResult {
  if (score <= -6) {
    return {
      type: 'morning',
      score,
      description: "You're a definite Morning Person! You naturally wake up early and feel most energetic in the first half of the day.",
      recommendations: [
        "Try to get sunlight exposure within 30 minutes of waking",
        "Schedule important tasks for morning hours",
        "Aim for bedtime between 9-10 PM for optimal rest",
        "Avoid caffeine after 2 PM to support early sleep"
      ]
    };
  } else if (score >= 6) {
    return {
      type: 'evening',
      score,
      description: "You're a definite Evening Person! You feel more alert and productive during the later hours of the day.",
      recommendations: [
        "Try to get bright light exposure in the evening",
        "Schedule demanding tasks for afternoon/evening",
        "Create a consistent bedtime routine even if it's later",
        "Consider blackout curtains for better morning sleep"
      ]
    };
  } else {
    return {
      type: 'neither',
      score,
      description: "You're somewhere in between! You have a flexible sleep schedule and can adapt to different routines.",
      recommendations: [
        "Maintain consistent sleep and wake times",
        "Adjust your schedule based on daily demands",
        "Pay attention to your body's natural signals",
        "Use light exposure to shift your rhythm when needed"
      ]
    };
  }
}

export default function ChronotypeScreen({ onNext }: ChronotypeScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [chronotypeResult, setChronotypeResult] = useState<ChronotypeResult | null>(null);

  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  
  // Animation values
  const questionProgress = useSharedValue(0);
  const optionScale = useSharedValue(1);
  const resultScale = useSharedValue(0);

  useEffect(() => {
    questionProgress.value = withTiming((currentQuestion + 1) / QUESTIONS.length, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [currentQuestion]);

  const handleOptionSelect = async (optionIndex: number, value: number) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedOption(optionIndex);
    optionScale.value = withSpring(0.95, {}, () => {
      optionScale.value = withSpring(1);
    });

    // Wait for animation then proceed
    setTimeout(() => {
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);

      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        // Calculate result
        const totalScore = newAnswers.reduce((sum, score) => sum + score, 0);
        const result = getChronotypeResult(totalScore);
        setChronotypeResult(result);
        setShowResults(true);
        resultScale.value = withSpring(1, { damping: 15 });
      }
    }, 300);
  };

  const handleNext = () => {
    if (chronotypeResult && onNext) {
      onNext(chronotypeResult);
    }
  };

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${questionProgress.value * 100}%`,
    };
  });

  const optionAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: optionScale.value }],
    };
  });

  const resultAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: resultScale.value }],
      opacity: resultScale.value,
    };
  });

  if (showResults && chronotypeResult) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Animated.View style={[styles.resultsContainer, resultAnimatedStyle]}>
          <ThemedView style={styles.resultHeader}>
            <ThemedText style={styles.resultEmoji}>
              {chronotypeResult.type === 'morning' ? '🌅' : 
               chronotypeResult.type === 'evening' ? '🌙' : '⚖️'}
            </ThemedText>
            <ThemedText type="title" style={styles.resultTitle}>
              {chronotypeResult.type === 'morning' ? 'Morning Person' :
               chronotypeResult.type === 'evening' ? 'Evening Person' : 'Flexible Sleeper'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.resultCard, { backgroundColor: surfaceColor }]}>
            <ThemedText type="body" style={styles.resultDescription}>
              {chronotypeResult.description}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.recommendationsContainer}>
            <ThemedText type="subtitle" style={styles.recommendationsTitle}>
              Personalized Sleep Tips
            </ThemedText>
            {chronotypeResult.recommendations.map((rec, index) => (
              <Animated.View 
                key={index}
                entering={FadeIn.delay(index * 100)}
                style={[styles.recommendationItem, { backgroundColor: surfaceColor }]}
              >
                <ThemedText style={styles.recommendationBullet}>•</ThemedText>
                <ThemedText type="caption" style={styles.recommendationText}>
                  {rec}
                </ThemedText>
              </Animated.View>
            ))}
          </ThemedView>

          <ThemedButton
            variant="primary"
            size="large"
            fullWidth
            onPress={handleNext}
            style={styles.nextButton}
          >
            Continue
          </ThemedButton>
        </Animated.View>
      </ThemedView>
    );
  }

  const currentQ = QUESTIONS[currentQuestion];

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Progress Indicator */}
      <ThemedView style={styles.progressContainer}>
        <ThemedView style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: primaryColor },
              progressStyle,
            ]}
          />
        </ThemedView>
        <ThemedText type="caption" style={styles.progressText}>
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </ThemedText>
      </ThemedView>

      {/* Question */}
      <Animated.View 
        key={currentQuestion}
        entering={SlideInRight.delay(100)}
        exiting={SlideOutLeft}
        style={styles.questionContainer}
      >
        <ThemedText type="title" style={styles.questionText}>
          {currentQ.question}
        </ThemedText>
      </Animated.View>

      {/* Options */}
      <ThemedView style={styles.optionsContainer}>
        {currentQ.options.map((option, index) => (
          <Animated.View
            key={index}
            entering={FadeIn.delay(200 + index * 50)}
          >
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: surfaceColor },
                selectedOption === index && { backgroundColor: primaryColor },
              ]}
              onPress={() => handleOptionSelect(index, option.value)}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.optionEmoji}>
                {option.emoji}
              </ThemedText>
              <ThemedText
                type="body"
                style={[
                  styles.optionText,
                  { color: selectedOption === index ? '#FFFFFF' : textColor },
                ]}
              >
                {option.text}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  questionContainer: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  questionText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    flex: 1,
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  resultDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginBottom: 32,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recommendationBullet: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  nextButton: {
    marginTop: 16,
  },
});