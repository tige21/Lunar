# Lunar Sleep Analysis App - UI/UX Design Specifications with Gluestack-UI

## Document Information
- **Document Version**: 2.0
- **Created**: September 8, 2025
- **Last Updated**: September 8, 2025
- **Status**: Draft - Updated for Gluestack-UI v2
- **UI Framework**: Gluestack-UI v2 with NativeWind

## 1. Design Overview

### 1.1 Design Philosophy
Lunar embraces a minimalist, data-driven design philosophy built on gluestack-ui components that prioritizes clarity, accessibility, and user trust. The interface leverages gluestack-ui's copy-paste component architecture with Tailwind CSS styling, drawing inspiration from Apple's design principles while maintaining cross-platform consistency.

### 1.2 Design Principles
- **Component Consistency**: Built on gluestack-ui design system for unified experience
- **Clarity First**: Information hierarchy guides users naturally to key insights using Box, VStack, HStack layouts
- **Minimalist Beauty**: Clean interfaces with purposeful whitespace leveraging gluestack-ui spacing tokens
- **Data Storytelling**: Transform complex sleep data into compelling visual narratives using Card and Badge components
- **Accessible Design**: Inclusive design built on gluestack-ui accessibility foundations
- **Emotional Comfort**: Calming colors and smooth interactions using NativeWind styling
- **Trust Building**: Transparent design that reinforces privacy and data security

### 1.3 Target User Experience
- **Effortless Discovery**: Users understand their sleep quality within 3 seconds
- **Intuitive Navigation**: Zero learning curve for core functionality
- **Personalized Journey**: Interface adapts to user's sleep patterns and goals
- **Actionable Insights**: Every screen provides clear next steps for improvement

## 2. Gluestack-UI Design System Configuration

### 2.1 Gluestack-UI Theme Setup

#### 2.1.1 Theme Configuration
```typescript
// gluestack-ui.config.ts
import { config } from '@gluestack-ui/config';

export const customConfig = {
  ...config,
  tokens: {
    ...config.tokens,
    colors: {
      // Sleep-specific color tokens
      sleepPrimary: '#6366F1',
      sleepSecondary: '#8B5CF6', 
      sleepSuccess: '#34D399',
      sleepWarning: '#FBBF24',
      sleepError: '#F87171',
      
      // Sleep phase colors
      sleepRem: '#8B5CF6',
      sleepDeep: '#1D4ED8', 
      sleepCore: '#059669',
      sleepAwake: '#F59E0B',
      
      // Night theme
      nightPrimary: '#0B0D1A',
      nightSecondary: '#151829',
      nightSurface: '#1E2139',
      
      // Dawn theme  
      dawnPrimary: '#FAFAFA',
      dawnSecondary: '#F5F5F7',
      dawnSurface: '#FFFFFF',
    },
    space: {
      // Sleep app specific spacing
      cardPadding: 20,
      sectionPadding: 24,
      sleepScorePadding: 32,
    },
    radii: {
      sleepCard: 16,
      sleepScore: 100,
      sleepButton: 12,
    },
  },
  aliases: {
    // Sleep-specific component aliases
    SleepCard: {
      bg: '$dawnSurface',
      borderRadius: '$sleepCard',
      p: '$cardPadding',
      shadowColor: '$black',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    SleepButton: {
      borderRadius: '$sleepButton',
      px: 24,
      py: 12,
    },
  },
};
```

#### 2.1.2 Component Variants
```typescript
// Sleep-specific component variants
const componentVariants = {
  Button: {
    variants: {
      sleepPrimary: {
        bg: '$sleepPrimary',
        _text: { color: '$white' },
        _pressed: { bg: '$sleepPrimary', opacity: 0.9 },
      },
      sleepSecondary: {
        borderWidth: 1,
        borderColor: '$sleepPrimary',
        bg: 'transparent',
        _text: { color: '$sleepPrimary' },
        _pressed: { bg: '$sleepPrimary', opacity: 0.1 },
      },
    },
  },
  Card: {
    variants: {
      sleepMetric: {
        bg: '$dawnSurface',
        borderRadius: '$sleepCard',
        p: '$cardPadding',
        minHeight: 120,
      },
      sleepSummary: {
        bg: '$dawnSurface', 
        borderRadius: 20,
        p: 24,
      },
    },
  },
  Badge: {
    variants: {
      sleepPhase: {
        borderRadius: 20,
        px: 12,
        py: 6,
      },
    },
  },
};
```

## 3. Visual Design System

### 3.1 Color Palette with Gluestack-UI Tokens

#### Primary Colors
```css
/* Night Theme (Dark Mode) */
--primary-background: #0B0D1A      /* Deep space blue */
--secondary-background: #151829     /* Midnight blue */
--surface-background: #1E2139      /* Card/surface color */
--accent-primary: #6366F1          /* Indigo - primary actions */
--accent-secondary: #8B5CF6        /* Purple - secondary actions */

/* Dawn Theme (Light Mode) */
--primary-background: #FAFAFA      /* Soft white */
--secondary-background: #F5F5F7     /* Light gray */
--surface-background: #FFFFFF      /* Pure white cards */
--accent-primary: #5855D6          /* iOS system purple */
--accent-secondary: #007AFF        /* iOS system blue */

/* Semantic Colors */
--success-color: #34D399           /* Emerald green */
--warning-color: #FBBF24           /* Amber */
--error-color: #F87171             /* Red */
--sleep-rem: #8B5CF6               /* Purple for REM sleep */
--sleep-deep: #1D4ED8              /* Blue for deep sleep */
--sleep-core: #059669              /* Green for core sleep */
--sleep-awake: #F59E0B             /* Orange for awake periods */

/* Text Colors */
--text-primary: #FFFFFF / #1F2937
--text-secondary: #9CA3AF / #6B7280
--text-tertiary: #6B7280 / #9CA3AF
```

#### Color Usage Guidelines
- **Primary Background**: Main screen backgrounds
- **Surface Background**: Cards, modals, elevated content
- **Accent Primary**: CTAs, active states, progress indicators
- **Accent Secondary**: Secondary actions, highlights
- **Sleep Phase Colors**: Consistent across all sleep visualizations

### 2.2 Typography

#### Font System
```css
/* Primary Font: SF Pro (iOS) / Roboto (Android) */
--font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

/* Font Sizes */
--font-size-xs: 12px      /* Caption text */
--font-size-sm: 14px      /* Body small */
--font-size-base: 16px    /* Body text */
--font-size-lg: 18px      /* Subheadings */
--font-size-xl: 24px      /* Section headers */
--font-size-2xl: 32px     /* Page titles */
--font-size-3xl: 48px     /* Sleep score display */

/* Font Weights */
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700

/* Line Heights */
--line-height-tight: 1.2
--line-height-normal: 1.5
--line-height-relaxed: 1.75
```

#### Typography Hierarchy
1. **Display Text** (Sleep Score): 48px, Bold, Accent Color
2. **Page Titles**: 32px, Semibold, Primary Text
3. **Section Headers**: 24px, Semibold, Primary Text
4. **Subheadings**: 18px, Medium, Primary Text
5. **Body Text**: 16px, Regular, Primary Text
6. **Small Text**: 14px, Regular, Secondary Text
7. **Caption**: 12px, Regular, Tertiary Text

### 2.3 Spacing & Layout

#### Spacing System
```css
/* Base spacing unit: 4px */
--space-xs: 4px       /* 1 unit */
--space-sm: 8px       /* 2 units */
--space-md: 16px      /* 4 units */
--space-lg: 24px      /* 6 units */
--space-xl: 32px      /* 8 units */
--space-2xl: 48px     /* 12 units */
--space-3xl: 64px     /* 16 units */

/* Specific spacing */
--section-padding: 24px
--card-padding: 20px
--button-padding: 12px 24px
--input-padding: 16px
```

#### Layout Grid
- **Mobile**: 4-column grid with 16px gutters
- **Tablet**: 8-column grid with 20px gutters
- **Container Max Width**: 428px (iPhone 14 Pro Max)
- **Safe Area**: Respect iOS safe area insets
- **Bottom Tab Height**: 84px (including safe area)

### 2.4 Iconography

#### Icon System
- **Style**: SF Symbols (iOS) / Material Icons (Android)
- **Sizes**: 16px, 20px, 24px, 32px
- **Weight**: Regular (400) and Medium (500)
- **Colors**: Match text colors and semantic colors

#### Key Icons
```
Home: house.fill
Analytics: chart.line.uptrend.xyaxis
Chat: message.circle.fill
Improvement: target
Settings: gearshape.fill
Sleep: moon.zzz.fill
Heart Rate: heart.fill
Trends: chart.bar.fill
Goals: flag.fill
Export: square.and.arrow.up
```

## 4. Gluestack-UI Component Specifications

### 4.1 Layout Components with Gluestack-UI

#### 4.1.1 Main Layout Structure
```tsx
import { Box, VStack, HStack, ScrollView } from '@gluestack-ui/themed';

// Primary layout pattern for all screens
<Box flex={1} bg="$dawnPrimary">
  {/* Safe area wrapper */}
  <VStack flex={1} space="md">
    {/* Header section */}
    <Box px="$sectionPadding" pt="$4">
      <HStack justifyContent="space-between" alignItems="center">
        {/* Header content */}
      </HStack>
    </Box>
    
    {/* Main content */}
    <ScrollView flex={1} px="$sectionPadding">
      <VStack space="lg">
        {/* Screen content */}
      </VStack>
    </ScrollView>
  </VStack>
</Box>
```

#### 4.1.2 Card Layout Patterns
```tsx
import { Card } from '@gluestack-ui/themed';

// Sleep metric card layout
<Card variant="sleepMetric">
  <VStack space="sm">
    <HStack justifyContent="space-between" alignItems="center">
      <Text size="md" color="$textSecondary">Duration</Text>
      <Badge variant="sleepPhase" bg="$sleepSuccess">
        <Text size="xs" color="$white">Good</Text>
      </Badge>
    </HStack>
    <Text size="2xl" fontWeight="$bold" color="$textPrimary">
      7h 45m
    </Text>
    <Text size="sm" color="$sleepSuccess">
      +15min vs yesterday
    </Text>
  </VStack>
</Card>
```

### 4.2 Navigation Components with Gluestack-UI

#### 4.2.1 Bottom Tab Navigation
```tsx
import { Box, HStack, VStack, Text, Pressable } from '@gluestack-ui/themed';

<Box 
  position="absolute" 
  bottom={0} 
  left={0} 
  right={0}
  bg="$dawnSurface"
  borderTopWidth={1}
  borderColor="$borderLight200"
  pb="$safeAreaBottom"
>
  <HStack justifyContent="space-around" py="$3">
    {tabs.map((tab) => (
      <Pressable key={tab.name} flex={1} onPress={() => navigateToTab(tab.name)}>
        <VStack space="xs" alignItems="center">
          <Icon 
            name={tab.icon} 
            size={24}
            color={isActive ? '$sleepPrimary' : '$textTertiary'}
          />
          <Text 
            size="xs" 
            color={isActive ? '$sleepPrimary' : '$textTertiary'}
            fontWeight={isActive ? '$medium' : '$normal'}
          >
            {tab.label}
          </Text>
        </VStack>
      </Pressable>
    ))}
  </HStack>
</Box>
```

#### 4.2.2 Header Component
```tsx
import { Box, HStack, Text, Pressable } from '@gluestack-ui/themed';

<Box bg="$dawnPrimary" pt="$safeAreaTop">
  <HStack 
    justifyContent="space-between" 
    alignItems="center"
    px="$sectionPadding" 
    py="$4"
  >
    <VStack space="xs">
      <Text size="lg" fontWeight="$medium" color="$textPrimary">
        Good morning, Alex
      </Text>
      <Text size="sm" color="$textSecondary">
        Sunday, September 8
      </Text>
    </VStack>
    
    <Pressable onPress={() => navigation.navigate('Profile')}>
      <Box 
        width={32} 
        height={32} 
        borderRadius={16} 
        bg="$sleepPrimary"
        alignItems="center" 
        justifyContent="center"
      >
        <Text size="sm" color="$white" fontWeight="$bold">
          A
        </Text>
      </Box>
    </Pressable>
  </HStack>
</Box>
```

### 4.3 Dashboard Screen Components

#### 4.3.1 Sleep Score Circle Component
```tsx
import { Box, VStack, Text, Progress, Center } from '@gluestack-ui/themed';

const SleepScoreCircle = ({ score, quality, improvement }) => (
  <Center py="$sleepScorePadding">
    <Box position="relative" width={200} height={200}>
      {/* Background circle */}
      <Box 
        position="absolute"
        width={200}
        height={200}
        borderRadius="$sleepScore"
        borderWidth={12}
        borderColor="$borderLight200"
      />
      
      {/* Progress circle */}
      <Progress 
        value={score} 
        max={100}
        size="xl"
        width={200}
        height={200}
        borderRadius="$sleepScore"
      >
        <ProgressFilledTrack bg="$sleepPrimary" />
      </Progress>
      
      {/* Center content */}
      <Center position="absolute" width="100%" height="100%">
        <VStack space="xs" alignItems="center">
          <Text size="4xl" fontWeight="$bold" color="$textPrimary">
            {score}
          </Text>
          <Text size="sm" color="$textSecondary">
            Sleep Score
          </Text>
          <Text size="xs" color="$sleepSuccess">
            {improvement}
          </Text>
        </VStack>
      </Center>
    </Box>
    
    <VStack space="xs" alignItems="center" mt="$4">
      <Text size="md" fontWeight="$medium" color="$textPrimary">
        {quality}
      </Text>
      <Text size="xs" color="$textSecondary">
        11:30 PM - 7:15 AM
      </Text>
    </VStack>
  </Center>
);
```

#### 4.3.2 Quick Metrics Row
```tsx
import { HStack, VStack, Card, Text } from '@gluestack-ui/themed';

const QuickMetricsRow = ({ duration, efficiency, remSleep }) => (
  <HStack space="md" justifyContent="space-between">
    <Card flex={1} variant="sleepMetric">
      <VStack space="xs" alignItems="center">
        <Icon name="clock" size={20} color="$sleepPrimary" />
        <Text size="lg" fontWeight="$bold" color="$textPrimary">
          {duration}
        </Text>
        <Text size="xs" color="$textSecondary" textAlign="center">
          Total Sleep
        </Text>
      </VStack>
    </Card>
    
    <Card flex={1} variant="sleepMetric">
      <VStack space="xs" alignItems="center">
        <Icon name="target" size={20} color="$sleepSuccess" />
        <Text size="lg" fontWeight="$bold" color="$textPrimary">
          {efficiency}%
        </Text>
        <Text size="xs" color="$textSecondary" textAlign="center">
          Efficiency
        </Text>
      </VStack>
    </Card>
    
    <Card flex={1} variant="sleepMetric">
      <VStack space="xs" alignItems="center">
        <Icon name="brain" size={20} color="$sleepRem" />
        <Text size="lg" fontWeight="$bold" color="$textPrimary">
          {remSleep}
        </Text>
        <Text size="xs" color="$textSecondary" textAlign="center">
          REM Sleep
        </Text>
      </VStack>
    </Card>
  </HStack>
);
```

#### 4.3.3 Sleep Phases Chart Card
```tsx
import { Card, VStack, HStack, Box, Text, Badge } from '@gluestack-ui/themed';

const SleepPhasesCard = ({ phases }) => (
  <Card variant="sleepSummary">
    <VStack space="md">
      <HStack justifyContent="space-between" alignItems="center">
        <Text size="lg" fontWeight="$semibold" color="$textPrimary">
          Sleep Phases
        </Text>
        <Pressable onPress={() => navigation.navigate('Analytics')}>
          <Text size="sm" color="$sleepPrimary">
            View Details
          </Text>
        </Pressable>
      </HStack>
      
      {/* Phase visualization bar */}
      <Box height={60} borderRadius="$sleepCard" overflow="hidden">
        <HStack flex={1} height="100%">
          {phases.map((phase, index) => (
            <Box
              key={index}
              flex={phase.percentage}
              bg={phase.color}
              justifyContent="center"
              alignItems="center"
            >
              {phase.percentage > 15 && (
                <Text size="xs" color="$white" fontWeight="$medium">
                  {phase.label}
                </Text>
              )}
            </Box>
          ))}
        </HStack>
      </Box>
      
      {/* Phase legend */}
      <HStack space="sm" flexWrap="wrap" justifyContent="space-between">
        {phases.map((phase, index) => (
          <HStack key={index} space="xs" alignItems="center">
            <Box 
              width={12} 
              height={12} 
              borderRadius={6} 
              bg={phase.color} 
            />
            <VStack space="0">
              <Text size="xs" color="$textSecondary">
                {phase.label}
              </Text>
              <Text size="xs" fontWeight="$medium" color="$textPrimary">
                {phase.duration}
              </Text>
            </VStack>
          </HStack>
        ))}
      </HStack>
    </VStack>
  </Card>
);
```

### 4.4 AI Chat Interface Components

#### 4.4.1 Chat Message Components
```tsx
import { Box, VStack, HStack, Text, Input, Button } from '@gluestack-ui/themed';

const ChatMessage = ({ message, isUser, timestamp }) => (
  <HStack 
    space="md" 
    justifyContent={isUser ? 'flex-end' : 'flex-start'}
    mb="$4"
  >
    {!isUser && (
      <Box 
        width={32} 
        height={32} 
        borderRadius={16} 
        bg="$sleepPrimary"
        alignItems="center" 
        justifyContent="center"
      >
        <Icon name="sparkles" size={16} color="$white" />
      </Box>
    )}
    
    <Box 
      maxWidth="85%" 
      bg={isUser ? '$sleepPrimary' : '$dawnSecondary'}
      borderRadius={20}
      p="$4"
    >
      <Text 
        size="md" 
        color={isUser ? '$white' : '$textPrimary'}
        lineHeight="$md"
      >
        {message}
      </Text>
      
      <Text 
        size="xs" 
        color={isUser ? '$white' : '$textTertiary'}
        opacity={0.7}
        mt="$2"
      >
        {timestamp}
      </Text>
    </Box>
  </HStack>
);

const ChatInput = ({ onSend, value, onChange }) => (
  <Box bg="$dawnSurface" p="$4" borderTopWidth={1} borderColor="$borderLight200">
    <HStack space="md" alignItems="flex-end">
      <Input 
        flex={1}
        placeholder="Ask about your sleep..."
        value={value}
        onChangeText={onChange}
        multiline
        maxHeight={120}
        bg="$dawnSecondary"
        borderWidth={0}
        borderRadius="$sleepButton"
      />
      
      <Button 
        variant="sleepPrimary"
        size="md"
        borderRadius="$sleepScore"
        onPress={onSend}
        disabled={!value.trim()}
      >
        <Icon name="send" size={18} color="$white" />
      </Button>
    </HStack>
  </Box>
);
```

### 4.5 Settings Screen Components

#### 4.5.1 Settings Row Component
```tsx
import { Pressable, HStack, VStack, Text, Switch } from '@gluestack-ui/themed';

const SettingsRow = ({ 
  icon, 
  title, 
  subtitle, 
  type = 'navigation',
  value,
  onPress,
  onToggle 
}) => (
  <Pressable onPress={onPress}>
    <HStack 
      justifyContent="space-between" 
      alignItems="center"
      py="$4" 
      px="$sectionPadding"
      minHeight={56}
      bg="$dawnSurface"
      borderBottomWidth={1}
      borderColor="$borderLight100"
    >
      <HStack space="md" alignItems="center" flex={1}>
        <Icon 
          name={icon} 
          size={20} 
          color="$sleepPrimary" 
        />
        
        <VStack space="xs" flex={1}>
          <Text size="md" fontWeight="$medium" color="$textPrimary">
            {title}
          </Text>
          {subtitle && (
            <Text size="sm" color="$textSecondary">
              {subtitle}
            </Text>
          )}
        </VStack>
      </HStack>
      
      {type === 'toggle' && (
        <Switch 
          value={value}
          onValueChange={onToggle}
          trackColor={{ true: '$sleepPrimary', false: '$borderLight300' }}
        />
      )}
      
      {type === 'navigation' && (
        <Icon name="chevron-right" size={16} color="$textTertiary" />
      )}
      
      {type === 'value' && (
        <Text size="sm" color="$textSecondary">
          {value}
        </Text>
      )}
    </HStack>
  </Pressable>
);
```
- Icon size: 24px
- Label: 12px, medium weight
- Haptic feedback on tap
- Smooth transition animations (200ms)

Layout:
[Dashboard] [Analytics] [AI Chat] [Improvement] [Settings]
```

#### 3.1.2 Navigation Header
```
Specifications:
- Height: 44px + safe area top
- Background: Primary background
- Title: 18px, semibold, centered
- Back button: 20px icon, left aligned
- Action buttons: 20px icons, right aligned
- Shadow: Subtle drop shadow when scrolled
```

### 3.2 Data Visualization Components

#### 3.2.1 Sleep Score Circle
```jsx
// Design specifications for sleep score visualization
<SleepScoreCircle>
  Diameter: 200px
  Stroke width: 12px
  Background circle: Tertiary text color (20% opacity)
  Progress circle: Gradient from accent primary to accent secondary
  Center content:
    - Score: 72pt, bold, primary text
    - Label: "Sleep Score", 14pt, secondary text
    - Subtitle: Quality indicator, 12pt, tertiary text
  Animation: Smooth progress animation on load (1000ms)
</SleepScoreCircle>
```

#### 3.2.2 Sleep Phase Chart
```jsx
// Horizontal bar chart for sleep phases
<SleepPhaseChart>
  Height: 60px
  Corner radius: 8px
  Phases:
    - REM: Purple (#8B5CF6)
    - Deep: Blue (#1D4ED8)
    - Core: Green (#059669)
    - Awake: Orange (#F59E0B)
  Transitions: Smooth gradients between phases
  Time labels: Above and below chart
  Interactive: Tap to show phase details
</SleepPhaseChart>
```

#### 3.2.3 Trend Line Chart
```jsx
<TrendChart>
  Height: 200px
  Background: Surface background
  Grid lines: Tertiary text color (10% opacity)
  Line: 2px stroke, accent primary color
  Fill: Gradient from line color to transparent
  Data points: 4px circles on line
  Labels: 12px, secondary text
  Responsive: Adapt to different time ranges
</TrendChart>
```

### 3.3 Card Components

#### 3.3.1 Metric Card
```jsx
<MetricCard>
  Dimensions: Full width × 120px
  Background: Surface background
  Corner radius: 16px
  Padding: 20px
  Shadow: Subtle elevation
  
  Content Layout:
    - Icon: 24px, accent color, top-left
    - Title: 16px, medium, primary text
    - Value: 32px, bold, primary text
    - Subtitle: 14px, regular, secondary text
    - Change indicator: 12px, success/error color
</MetricCard>
```

#### 3.3.2 Summary Card
```jsx
<SummaryCard>
  Dimensions: Full width × variable height
  Background: Surface background
  Corner radius: 20px
  Padding: 24px
  
  Header:
    - Title: 20px, semibold
    - Subtitle: 14px, secondary text
    - Action button: Optional
  
  Content: Flexible layout for various content types
  
  States:
    - Default: Normal appearance
    - Loading: Skeleton animation
    - Error: Error state with retry option
</SummaryCard>
```

### 3.4 Interactive Components

#### 3.4.1 Primary Button
```jsx
<PrimaryButton>
  Height: 48px
  Corner radius: 12px
  Background: Accent primary color
  Text: 16px, semibold, white
  Padding: 12px 24px
  
  States:
    - Default: Full opacity
    - Pressed: 90% opacity + scale(0.98)
    - Disabled: 40% opacity
    - Loading: Spinner animation
  
  Haptic: Light impact on press
</PrimaryButton>
```

#### 3.4.2 Secondary Button
```jsx
<SecondaryButton>
  Height: 48px
  Corner radius: 12px
  Background: Transparent
  Border: 1px solid accent primary
  Text: 16px, semibold, accent primary
  
  States:
    - Default: Border visible
    - Pressed: Background fill 10% opacity
    - Disabled: 40% opacity all elements
</SecondaryButton>
```

#### 3.4.3 Input Field
```jsx
<InputField>
  Height: 48px
  Corner radius: 12px
  Background: Secondary background
  Border: 1px solid transparent
  Padding: 16px
  Text: 16px, regular, primary text
  Placeholder: 16px, regular, tertiary text
  
  States:
    - Default: Subtle background
    - Focused: Accent primary border
    - Error: Error color border + helper text
    - Disabled: Reduced opacity
</InputField>
```

### 3.5 Feedback Components

#### 3.5.1 Toast Notifications
```jsx
<Toast>
  Position: Top of screen, below safe area
  Width: Screen width - 32px margin
  Height: 56px minimum
  Background: Surface background
  Corner radius: 16px
  Shadow: Prominent elevation
  
  Content:
    - Icon: 20px, semantic color
    - Message: 16px, regular, primary text
    - Action: Optional button
  
  Animation:
    - Enter: Slide down + fade in (300ms)
    - Exit: Slide up + fade out (200ms)
    - Auto-dismiss: 4 seconds
</Toast>
```

#### 3.5.2 Loading States
```jsx
<LoadingSkeleton>
  Background: Secondary background
  Shimmer: Animated gradient overlay
  Corner radius: Match target component
  
  Variations:
    - Text lines: Various widths
    - Circular: For avatars/scores
    - Rectangular: For cards/images
    
  Animation: Subtle shimmer effect (1500ms loop)
</LoadingSkeleton>
```

## 4. Screen Design Specifications

### 4.1 Onboarding Screens

#### 4.1.1 Welcome Screen
```
Layout:
- Hero illustration: Sleep-themed graphic (240px height)
- App logo: Centered, 60px height
- Title: "Welcome to Lunar" (32px, bold)
- Subtitle: Value proposition (16px, regular)
- Primary CTA: "Get Started" (full width)
- Skip option: "Continue without tutorial" (14px, link style)

Visual Elements:
- Background: Gradient from primary to secondary
- Illustration: Custom sleep-themed artwork
- Animation: Subtle float animation on illustration
```

#### 4.1.2 Permissions Screen
```
Layout:
- Header: "Connect with Apple Health"
- Icon: Large Health app icon (80px)
- Benefits list: 3 key benefits with icons
- Privacy note: Data remains on device
- Primary CTA: "Connect Apple Health"
- Secondary CTA: "Set Up Later"

Interaction:
- Tap primary button → iOS Health permission dialog
- Success → Animate checkmark and proceed
- Denied → Show fallback options
```

#### 4.1.3 Goals Setup Screen
```
Layout:
- Header: "Set Your Sleep Goals"
- Sleep duration picker: Wheel picker (7-10 hours)
- Bedtime picker: Time wheel
- Wake time picker: Time wheel
- Sleep quality goal: Slider (Good/Great/Excellent)
- Primary CTA: "Complete Setup"

Validation:
- Minimum 6 hours sleep duration
- Logical bedtime/wake time relationship
- Visual feedback for valid selections
```

### 4.2 Main Dashboard

#### 4.2.1 Dashboard Layout
```
Screen Structure:
┌─────────────────────────┐
│      Header             │ (Safe area + 60px)
├─────────────────────────┤
│   Sleep Score Circle    │ (240px height)
├─────────────────────────┤
│   Quick Metrics Row     │ (120px height)
├─────────────────────────┤
│   Last Night Summary    │ (Variable height)
├─────────────────────────┤
│   Recent Trends         │ (200px height)
├─────────────────────────┤
│   AI Insights Card      │ (Variable height)
├─────────────────────────┤
│   Quick Actions         │ (80px height)
└─────────────────────────┘
│   Bottom Tab Bar        │ (84px + safe area)
└─────────────────────────┘
```

#### 4.2.2 Header Component
```jsx
<DashboardHeader>
  Left side:
    - Greeting: "Good morning, [Name]" (18px, medium)
    - Date: Current date (14px, secondary)
  
  Right side:
    - Profile avatar: 32px circle
    - Notification badge: If unread notifications
  
  Background: Transparent
  Padding: 16px horizontal, 12px vertical
</DashboardHeader>
```

#### 4.2.3 Sleep Score Section
```jsx
<SleepScoreSection>
  Center alignment
  Sleep score circle: 200px diameter
  Score: 0-100 scale
  Animation: Progress animation on screen load
  
  Below circle:
    - Quality rating: "Good Sleep" (16px, medium)
    - Improvement note: "+5 vs yesterday" (14px, success color)
    - Time range: "11:30 PM - 7:15 AM" (12px, tertiary)
</SleepScoreSection>
```

#### 4.2.4 Quick Metrics Row
```jsx
<QuickMetricsRow>
  3-column layout with equal spacing
  
  Column 1 - Duration:
    - Icon: Clock
    - Value: "7h 45m"
    - Label: "Total Sleep"
  
  Column 2 - Efficiency:
    - Icon: Target
    - Value: "92%"
    - Label: "Efficiency"
  
  Column 3 - REM:
    - Icon: Brain
    - Value: "1h 30m"
    - Label: "REM Sleep"
</QuickMetricsRow>
```

### 4.3 Analytics Screen

#### 4.3.1 Analytics Layout
```
Screen Structure:
┌─────────────────────────┐
│   Header with filters   │ (Safe area + 60px)
├─────────────────────────┤
│   Time period selector  │ (48px height)
├─────────────────────────┤
│   Primary chart         │ (280px height)
├─────────────────────────┤
│   Metrics comparison    │ (140px height)
├─────────────────────────┤
│   Sleep phases detail   │ (200px height)
├─────────────────────────┤
│   Insights summary      │ (Variable height)
└─────────────────────────┘
```

#### 4.3.2 Time Period Selector
```jsx
<TimePeriodSelector>
  Horizontal scrolling chips
  Options: ["7 days", "30 days", "3 months", "1 year"]
  Selected state: Accent background, white text
  Unselected: Secondary background, primary text
  Animation: Smooth selection indicator
</TimePeriodSelector>
```

#### 4.3.3 Primary Chart
```jsx
<PrimaryChart>
  Type: Line chart with area fill
  Data: Sleep score over time
  Y-axis: 0-100 scale
  X-axis: Date range
  Gridlines: Subtle horizontal lines
  Interaction: Tap data points for details
  Empty state: Placeholder with illustration
</PrimaryChart>
```

### 4.4 AI Chat Screen

#### 4.4.1 Chat Interface
```jsx
<ChatInterface>
  Header:
    - Title: "Sleep Assistant"
    - Subtitle: "Ask about your sleep patterns"
  
  Message List:
    - User messages: Right-aligned, accent color background
    - AI messages: Left-aligned, surface background
    - Typing indicator: Animated dots
    - Timestamp: 12px, tertiary color
  
  Input Area:
    - Text input: Expandable height
    - Send button: Icon only when text present
    - Suggestion chips: Quick questions
</ChatInterface>
```

#### 4.4.2 Message Components
```jsx
<UserMessage>
  Background: Accent primary color
  Text color: White
  Corner radius: 20px (speech bubble style)
  Max width: 70% of screen
  Padding: 12px 16px
</UserMessage>

<AIMessage>
  Background: Surface color
  Text color: Primary text
  Corner radius: 20px
  Max width: 85% of screen
  Padding: 16px
  
  Optional elements:
    - Quick action buttons
    - Data visualizations
    - External links
</AIMessage>
```

### 4.5 Settings Screen

#### 4.5.1 Settings Layout
```jsx
<SettingsLayout>
  Sections:
    1. Profile
       - Name and avatar
       - Sleep goals
    
    2. Notifications
       - Reminder settings
       - Achievement alerts
    
    3. Data & Privacy
       - Export data
       - Delete data
       - Privacy policy
    
    4. App Settings
       - Language
       - Theme preference
       - Units (12/24 hour)
    
    5. Support
       - Help center
       - Contact support
       - Rate app
</SettingsLayout>
```

#### 4.5.2 Settings Row Component
```jsx
<SettingsRow>
  Height: 56px
  Padding: 16px horizontal
  
  Left side:
    - Icon: 20px, accent color
    - Title: 16px, medium weight
    - Subtitle: 14px, secondary color (optional)
  
  Right side:
    - Value/toggle: Based on setting type
    - Chevron: Navigation indicator
  
  States:
    - Default: Transparent background
    - Pressed: Secondary background
    - Disabled: Reduced opacity
</SettingsRow>
```

## 5. Interaction Design

### 5.1 Animation Specifications

#### 5.1.1 Screen Transitions
```css
/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateX(100%);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateX(-50%);
  transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

#### 5.1.2 Loading Animations
```css
/* Sleep score progress animation */
@keyframes scoreProgress {
  from {
    stroke-dasharray: 0 628;
  }
  to {
    stroke-dasharray: var(--score-progress) 628;
  }
}

.sleep-score-circle {
  animation: scoreProgress 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Shimmer loading effect */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.loading-shimmer::before {
  animation: shimmer 1500ms linear infinite;
}
```

#### 5.1.3 Micro-interactions
```css
/* Button press feedback */
.button-press {
  transform: scale(0.98);
  opacity: 0.9;
  transition: all 100ms ease-out;
}

/* Card hover/press effect */
.card-interactive:active {
  transform: scale(0.995);
  transition: transform 100ms ease-out;
}

/* Tab switch animation */
.tab-indicator {
  transition: transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### 5.2 Gesture Interactions

#### 5.2.1 Chart Interactions
- **Pan**: Horizontal scrolling for time-series data
- **Pinch**: Zoom in/out on detailed time periods
- **Tap**: Show data point details in tooltip
- **Long Press**: Access additional options menu

#### 5.2.2 Card Interactions
- **Tap**: Navigate to detail screen or expand inline
- **Swipe Left**: Access quick actions (share, export)
- **Pull Down**: Refresh data (on applicable screens)
- **Long Press**: Show context menu

#### 5.2.3 List Interactions
- **Swipe**: Delete or archive items
- **Pull to Refresh**: Update data from HealthKit
- **Infinite Scroll**: Load older data progressively

### 5.3 Haptic Feedback

#### 5.3.1 Feedback Types
```typescript
// Haptic feedback specification
enum HapticType {
  Light = 'light',        // Successful actions, selections
  Medium = 'medium',      // Warning states, toggles
  Heavy = 'heavy',        // Errors, important actions
  Success = 'success',    // Goal completion, achievements
  Warning = 'warning',    // Validation issues
  Error = 'error',        // Failed actions
}

// Usage examples
onButtonPress: HapticType.Light
onToggleSwitch: HapticType.Medium
onDeleteAction: HapticType.Heavy
onGoalAchieved: HapticType.Success
onInputError: HapticType.Error
```

## 6. Accessibility Specifications

### 6.1 Accessibility Requirements

#### 6.1.1 Visual Accessibility
- **Color Contrast**: WCAG 2.1 AA compliance (4.5:1 minimum)
- **Text Size**: Support iOS Dynamic Type up to AX5 size
- **Color Independence**: Information conveyed beyond color alone
- **Focus Indicators**: Clear visual focus for keyboard navigation

#### 6.1.2 Motor Accessibility
- **Touch Targets**: Minimum 44px × 44px tap areas
- **Gesture Alternatives**: Button alternatives for all gesture actions
- **Timeout Extensions**: Extended interaction times for complex actions
- **Voice Control**: Support for iOS Voice Control commands

#### 6.1.3 Cognitive Accessibility
- **Clear Labels**: Descriptive button and input labels
- **Consistent Navigation**: Predictable interface patterns
- **Error Prevention**: Validation and confirmation dialogs
- **Help Content**: Contextual help and tooltips

### 6.2 VoiceOver Implementation

#### 6.2.1 Screen Reader Labels
```typescript
// Accessibility labels for key components
const a11yLabels = {
  sleepScore: (score: number) => `Sleep score: ${score} out of 100`,
  sleepDuration: (hours: number, minutes: number) => `Total sleep time: ${hours} hours and ${minutes} minutes`,
  sleepPhase: (phase: string, duration: string) => `${phase} sleep phase: ${duration}`,
  chartDataPoint: (date: string, value: number) => `${date}: sleep score ${value}`,
  navigationTab: (tabName: string, isSelected: boolean) => `${tabName} tab${isSelected ? ', selected' : ''}`,
};

// Usage in components
<TouchableOpacity
  accessible={true}
  accessibilityLabel={a11yLabels.sleepScore(sleepScore)}
  accessibilityRole="button"
  accessibilityHint="Double tap to view detailed sleep analysis"
>
  <SleepScoreCircle score={sleepScore} />
</TouchableOpacity>
```

#### 6.2.2 Navigation Announcements
```typescript
// Screen change announcements
const announceScreenChange = (screenName: string) => {
  AccessibilityInfo.announceForAccessibility(`${screenName} screen`);
};

// Dynamic content updates
const announceDynamicUpdate = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};
```

## 7. Responsive Design

### 7.1 Device Support

#### 7.1.1 iPhone Sizes
```css
/* iPhone SE (375px width) */
@media (max-width: 375px) {
  .sleep-score-circle {
    diameter: 160px;
  }
  .metric-cards {
    grid-template-columns: 1fr;
  }
}

/* iPhone Standard (390-428px width) */
@media (min-width: 376px) and (max-width: 428px) {
  .sleep-score-circle {
    diameter: 200px;
  }
  .metric-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* iPhone Plus/Pro Max (428px+ width) */
@media (min-width: 429px) {
  .container {
    max-width: 428px;
    margin: 0 auto;
  }
}
```

#### 7.1.2 iPad Adaptation
```css
/* iPad Portrait (768px+ width) */
@media (min-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .sleep-score-circle {
    diameter: 240px;
  }
  
  .chart-container {
    height: 320px;
  }
}

/* iPad Landscape (1024px+ width) */
@media (min-width: 1024px) and (orientation: landscape) {
  .dashboard-layout {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .sidebar-navigation {
    display: block;
    width: 280px;
  }
  
  .main-content {
    margin-left: 280px;
  }
}
```

### 7.2 Dynamic Type Support

#### 7.2.1 Scalable Typography
```typescript
// Dynamic type implementation
const useScaledFont = (baseSize: number) => {
  const [scaledSize, setScaledSize] = useState(baseSize);
  
  useEffect(() => {
    const updateSize = async () => {
      const contentSizeCategory = await AccessibilityInfo.getContentSizeCategory();
      const scaleFactor = getScaleFactor(contentSizeCategory);
      setScaledSize(Math.round(baseSize * scaleFactor));
    };
    
    updateSize();
    
    const listener = AccessibilityInfo.addEventListener(
      'change',
      updateSize
    );
    
    return () => listener?.remove();
  }, [baseSize]);
  
  return scaledSize;
};

// Scale factors for different accessibility sizes
const getScaleFactor = (category: string): number => {
  const scaleFactors = {
    'XS': 0.8,
    'S': 0.9,
    'M': 1.0,   // Default
    'L': 1.1,
    'XL': 1.2,
    'XXL': 1.3,
    'XXXL': 1.4,
    'AX1': 1.6,
    'AX2': 1.8,
    'AX3': 2.0,
    'AX4': 2.4,
    'AX5': 2.8,
  };
  
  return scaleFactors[category] || 1.0;
};
```

## 8. Dark Mode Implementation

### 8.1 Theme System
```typescript
// Theme configuration
export const themes = {
  light: {
    colors: {
      primary: '#FAFAFA',
      secondary: '#F5F5F7',
      surface: '#FFFFFF',
      accent: '#5855D6',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
      },
    },
    shadows: {
      card: '0 2px 12px rgba(0, 0, 0, 0.08)',
      modal: '0 8px 32px rgba(0, 0, 0, 0.12)',
    },
  },
  dark: {
    colors: {
      primary: '#0B0D1A',
      secondary: '#151829',
      surface: '#1E2139',
      accent: '#6366F1',
      text: {
        primary: '#FFFFFF',
        secondary: '#9CA3AF',
        tertiary: '#6B7280',
      },
    },
    shadows: {
      card: '0 2px 12px rgba(0, 0, 0, 0.3)',
      modal: '0 8px 32px rgba(0, 0, 0, 0.4)',
    },
  },
};

// Theme context
const ThemeContext = createContext(themes.light);

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  const [colorScheme] = useColorScheme();
  
  return colorScheme === 'dark' ? themes.dark : themes.light;
};
```

### 8.2 Component Theme Implementation
```tsx
// Themed component example
const ThemedCard: React.FC<CardProps> = ({ children, style, ...props }) => {
  const theme = useTheme();
  
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.shadows.card,
          borderRadius: 16,
          padding: 20,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// Usage
<ThemedCard>
  <ThemedText style={{ color: theme.colors.text.primary }}>
    Sleep Score: 85
  </ThemedText>
</ThemedCard>
```

## 9. Localization Design

### 9.1 Text Expansion Planning

#### 9.1.1 Language Expansion Factors
```typescript
// Expected text expansion for different languages
const textExpansionFactors = {
  en: 1.0,    // English (base)
  es: 1.25,   // Spanish
  fr: 1.3,    // French
  de: 1.35,   // German
  it: 1.2,    // Italian
  pt: 1.25,   // Portuguese
  nl: 1.4,    // Dutch
};

// Layout adjustments for text expansion
const getLayoutPadding = (language: string, basePadding: number) => {
  const factor = textExpansionFactors[language] || 1.0;
  return Math.max(basePadding, basePadding * factor);
};
```

#### 9.1.2 RTL Language Support
```css
/* RTL layout adjustments */
.rtl-container {
  direction: rtl;
  text-align: right;
}

.rtl-icon-leading {
  margin-left: 8px;
  margin-right: 0;
}

.rtl-navigation-back {
  transform: scaleX(-1);
}
```

### 9.2 Cultural Adaptations

#### 9.2.1 Time Format Preferences
- **12-hour format**: US, Canada, UK
- **24-hour format**: Most European countries
- **Automatic detection**: Based on device locale settings

#### 9.2.2 Cultural Sleep Norms
- **Siesta cultures**: Afternoon nap tracking for Spanish users
- **Late dining**: Adjust bedtime recommendations for Mediterranean cultures
- **Work schedules**: Consider local work hour norms for sleep goals

## 10. Design Validation

### 10.1 Usability Testing Plan

#### 10.1.1 Testing Scenarios
1. **First-time user onboarding**: Complete setup flow
2. **Daily check routine**: View sleep score and metrics
3. **Trend analysis**: Explore weekly/monthly patterns
4. **AI interaction**: Ask questions about sleep
5. **Goal adjustment**: Modify sleep targets
6. **Data export**: Extract personal sleep data

#### 10.1.2 Success Metrics
- **Task completion rate**: >90% for core tasks
- **Time to insight**: <30 seconds to understand sleep quality
- **Error recovery**: <2 taps to recover from errors
- **Satisfaction score**: >4.5/5 in post-test survey

### 10.2 A/B Testing Framework

#### 10.2.1 Testable Elements
```typescript
// A/B test configurations
const abTests = {
  sleepScoreDisplay: {
    variants: ['circular', 'linear', 'numerical'],
    metric: 'engagement_rate',
  },
  onboardingFlow: {
    variants: ['3_steps', '4_steps', 'progressive'],
    metric: 'completion_rate',
  },
  colorScheme: {
    variants: ['blue_purple', 'green_blue', 'purple_pink'],
    metric: 'user_retention',
  },
};

// Implementation
const getVariant = (testName: string): string => {
  return ExperimentService.getVariant(testName, userId);
};
```

## 11. Implementation Guidelines

### 11.1 Development Handoff

#### 11.1.1 Asset Delivery
```
Design Assets Package:
├── icons/
│   ├── @1x/ (24px)
│   ├── @2x/ (48px)
│   └── @3x/ (72px)
├── illustrations/
│   ├── onboarding/
│   ├── empty_states/
│   └── error_states/
├── app_icons/
│   ├── ios/
│   └── android/
└── design_tokens/
    ├── colors.json
    ├── typography.json
    └── spacing.json
```

#### 11.1.2 Design System Documentation
- Component specifications with code examples
- Interaction behavior definitions
- Animation timing and easing functions
- Accessibility implementation notes
- Responsive breakpoint guidelines

### 11.2 Quality Assurance

#### 11.2.1 Design Review Checklist
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Touch targets meet minimum 44px requirement
- [ ] Text scales properly with Dynamic Type
- [ ] Dark mode implementation is complete
- [ ] Animations perform at 60fps
- [ ] Loading states are implemented
- [ ] Error states provide clear guidance
- [ ] Empty states encourage user action

#### 11.2.2 Cross-Platform Consistency
- Icon consistency between iOS and Android
- Navigation pattern adherence to platform conventions
- Typography scaling matches platform defaults
- Color rendering consistency across devices
- Performance optimization for older devices

---

**Document Status**: Ready for Design Review
**Next Review Date**: September 15, 2025
**Document Owner**: UI/UX Design Team