import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { ThemedView } from '../ThemedView';
import OnboardingNavigation from './OnboardingNavigation';
import { SwipeableProgress } from './SwipeableProgress';

const { width } = Dimensions.get('window');

export interface OnboardingPagerProps {
  children: React.ReactNode[];
  totalSteps: number;
  onComplete?: () => void;
}

export function OnboardingPager({ children, totalSteps, onComplete }: OnboardingPagerProps) {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const animatedPosition = useSharedValue(0);
  const containerScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);
  
  useEffect(() => {
    // Initial entrance animation
    containerScale.value = withSpring(1, {
      damping: 15,
      stiffness: 120,
    });
    containerOpacity.value = withTiming(1, { duration: 400 });
  }, []);

  const triggerPageChangeAnimation = useCallback(() => {
    // Subtle scale animation on page change
    containerScale.value = withSpring(0.98, {
      damping: 20,
      stiffness: 300,
    }, (finished) => {
      if (finished) {
        containerScale.value = withSpring(1, {
          damping: 15,
          stiffness: 200,
        });
      }
    });
  }, []);

  const handlePageSelected = useCallback((event: any) => {
    const { position } = event.nativeEvent;
    setCurrentPage(position);
    animatedPosition.value = withSpring(position, {
      damping: 15,
      stiffness: 120,
    });
    
    // Trigger page change animation
    runOnJS(triggerPageChangeAnimation)();
    
    // Enhanced haptic feedback on page change
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [animatedPosition, triggerPageChangeAnimation]);

  const handlePageScroll = useCallback((event: any) => {
    const { position, offset } = event.nativeEvent;
    const smoothPosition = position + offset;
    animatedPosition.value = smoothPosition;
    
    // Dynamic opacity based on scroll progress for smoother transitions
    const scrollProgress = offset;
    containerOpacity.value = interpolate(
      Math.abs(scrollProgress),
      [0, 0.5, 1],
      [1, 0.95, 1],
      Extrapolate.CLAMP
    );
  }, [animatedPosition, containerOpacity]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalSteps - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentPage, totalSteps, onComplete]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
    }
  }, [currentPage]);

  const skipToEnd = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else {
      router.push('/onboarding/completion');
    }
  }, [onComplete]);

  // Enhanced animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: containerScale.value }],
      opacity: containerOpacity.value,
    };
  });

  const pagerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            animatedPosition.value,
            [0, totalSteps - 1],
            [0, -width * 0.02], // Subtle parallax effect
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Navigation */}
      <OnboardingNavigation
        currentStep={currentPage + 1}
        totalSteps={totalSteps}
        onBack={goToPreviousPage}
        onSkip={skipToEnd}
        canGoBack={currentPage > 0}
        canSkip={currentPage < totalSteps - 1}
        skipText={currentPage === totalSteps - 1 ? 'Complete' : 'Skip'}
      />
      
      {/* Enhanced Progress */}
      <SwipeableProgress 
        currentStep={currentPage + 1} 
        totalSteps={totalSteps} 
        style={styles.progress}
        animated={true}
      />
      
      {/* Enhanced Pager with animations */}
      <Animated.View style={[styles.pager, pagerAnimatedStyle]}>
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={handlePageSelected}
          onPageScroll={handlePageScroll}
          orientation="horizontal"
          scrollEnabled={true}
          keyboardDismissMode="on-drag"
          pageMargin={0}
          overdrag={true}
          offscreenPageLimit={1}
        >
          {children.map((child, index) => (
            <ThemedView key={index} style={styles.pageContainer}>
              {child}
            </ThemedView>
          ))}
        </PagerView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progress: {
    paddingHorizontal: 24,
  },
  pager: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
});

export default OnboardingPager;