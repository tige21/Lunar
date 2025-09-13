import { useThemeColor } from '@/hooks/useThemeColor';
import { languageDetector } from '@/lib/languageDetection';
import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  Easing,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChronotypeHeader,
  ChronotypeQuestion,
  ChronotypeResults,
  ChronotypeScreenProps,
  ChronotypeResult,
  messages,
  getChronotypeResult
} from '@/components/ui/ChronotypeScreen';


export default function ChronotypeScreen({ onNext, language }: ChronotypeScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [chronotypeResult, setChronotypeResult] = useState<ChronotypeResult | null>(null);

  // Detect device language if not provided
  const deviceLanguage = useMemo(() => {
    if (language) return language;
    const detectedLang = languageDetector.getDeviceLanguage();
    return detectedLang === 'ru' ? 'ru' : 'en';
  }, [language]);

  // Get localized questions
  const QUESTIONS = messages[deviceLanguage].questions;

  const backgroundColor = useThemeColor({}, 'background');

  // Animation values
  const questionProgress = useSharedValue(0);
  const optionScale = useSharedValue(1);
  const resultScale = useSharedValue(0);

  useEffect(() => {
    questionProgress.value = withTiming((currentQuestion + 1) / QUESTIONS.length, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [currentQuestion, QUESTIONS.length, questionProgress]);

  const handleOptionSelect = async (optionIndex: number, value: number) => {
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
        const result = getChronotypeResult(totalScore, deviceLanguage);
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


  if (showResults && chronotypeResult) {
    return (
      <ChronotypeResults
        result={chronotypeResult}
        resultScale={resultScale}
        onNext={handleNext}
        language={deviceLanguage}
      />
    );
  }

  const currentQ = QUESTIONS[currentQuestion];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <ChronotypeHeader
        currentQuestion={currentQuestion}
        totalQuestions={QUESTIONS.length}
        questionProgress={questionProgress}
        language={deviceLanguage}
      />

      <ChronotypeQuestion
        question={currentQ}
        questionIndex={currentQuestion}
        selectedOption={selectedOption}
        onOptionSelect={handleOptionSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});