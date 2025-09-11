import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ThemedView, ThemedText } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface BenefitCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

function BenefitCard({ icon, title, description, color, delay = 0 }: BenefitCardProps) {
  const cardBackground = useThemeColor({}, 'surface');
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
  }, [delay]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  
  return (
    <Animated.View style={[styles.benefitCard, { backgroundColor: cardBackground }, animatedStyle]}>
      <ThemedView style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <ThemedText style={[styles.icon, { color }]}>
          {icon}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.cardContent}>
        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
          {title}
        </ThemedText>
        <ThemedText type="body" style={styles.cardDescription}>
          {description}
        </ThemedText>
      </ThemedView>
    </Animated.View>
  );
}

interface BenefitsScreenProps {
  onNext?: () => void;
}

export default function BenefitsScreen({ onNext }: BenefitsScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'tint');
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
  }, []);
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));
  
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const benefits = [
    {
      icon: '🎁',
      title: '100% Free Forever',
      description: 'No premium plans, no hidden costs. Full access to all features, always.',
      color: Colors.semantic.success,
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'Your sleep data stays on your device. No cloud storage, no data sharing.',
      color: primaryColor,
    },
    {
      icon: '🧠',
      title: 'AI Sleep Analysis',
      description: 'Advanced algorithms provide personalized insights to improve your sleep quality.',
      color: Colors.semantic.info,
    },
    {
      icon: '📊',
      title: 'Detailed Analytics',
      description: 'Track sleep stages, patterns, and trends with comprehensive visualizations.',
      color: Colors.sleepStages.rem,
    },
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description: 'Set personalized sleep goals and monitor your progress over time.',
      color: Colors.sleepStages.wake,
    },
    {
      icon: '💡',
      title: 'Smart Recommendations',
      description: 'Receive tailored suggestions to optimize your sleep routine and environment.',
      color: Colors.semantic.warning,
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <ThemedText type="title" style={styles.title}>
          Why Choose Lunar?
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Discover what makes our sleep analysis different
        </ThemedText>
      </Animated.View>

      {/* Benefits Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.benefitsGrid, contentAnimatedStyle]}>
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              color={benefit.color}
              delay={index * 100}
            />
          ))}
        </Animated.View>

        {/* Trust Indicators */}
        <Animated.View style={[styles.trustSection, contentAnimatedStyle]}>
          <ThemedText type="defaultSemiBold" style={styles.trustTitle}>
            Built for Sleep Science
          </ThemedText>
          <ThemedView style={styles.trustIndicators}>
            <ThemedView style={styles.trustItem}>
              <ThemedText style={styles.trustIcon}>🏥</ThemedText>
              <ThemedText type="caption" style={styles.trustText}>
                Research-backed algorithms
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.trustItem}>
              <ThemedText style={styles.trustIcon}>🌙</ThemedText>
              <ThemedText type="caption" style={styles.trustText}>
                Sleep specialist designed
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  benefitsGrid: {
    gap: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  trustSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  trustTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  trustIndicators: {
    flexDirection: 'row',
    gap: 24,
  },
  trustItem: {
    alignItems: 'center',
    gap: 8,
  },
  trustIcon: {
    fontSize: 20,
  },
  trustText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});