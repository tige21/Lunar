import React, { 
  memo, 
  lazy, 
  Suspense, 
  useState, 
  useEffect, 
  useRef,
  ComponentType 
} from 'react';
import { 
  InteractionManager, 
  AppState, 
  AppStateStatus,
  View,
  StyleSheet 
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface LazyComponentProps {
  children?: React.ReactNode;
  fallback?: React.ComponentType | React.ReactNode;
  delay?: number;
  priority?: 'high' | 'normal' | 'low';
  whenVisible?: boolean;
  threshold?: number;
  loadOnInteraction?: boolean;
}

// Loading states for different priorities
const LoadingFallback = memo(({ priority = 'normal' }: { priority?: string }) => (
  <ThemedView style={styles.fallbackContainer}>
    <Animated.View entering={FadeIn.duration(200)}>
      <ThemedText style={styles.fallbackText}>
        {priority === 'high' ? 'Loading...' : ''}
      </ThemedText>
    </Animated.View>
  </ThemedView>
));

LoadingFallback.displayName = 'LoadingFallback';

// Component loading scheduler
class ComponentScheduler {
  private static instance: ComponentScheduler;
  private loadQueue: Array<{
    id: string;
    priority: 'high' | 'normal' | 'low';
    load: () => void;
  }> = [];
  private isProcessing = false;
  private loadedComponents = new Set<string>();

  static getInstance(): ComponentScheduler {
    if (!ComponentScheduler.instance) {
      ComponentScheduler.instance = new ComponentScheduler();
    }
    return ComponentScheduler.instance;
  }

  schedule(id: string, load: () => void, priority: 'high' | 'normal' | 'low' = 'normal') {
    if (this.loadedComponents.has(id)) {
      return;
    }

    // High priority components load immediately
    if (priority === 'high') {
      this.executeLoad(id, load);
      return;
    }

    // Add to queue for lower priority components
    this.loadQueue.push({ id, priority, load });
    this.loadQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    this.processQueue();
  }

  private executeLoad(id: string, load: () => void) {
    this.loadedComponents.add(id);
    
    InteractionManager.runAfterInteractions(() => {
      try {
        load();
      } catch (error) {
        console.warn('Component loading error:', error);
        this.loadedComponents.delete(id);
      }
    });
  }

  private processQueue() {
    if (this.isProcessing || this.loadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    // Process one component at a time to avoid blocking
    const next = this.loadQueue.shift();
    if (next) {
      this.executeLoad(next.id, next.load);
    }

    // Continue processing after a short delay
    setTimeout(() => {
      this.isProcessing = false;
      this.processQueue();
    }, 50);
  }

  clear() {
    this.loadQueue = [];
    this.loadedComponents.clear();
  }
}

const LazyComponent = memo(({
  children,
  fallback,
  delay = 0,
  priority = 'normal',
  whenVisible = false,
  threshold = 0.1,
  loadOnInteraction = false,
}: LazyComponentProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!whenVisible && !loadOnInteraction);
  const [isAppActive, setIsAppActive] = useState(true);
  const componentId = useRef(`lazy_${Date.now()}_${Math.random()}`).current;
  const hasScheduled = useRef(false);

  // App state monitoring
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setIsAppActive(nextAppState === 'active');
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Load component function
  const loadComponent = () => {
    if (hasScheduled.current || !isAppActive) return;
    
    hasScheduled.current = true;
    const scheduler = ComponentScheduler.getInstance();
    
    scheduler.schedule(componentId, () => {
      setTimeout(() => {
        setIsLoaded(true);
      }, delay);
    }, priority);
  };

  // Trigger loading based on conditions
  useEffect(() => {
    if (shouldLoad && !isLoaded) {
      loadComponent();
    }
  }, [shouldLoad, isLoaded]);

  // Handle visibility-based loading
  useEffect(() => {
    if (whenVisible && !shouldLoad) {
      // Simulate intersection observer
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [whenVisible, shouldLoad]);

  // Handle interaction-based loading
  const handleInteraction = () => {
    if (loadOnInteraction && !shouldLoad) {
      setShouldLoad(true);
    }
  };

  // Render fallback
  const renderFallback = () => {
    if (React.isValidElement(fallback)) {
      return fallback;
    }
    
    if (typeof fallback === 'function') {
      const FallbackComponent = fallback as ComponentType;
      return <FallbackComponent />;
    }
    
    return <LoadingFallback priority={priority} />;
  };

  // If loading on interaction, wrap in touchable
  if (loadOnInteraction && !isLoaded) {
    return (
      <Animated.View 
        entering={FadeIn.duration(200)}
        style={styles.interactionContainer}
        onTouchStart={handleInteraction}
      >
        {renderFallback()}
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {isLoaded ? children : renderFallback()}
    </Animated.View>
  );
});

LazyComponent.displayName = 'LazyComponent';

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  options?: Omit<LazyComponentProps, 'children'>
) => {
  const LazyWrapped = memo((props: P) => (
    <LazyComponent {...options}>
      <Component {...props} />
    </LazyComponent>
  ));

  LazyWrapped.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return LazyWrapped;
};

// Hook for lazy component management
export const useLazyComponent = (options?: Omit<LazyComponentProps, 'children'>) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const makeVisible = () => setIsVisible(true);
  const triggerInteraction = () => setHasInteracted(true);

  const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
    <LazyComponent 
      {...options}
      whenVisible={options?.whenVisible && isVisible}
      loadOnInteraction={options?.loadOnInteraction && hasInteracted}
    >
      {children}
    </LazyComponent>
  );

  return {
    LazyWrapper,
    makeVisible,
    triggerInteraction,
    isVisible,
    hasInteracted,
  };
};

// Prebuilt lazy components for common use cases
export const LazyOnboardingScreen = withLazyLoading(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  { priority: 'low', delay: 100, whenVisible: true }
);

export const LazyAnalyticsChart = withLazyLoading(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  { priority: 'normal', delay: 200, loadOnInteraction: true }
);

export const LazyChatComponent = withLazyLoading(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  { priority: 'high', delay: 0 }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  fallbackText: {
    fontSize: 14,
    opacity: 0.6,
  },
  interactionContainer: {
    flex: 1,
  },
});

export default LazyComponent;