/**
 * Animation Specifications for Lunar Sleep Analysis App
 * 
 * This file defines all animation configurations, timing functions,
 * and motion design patterns compatible with gluestack-ui and React Native.
 */

import { Easing } from 'react-native-reanimated';

// ===== ANIMATION PRESETS =====

export const animationPresets = {
  // Quick micro-interactions
  quick: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
  },
  
  // Standard UI transitions
  standard: {
    duration: 300,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  },
  
  // Smooth entrance animations
  entrance: {
    duration: 600,
    easing: Easing.out(Easing.back(1.1)),
  },
  
  // Gentle sleep-themed animations
  gentle: {
    duration: 800,
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  },
  
  // Bouncy success animations
  bounce: {
    duration: 500,
    easing: Easing.elastic(1.2),
  },
};

// ===== SLEEP SCORE ANIMATIONS =====

export const sleepScoreAnimations = {
  // Score counter animation
  scoreCount: {
    from: 0,
    duration: 2000,
    easing: Easing.out(Easing.expo),
    updateInterval: 16, // 60fps
  },
  
  // Circular progress animation
  progressRing: {
    strokeDasharray: 283, // 2 * π * 45 (radius)
    duration: 1800,
    easing: Easing.bezier(0.65, 0.05, 0.36, 1),
    delay: 300,
  },
  
  // Badge reveal animation
  badgeReveal: {
    scale: {
      from: 0,
      to: 1,
      duration: 400,
      easing: Easing.back(1.7),
      delay: 1200,
    },
    opacity: {
      from: 0,
      to: 1,
      duration: 200,
      delay: 1200,
    },
  },
  
  // Trend indicator animation
  trendArrow: {
    translateX: {
      from: -20,
      to: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      delay: 1500,
    },
    opacity: {
      from: 0,
      to: 1,
      duration: 200,
      delay: 1500,
    },
  },
};

// ===== SLEEP STAGES ANIMATIONS =====

export const sleepStageAnimations = {
  // Staggered progress bars
  progressBars: {
    width: {
      from: 0,
      duration: 800,
      easing: Easing.out(Easing.cubic),
    },
    stagger: 150, // Delay between each bar
  },
  
  // Stage breakdown reveal
  stageReveal: {
    translateY: {
      from: 30,
      to: 0,
      duration: 400,
      easing: Easing.out(Easing.cubic),
    },
    opacity: {
      from: 0,
      to: 1,
      duration: 300,
    },
    stagger: 100,
  },
  
  // Stacked progress animation
  stackedProgress: {
    width: {
      from: 0,
      duration: 1200,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    },
    delay: (index: number) => index * 50,
  },
  
  // Icon pulse animation
  iconPulse: {
    scale: {
      from: 1,
      to: 1.2,
      duration: 1000,
      repeat: -1, // Infinite
      reverse: true,
      easing: Easing.inOut(Easing.ease),
    },
  },
};

// ===== CHART ANIMATIONS =====

export const chartAnimations = {
  // Line chart drawing animation
  lineChart: {
    pathLength: {
      from: 0,
      to: 1,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
    },
    delay: 500,
  },
  
  // Bar chart growth animation
  barChart: {
    height: {
      from: 0,
      duration: 600,
      easing: Easing.out(Easing.back(1.1)),
    },
    stagger: 100,
  },
  
  // Data points entrance
  dataPoints: {
    scale: {
      from: 0,
      to: 1,
      duration: 300,
      easing: Easing.back(1.7),
    },
    opacity: {
      from: 0,
      to: 1,
      duration: 200,
    },
    stagger: 50,
    delay: 1000, // After line animation
  },
  
  // Heatmap cell animation
  heatmapCells: {
    opacity: {
      from: 0,
      to: 1,
      duration: 200,
    },
    scale: {
      from: 0.8,
      to: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
    },
    stagger: 10,
  },
  
  // Chart transition between periods
  periodTransition: {
    out: {
      translateX: -50,
      opacity: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
    },
    in: {
      translateX: {
        from: 50,
        to: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
      opacity: {
        from: 0,
        to: 1,
        duration: 200,
        delay: 100,
      },
    },
  },
};

// ===== SCREEN TRANSITION ANIMATIONS =====

export const screenTransitions = {
  // Dashboard entrance
  dashboard: {
    cards: {
      translateY: {
        from: 100,
        to: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
      },
      opacity: {
        from: 0,
        to: 1,
        duration: 400,
        delay: 200,
      },
      stagger: 150,
    },
    
    header: {
      translateY: {
        from: -50,
        to: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
      },
      opacity: {
        from: 0,
        to: 1,
        duration: 300,
      },
    },
  },
  
  // Analytics screen transitions
  analytics: {
    metrics: {
      scale: {
        from: 0.8,
        to: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.1)),
      },
      opacity: {
        from: 0,
        to: 1,
        duration: 300,
      },
      stagger: 100,
    },
    
    charts: {
      translateX: {
        from: 100,
        to: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
      },
      opacity: {
        from: 0,
        to: 1,
        duration: 300,
        delay: 100,
      },
      stagger: 200,
    },
  },
  
  // Chat interface animations
  chat: {
    messages: {
      translateY: {
        from: 50,
        to: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
      opacity: {
        from: 0,
        to: 1,
        duration: 200,
      },
      stagger: 100,
    },
    
    typing: {
      scale: {
        from: 1,
        to: 1.1,
        duration: 600,
        repeat: -1,
        reverse: true,
        easing: Easing.inOut(Easing.ease),
      },
    },
    
    newMessage: {
      translateX: {
        from: -100,
        to: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1.1)),
      },
      opacity: {
        from: 0,
        to: 1,
        duration: 200,
      },
    },
  },
};

// ===== INTERACTION ANIMATIONS =====

export const interactionAnimations = {
  // Button press animations
  buttonPress: {
    scale: {
      pressed: 0.96,
      duration: 100,
      easing: Easing.out(Easing.cubic),
    },
    release: {
      scale: 1,
      duration: 200,
      easing: Easing.out(Easing.back(1.1)),
    },
  },
  
  // Card interaction animations
  cardPress: {
    scale: {
      pressed: 0.98,
      duration: 150,
      easing: Easing.out(Easing.cubic),
    },
    shadowRadius: {
      pressed: 20,
      normal: 8,
      duration: 150,
    },
  },
  
  // Tab selection animations
  tabSelection: {
    scale: {
      active: 1.05,
      inactive: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
    },
    backgroundColor: {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    },
  },
  
  // Toggle switch animation
  toggle: {
    translateX: {
      on: 20, // Adjust based on switch width
      off: 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
    },
    backgroundColor: {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    },
  },
  
  // Modal presentation
  modal: {
    slideUp: {
      translateY: {
        from: '100%',
        to: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
      },
    },
    fade: {
      opacity: {
        from: 0,
        to: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
    },
    backdrop: {
      opacity: {
        from: 0,
        to: 0.5,
        duration: 300,
      },
    },
  },
};

// ===== LOADING ANIMATIONS =====

export const loadingAnimations = {
  // Skeleton shimmer effect
  shimmer: {
    translateX: {
      from: -100,
      to: 100,
      duration: 1500,
      repeat: -1,
      easing: Easing.linear,
    },
  },
  
  // Pulse loading animation
  pulse: {
    opacity: {
      from: 0.5,
      to: 1,
      duration: 1000,
      repeat: -1,
      reverse: true,
      easing: Easing.inOut(Easing.ease),
    },
  },
  
  // Spinning loader
  spin: {
    rotate: {
      from: '0deg',
      to: '360deg',
      duration: 1000,
      repeat: -1,
      easing: Easing.linear,
    },
  },
  
  // Bouncing dots
  bouncingDots: {
    translateY: {
      from: 0,
      to: -10,
      duration: 600,
      repeat: -1,
      reverse: true,
      easing: Easing.out(Easing.cubic),
    },
    stagger: 200,
  },
  
  // Progress bar fill
  progressFill: {
    width: {
      from: '0%',
      duration: 'dynamic', // Based on actual progress
      easing: Easing.out(Easing.cubic),
    },
  },
};

// ===== SUCCESS & ERROR ANIMATIONS =====

export const feedbackAnimations = {
  // Success animation
  success: {
    scale: {
      keyframes: [1, 1.2, 1],
      duration: 600,
      easing: Easing.out(Easing.back(1.7)),
    },
    checkmark: {
      pathLength: {
        from: 0,
        to: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        delay: 200,
      },
    },
  },
  
  // Error shake animation
  error: {
    translateX: {
      keyframes: [0, -10, 10, -10, 10, 0],
      duration: 500,
      easing: Easing.out(Easing.cubic),
    },
    borderColor: {
      from: 'transparent',
      to: '#ef4444',
      duration: 200,
    },
  },
  
  // Achievement celebration
  celebration: {
    confetti: {
      translateY: {
        from: -100,
        to: 100,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
      },
      rotate: {
        from: '0deg',
        to: '360deg',
        duration: 2000,
        easing: Easing.linear,
      },
    },
    badge: {
      scale: {
        keyframes: [0, 1.3, 1],
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
      },
    },
  },
};

// ===== GESTURE ANIMATIONS =====

export const gestureAnimations = {
  // Swipe to dismiss
  swipeDismiss: {
    translateX: {
      threshold: 100,
      velocity: 0.5,
      dismissDistance: 300,
      duration: 200,
      easing: Easing.out(Easing.cubic),
    },
    opacity: {
      from: 1,
      to: 0,
      duration: 200,
    },
  },
  
  // Pull to refresh
  pullRefresh: {
    translateY: {
      threshold: 60,
      resistance: 2.5,
      snapBack: {
        duration: 300,
        easing: Easing.out(Easing.back(1.1)),
      },
    },
    spinner: {
      rotate: {
        duration: 1000,
        repeat: -1,
        easing: Easing.linear,
      },
    },
  },
  
  // Pinch to zoom
  pinchZoom: {
    scale: {
      min: 0.5,
      max: 3,
      resistance: 0.8,
      snapBack: {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
    },
  },
};

// ===== ACCESSIBILITY ANIMATIONS =====

export const accessibilityAnimations = {
  // Reduced motion alternatives
  reducedMotion: {
    slideIn: {
      // Instead of sliding, use opacity
      opacity: {
        from: 0,
        to: 1,
        duration: 200,
      },
    },
    bounce: {
      // Instead of bouncing, use gentle scale
      scale: {
        from: 0.95,
        to: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
      },
    },
  },
  
  // Focus indicators
  focus: {
    borderWidth: {
      from: 0,
      to: 2,
      duration: 200,
      easing: Easing.out(Easing.cubic),
    },
    shadowRadius: {
      from: 0,
      to: 8,
      duration: 200,
    },
  },
  
  // Announcement animations
  announcement: {
    scale: {
      keyframes: [1, 1.05, 1],
      duration: 400,
      easing: Easing.out(Easing.cubic),
    },
  },
};

// ===== TIMING CONFIGURATIONS =====

export const timingConfig = {
  // Animation durations by category
  durations: {
    instant: 0,
    micro: 150,
    quick: 200,
    standard: 300,
    medium: 500,
    slow: 800,
    slower: 1200,
    slowest: 2000,
  },
  
  // Stagger delays
  stagger: {
    tight: 50,
    standard: 100,
    loose: 200,
    spacious: 300,
  },
  
  // Common delays
  delays: {
    none: 0,
    short: 100,
    medium: 300,
    long: 500,
    longer: 800,
  },
};

// ===== PERFORMANCE OPTIMIZATIONS =====

export const performanceConfig = {
  // Use native driver when possible
  useNativeDriver: true,
  
  // Frame rates for different animation types
  frameRates: {
    smooth: 60,
    standard: 30,
    minimal: 15,
  },
  
  // Memory management
  cleanup: {
    removeOnComplete: true,
    poolSize: 10,
    autoCleanup: true,
  },
  
  // Conditional rendering
  conditional: {
    lowEndDevice: {
      reduceComplexity: true,
      lowerFrameRate: true,
      disableBlurs: true,
    },
    lowBattery: {
      reduceAnimations: true,
      threshold: 20, // Battery percentage
    },
  },
};

export default {
  presets: animationPresets,
  sleepScore: sleepScoreAnimations,
  sleepStages: sleepStageAnimations,
  charts: chartAnimations,
  screens: screenTransitions,
  interactions: interactionAnimations,
  loading: loadingAnimations,
  feedback: feedbackAnimations,
  gestures: gestureAnimations,
  accessibility: accessibilityAnimations,
  timing: timingConfig,
  performance: performanceConfig,
};