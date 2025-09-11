# Interactive Prototype Specifications

## Overview
This document defines the interactive behaviors, micro-interactions, and prototype specifications for the Lunar sleep analysis app. These specifications guide the implementation of smooth, delightful user interactions using gluestack-ui components and React Native animations.

## Core Interaction Patterns

### 1. Sleep Score Interaction
```typescript
// Sleep score card with reveal animation
const SleepScoreInteraction = {
  onMount: {
    animation: 'slideInUp',
    duration: 600,
    delay: 200,
    easing: 'easeOutCubic'
  },
  
  scoreReveal: {
    // Animate score counting from 0 to actual value
    from: 0,
    to: currentScore,
    duration: 1500,
    easing: 'easeOutExpo'
  },
  
  onPress: {
    // Expand to detailed breakdown
    scale: 1.02,
    shadowRadius: 24,
    duration: 200,
    onComplete: () => navigateToDetails()
  },
  
  progressRing: {
    // Circular progress animation
    strokeDashoffset: {
      from: circumference,
      to: circumference - (score / 100) * circumference,
      duration: 2000,
      easing: 'easeOutCubic'
    }
  }
};
```

### 2. Sleep Stages Breakdown
```typescript
const SleepStagesInteraction = {
  stageProgress: {
    // Staggered progress bar animations
    delay: (index) => index * 150,
    width: {
      from: '0%',
      to: `${percentage}%`,
      duration: 800,
      easing: 'easeOutQuad'
    }
  },
  
  onStagePress: {
    // Highlight selected stage
    scale: 1.05,
    backgroundColor: highlightColor,
    duration: 200,
    onComplete: () => showStageDetails()
  },
  
  tooltip: {
    // Show detailed info on long press
    trigger: 'longPress',
    animation: 'fadeInScale',
    position: 'above',
    duration: 250
  }
};
```

### 3. Chart Interactions
```typescript
const ChartInteraction = {
  onLoad: {
    // Chart data points animate in sequence
    stagger: 100,
    animation: 'slideInUp',
    duration: 400
  },
  
  dataPoint: {
    onHover: {
      scale: 1.2,
      showTooltip: true,
      duration: 200
    },
    
    onPress: {
      // Drill down to specific day/time
      highlight: true,
      showDetails: true,
      hapticFeedback: 'light'
    }
  },
  
  periodChange: {
    // Smooth transition between time periods
    animation: 'slideOutLeft',
    newData: 'slideInRight',
    duration: 300,
    easing: 'easeInOutQuad'
  }
};
```

## Screen Transitions

### 1. Tab Navigation
```typescript
const TabTransitions = {
  dashboard: {
    entry: 'slideInUp',
    exit: 'slideOutDown',
    duration: 300
  },
  
  analytics: {
    entry: 'slideInRight',
    exit: 'slideOutLeft',
    duration: 300
  },
  
  chat: {
    entry: 'fadeIn',
    exit: 'fadeOut',
    duration: 250
  },
  
  settings: {
    entry: 'slideInLeft',
    exit: 'slideOutRight',
    duration: 300
  }
};
```

### 2. Modal Presentations
```typescript
const ModalBehaviors = {
  sleepDetails: {
    presentation: 'slideUp',
    backdrop: { opacity: 0.5, blur: true },
    dismissible: true,
    swipeGesture: 'down'
  },
  
  dateRangePicker: {
    presentation: 'fadeScale',
    anchor: 'center',
    dismissible: true
  },
  
  aiInsights: {
    presentation: 'slideRight',
    fullScreen: true,
    closeButton: true
  }
};
```

## Micro-Interactions

### 1. Button Interactions
```typescript
const ButtonMicroInteractions = {
  primary: {
    onPressIn: {
      scale: 0.96,
      duration: 100
    },
    onPressOut: {
      scale: 1,
      duration: 200,
      easing: 'easeOutBack'
    },
    ripple: {
      color: 'rgba(255,255,255,0.3)',
      duration: 400
    }
  },
  
  floating: {
    onMount: {
      scale: 0,
      animation: 'bounceIn',
      delay: 1000,
      duration: 500
    },
    onPress: {
      rotate: '360deg',
      scale: [0.9, 1.1, 1],
      duration: 400
    }
  }
};
```

### 2. Card Interactions
```typescript
const CardMicroInteractions = {
  onAppear: {
    translateY: 50,
    opacity: 0,
    animation: {
      translateY: 0,
      opacity: 1,
      duration: 400,
      stagger: 100
    }
  },
  
  onPress: {
    scale: 0.98,
    shadowRadius: 20,
    duration: 150,
    hapticFeedback: 'light'
  },
  
  onLongPress: {
    scale: 1.02,
    shadowRadius: 30,
    contextMenu: true,
    hapticFeedback: 'medium'
  }
};
```

### 3. Input Interactions
```typescript
const InputInteractions = {
  focus: {
    borderColor: '$lunar500',
    borderWidth: 2,
    scale: 1.02,
    duration: 200
  },
  
  typing: {
    // Live search/suggestions
    debounce: 300,
    showSuggestions: true,
    animation: 'slideInDown'
  },
  
  validation: {
    success: {
      borderColor: '$green500',
      shake: false,
      checkmark: true
    },
    error: {
      borderColor: '$red500',
      shake: true,
      duration: 300
    }
  }
};
```

## Gesture Interactions

### 1. Swipe Gestures
```typescript
const SwipeGestures = {
  cardActions: {
    leftSwipe: {
      threshold: 100,
      action: 'delete',
      visual: 'slideOutLeft',
      confirmRequired: true
    },
    rightSwipe: {
      threshold: 100,
      action: 'favorite',
      visual: 'heartAnimation'
    }
  },
  
  navigation: {
    edgeSwipe: {
      from: 'left',
      threshold: 50,
      action: 'goBack',
      visual: 'slideRight'
    }
  }
};
```

### 2. Pinch and Pan
```typescript
const TouchGestures = {
  chartZoom: {
    pinch: {
      minScale: 0.5,
      maxScale: 3,
      enablePan: true,
      boundaryBounce: true
    }
  },
  
  modalDrag: {
    panY: {
      threshold: 100,
      action: 'dismiss',
      resistance: true,
      snapPoints: [0, 0.5, 1]
    }
  }
};
```

## Loading States

### 1. Skeleton Animations
```typescript
const SkeletonAnimations = {
  shimmer: {
    // Shimmer effect for loading cards
    animation: 'wave',
    duration: 1500,
    repeat: 'infinite',
    colors: ['$moonstone200', '$moonstone100', '$moonstone200']
  },
  
  pulse: {
    // Pulsing for interactive elements
    scale: [1, 1.05, 1],
    duration: 1000,
    repeat: 'infinite',
    easing: 'easeInOutQuad'
  }
};
```

### 2. Progress Indicators
```typescript
const ProgressAnimations = {
  linear: {
    // Loading bar
    width: {
      from: '0%',
      to: '100%',
      duration: 'dynamic' // Based on actual progress
    }
  },
  
  circular: {
    // Spinning indicator
    rotate: '360deg',
    duration: 1000,
    repeat: 'infinite',
    easing: 'linear'
  },
  
  dots: {
    // Bouncing dots
    scale: [1, 1.5, 1],
    stagger: 200,
    repeat: 'infinite',
    duration: 600
  }
};
```

## Haptic Feedback

### 1. Interaction Feedback
```typescript
const HapticPatterns = {
  light: {
    // Gentle interactions (button press, toggle)
    intensity: 'light',
    duration: 50
  },
  
  medium: {
    // Important actions (save, delete)
    intensity: 'medium',
    duration: 100
  },
  
  heavy: {
    // Critical actions (errors, confirmations)
    intensity: 'heavy',
    duration: 150
  },
  
  success: {
    // Achievement unlocked, goal reached
    pattern: [100, 50, 100],
    intensity: 'medium'
  }
};
```

## Accessibility Animations

### 1. Reduced Motion Support
```typescript
const AccessibleAnimations = {
  respectsReducedMotion: true,
  
  alternatives: {
    slideIn: {
      default: { translateX: 100, duration: 300 },
      reduced: { opacity: [0, 1], duration: 150 }
    },
    
    bounce: {
      default: { scale: [0.8, 1.2, 1], duration: 500 },
      reduced: { opacity: [0, 1], duration: 200 }
    }
  }
};
```

### 2. Focus Indicators
```typescript
const FocusAnimations = {
  keyboard: {
    // Clear focus ring for keyboard navigation
    borderWidth: 2,
    borderColor: '$lunar500',
    borderRadius: '$md',
    animation: 'pulse',
    duration: 1000
  },
  
  screenReader: {
    // Announce important changes
    announcements: {
      scoreUpdate: 'Sleep score updated to {score}',
      dataLoaded: 'Sleep data for {period} loaded',
      error: 'Error: {message}'
    }
  }
};
```

## Performance Optimizations

### 1. Animation Performance
```typescript
const PerformanceSettings = {
  useNativeDriver: true, // Use native animations when possible
  removeClippedSubviews: true, // Optimize scroll performance
  
  throttling: {
    scroll: 16, // 60fps
    resize: 100, // Debounce resize events
    gesture: 8 // High frequency gestures
  },
  
  memoryManagement: {
    cleanupAnimations: true, // Remove completed animations
    poolObjects: true, // Reuse animation objects
    lazyClear: true // Clear off-screen animations
  }
};
```

### 2. Conditional Animations
```typescript
const ConditionalAnimations = {
  lowEndDevice: {
    // Simplified animations for lower-end devices
    reduceComplexity: true,
    disableBlurs: true,
    lowerFrameRate: 30
  },
  
  batteryOptimization: {
    // Reduce animations when battery is low
    threshold: 20, // Battery percentage
    reducedAnimations: true
  }
};
```

## Animation Timing

### 1. Duration Guidelines
```typescript
const TimingGuidelines = {
  micro: '100-200ms',    // Button presses, toggles
  quick: '200-300ms',    // Card interactions, transitions
  medium: '300-500ms',   // Page transitions, modals
  slow: '500-800ms',     // Complex animations, reveals
  extra: '800ms+',       // Celebration animations, onboarding
};
```

### 2. Easing Functions
```typescript
const EasingPresets = {
  // Material Design inspired
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  // iOS inspired
  easeInOut: 'cubic-bezier(0.42, 0.0, 0.58, 1.0)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.58, 1.0)',
  easeIn: 'cubic-bezier(0.42, 0.0, 1.0, 1.0)',
  
  // Custom sleep-themed
  sleepyBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  gentleWave: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
};
```

This interactive prototype specification ensures that the Lunar app provides smooth, delightful, and accessible user experiences while maintaining optimal performance across all devices.