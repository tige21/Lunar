import React, { memo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { InteractionManager, AppState, AppStateStatus } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';

interface LazyAnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  enabled?: boolean;
  highPriority?: boolean;
  onAnimationComplete?: () => void;
  triggerWhenVisible?: boolean;
  threshold?: number;
}

interface LazyAnimationRef {
  start: () => void;
  stop: () => void;
  reset: () => void;
}

// Animation queue manager for performance optimization
class AnimationQueue {
  private static instance: AnimationQueue;
  private queue: Array<() => void> = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private running = new Set<string>();

  static getInstance(): AnimationQueue {
    if (!AnimationQueue.instance) {
      AnimationQueue.instance = new AnimationQueue();
    }
    return AnimationQueue.instance;
  }

  add(id: string, animation: () => void, highPriority = false) {
    if (this.running.size >= this.maxConcurrent && !highPriority) {
      this.queue.push(() => this.execute(id, animation));
      return;
    }
    
    this.execute(id, animation);
  }

  private execute(id: string, animation: () => void) {
    this.running.add(id);
    
    try {
      animation();
    } catch (error) {
      console.warn('Animation error:', error);
    }
    
    // Cleanup after animation
    setTimeout(() => {
      this.running.delete(id);
      this.processQueue();
    }, 100);
  }

  private processQueue() {
    if (this.queue.length > 0 && this.running.size < this.maxConcurrent) {
      const nextAnimation = this.queue.shift();
      if (nextAnimation) {
        nextAnimation();
      }
    }
  }

  clear() {
    this.queue = [];
    this.running.clear();
  }
}

const LazyAnimation = memo(forwardRef<LazyAnimationRef, LazyAnimationProps>(({
  children,
  delay = 0,
  duration = 300,
  enabled = true,
  highPriority = false,
  onAnimationComplete,
  triggerWhenVisible = true,
  threshold = 0.1,
}, ref) => {
  const [shouldAnimate, setShouldAnimate] = useState(!triggerWhenVisible);
  const [isAppActive, setIsAppActive] = useState(true);
  const animationId = useRef(`anim_${Date.now()}_${Math.random()}`).current;
  const hasAnimated = useRef(false);
  const animationRef = useRef<any>(null);

  // Animation values
  const opacity = useSharedValue(triggerWhenVisible ? 0 : 1);
  const scale = useSharedValue(triggerWhenVisible ? 0.95 : 1);
  const translateY = useSharedValue(triggerWhenVisible ? 20 : 0);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }), []);

  // Start animation function
  const startAnimation = () => {
    if (!enabled || !isAppActive || hasAnimated.current) return;

    const animationQueue = AnimationQueue.getInstance();
    
    animationQueue.add(animationId, () => {
      hasAnimated.current = true;
      
      opacity.value = withTiming(1, { duration });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      
      translateY.value = withDelay(
        delay,
        withTiming(0, { duration }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        })
      );
    }, highPriority);
  };

  // Stop animation function
  const stopAnimation = () => {
    cancelAnimation(opacity);
    cancelAnimation(scale);
    cancelAnimation(translateY);
  };

  // Reset animation function
  const resetAnimation = () => {
    stopAnimation();
    hasAnimated.current = false;
    opacity.value = triggerWhenVisible ? 0 : 1;
    scale.value = triggerWhenVisible ? 0.95 : 1;
    translateY.value = triggerWhenVisible ? 20 : 0;
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    start: startAnimation,
    stop: stopAnimation,
    reset: resetAnimation,
  }), []);

  // App state monitoring for performance
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setIsAppActive(nextAppState === 'active');
      
      if (nextAppState === 'background') {
        stopAnimation();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Trigger animation when component becomes visible
  useEffect(() => {
    if (shouldAnimate && enabled) {
      // Use InteractionManager to ensure smooth performance
      const interaction = InteractionManager.runAfterInteractions(() => {
        startAnimation();
      });

      return () => interaction.cancel();
    }
  }, [shouldAnimate, enabled]);

  // Auto-trigger if not waiting for visibility
  useEffect(() => {
    if (!triggerWhenVisible) {
      setShouldAnimate(true);
    }
  }, [triggerWhenVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, []);

  // Manual trigger method for external use
  const triggerAnimation = () => {
    if (!shouldAnimate) {
      setShouldAnimate(true);
    } else {
      startAnimation();
    }
  };

  // Intersection observer simulation for visibility detection
  useEffect(() => {
    if (triggerWhenVisible && !shouldAnimate) {
      // Simulate component becoming visible
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [triggerWhenVisible, shouldAnimate]);

  return (
    <Animated.View
      ref={animationRef}
      style={[animatedStyle, { flex: 1 }]}
      pointerEvents={hasAnimated.current ? 'auto' : 'box-none'}
    >
      {children}
    </Animated.View>
  );
}));

LazyAnimation.displayName = 'LazyAnimation';

// Higher-order component for easy wrapping
export const withLazyAnimation = <P extends object>(
  Component: React.ComponentType<P>,
  animationProps?: Partial<LazyAnimationProps>
) => {
  const WrappedComponent = memo((props: P) => (
    <LazyAnimation {...animationProps}>
      <Component {...props} />
    </LazyAnimation>
  ));

  WrappedComponent.displayName = `withLazyAnimation(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for programmatic animation control
export const useLazyAnimation = (props?: Partial<LazyAnimationProps>) => {
  const animationRef = useRef<LazyAnimationRef>(null);

  const start = () => animationRef.current?.start();
  const stop = () => animationRef.current?.stop();
  const reset = () => animationRef.current?.reset();

  const AnimationWrapper = ({ children }: { children: React.ReactNode }) => (
    <LazyAnimation ref={animationRef} {...props}>
      {children}
    </LazyAnimation>
  );

  return {
    AnimationWrapper,
    start,
    stop,
    reset,
  };
};

export default LazyAnimation;