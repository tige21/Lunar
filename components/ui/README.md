# Lunar UI Component Library

A comprehensive, sleep-focused React Native UI component library built for the Lunar sleep analysis app. All components are designed with accessibility, theming, and performance in mind.

## Core Design Principles

- **Sleep-Optimized**: Color palette and animations designed for comfortable night-time viewing
- **Accessible**: WCAG compliant with proper contrast ratios and touch targets
- **Themeable**: Full support for light/dark modes with consistent theming
- **Performant**: Optimized animations using React Native Reanimated
- **TypeScript First**: Full TypeScript support with comprehensive type definitions

## Component Categories

### Core Themed Components

#### ThemedView
Enhanced View component with variant support, shadows, and gradient capabilities.

```tsx
import { ThemedView } from '@/components/ui';

<ThemedView 
  variant="sleep-card" 
  shadow="glow"
  borderRadius="xl"
>
  {/* Your content */}
</ThemedView>
```

**Props:**
- `variant`: 'default' | 'surface' | 'card' | 'sleep-surface' | 'container' | 'modal' | 'gradient' | 'sleep-card' | 'metric-card' | 'compact-card' | 'glass'
- `shadow`: 'none' | 'soft' | 'hard' | 'glow'
- `borderRadius`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
- `gradientColors`: string[] (for gradient variant)
- `gradientDirection`: 'horizontal' | 'vertical' | 'diagonal'

#### ThemedText
Typography component with comprehensive text styles and sleep-specific semantic variants.

```tsx
import { ThemedText } from '@/components/ui';

<ThemedText type="sleep-score" variant="primary">
  89
</ThemedText>
<ThemedText type="caption" variant="sleep-deep">
  Deep Sleep: 2h 15m
</ThemedText>
```

**Props:**
- `type`: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'sleep-data' | 'heading' | 'body' | 'metric' | 'display' | 'label' | 'sleep-time' | 'sleep-score' | 'small-metric' | 'hero'
- `variant`: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'sleep-deep' | 'sleep-rem' | 'sleep-light' | 'sleep-wake'
- `weight`: 'normal' | 'medium' | 'semibold' | 'bold'
- `align`: 'left' | 'center' | 'right'

#### ThemedButton
Comprehensive button component with sleep-specific variants, haptic feedback, and gradient support.

```tsx
import { ThemedButton } from '@/components/ui';

<ThemedButton 
  variant="sleep-stage" 
  sleepStage="deep"
  size="xl" 
  fullWidth
  haptic
>
  Start Deep Sleep Mode
</ThemedButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'sleep' | 'wake' | 'outline' | 'ghost' | 'gradient' | 'sleep-stage' | 'floating'
- `size`: 'small' | 'medium' | 'large' | 'xl'
- `sleepStage`: 'deep' | 'rem' | 'light' | 'wake' (for sleep-stage variant)
- `fullWidth`: boolean
- `loading`: boolean
- `haptic`: boolean (default: true)
- `icon`: React.ReactNode
- `iconPosition`: 'left' | 'right'

### Sleep Visualization Components

#### SleepScore
Animated circular progress component with gradient rings and sleep quality indicators.

```tsx
import { SleepScore } from '@/components/ui';

<SleepScore 
  score={85} 
  size="large" 
  showLabel={true}
  sleepQuality="excellent"
  showGlow={true}
  animated={true}
/>
```

**Props:**
- `score`: number (0-100)
- `size`: 'small' | 'medium' | 'large'
- `showLabel`: boolean
- `label`: string
- `sleepQuality`: 'poor' | 'fair' | 'good' | 'excellent'
- `showGlow`: boolean (adds gradient background glow)
- `animated`: boolean (smooth enter animations)

#### SleepPhaseChart
Interactive animated bar chart with gradient phases, selection feedback, and detailed breakdowns.

```tsx
import { SleepPhaseChart } from '@/components/ui';

const phases = [
  { phase: 'deep', duration: 120, percentage: 25 },
  { phase: 'rem', duration: 90, percentage: 18.75 },
  // ...
];

<SleepPhaseChart 
  phases={phases}
  totalDuration={480}
  showLegend={true}
  interactive={true}
  animated={true}
  onPhasePress={(phase, index) => console.log('Selected:', phase)}
/>
```

**Props:**
- `phases`: SleepPhase[] (phase data with duration and percentages)
- `totalDuration`: number (total sleep duration in minutes)
- `showLegend`: boolean
- `interactive`: boolean (enables tap-to-select phases)
- `animated`: boolean (smooth enter animations)
- `onPhasePress`: (phase: SleepPhase, index: number) => void

#### MetricsCard
Flexible card component for displaying key metrics with trend indicators.

```tsx
import { MetricsCard } from '@/components/ui';

<MetricsCard
  title="Sleep Duration"
  value="8h 15m"
  subtitle="Last night"
  trend="up"
  trendValue="+30min"
  variant="sleep"
  onPress={() => {/* Handle tap */}}
/>
```

#### TrendChart
Line chart component for visualizing historical sleep data trends.

```tsx
import { TrendChart } from '@/components/ui';

const data = [
  { date: '2024-01-01', value: 7.5 },
  { date: '2024-01-02', value: 8.2 },
  // ...
];

<TrendChart
  title="Sleep Duration Trend"
  data={data}
  formatValue={(value) => `${value}h`}
  height={200}
/>
```

#### SleepGoalTracker
Progress tracking component for sleep goals with detailed stats.

```tsx
import { SleepGoalTracker } from '@/components/ui';

<SleepGoalTracker
  currentValue={495} // minutes
  goalValue={480} // minutes
  title="Daily Sleep Goal"
  variant="detailed"
/>
```

### Interactive Components

#### TimePicker
Cross-platform time picker with proper modal handling for iOS and Android.

```tsx
import { TimePicker } from '@/components/ui';

<TimePicker
  value={bedtime}
  onChange={setBedtime}
  label="Bedtime"
  mode="12h"
/>
```

#### RangeSlider
Animated slider component with step support and custom formatting.

```tsx
import { RangeSlider } from '@/components/ui';

<RangeSlider
  min={6}
  max={12}
  value={sleepDuration}
  onChange={setSleepDuration}
  step={0.5}
  label="Sleep Goal"
  unit="h"
/>
```

#### ToggleButton
Switch and button toggle variants with smooth animations.

```tsx
import { ToggleButton } from '@/components/ui';

<ToggleButton
  value={enabled}
  onValueChange={setEnabled}
  label="Sleep Reminders"
  variant="switch"
/>
```

### Layout Components

#### SafeContainer
Root container with proper safe area handling and status bar management.

```tsx
import { SafeContainer } from '@/components/ui';

<SafeContainer statusBarStyle="auto">
  {/* Your app content */}
</SafeContainer>
```

#### ScrollContainer
Scrollable container with refresh control and proper theming.

```tsx
import { ScrollContainer } from '@/components/ui';

<ScrollContainer
  refreshing={loading}
  onRefresh={handleRefresh}
  paddingHorizontal={20}
>
  {/* Scrollable content */}
</ScrollContainer>
```

#### Modal
Comprehensive modal component with blur backdrop and size variants.

```tsx
import { Modal } from '@/components/ui';

<Modal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  title="Sleep Settings"
  size="medium"
  backdrop="blur"
>
  {/* Modal content */}
</Modal>
```

### State Components

#### LoadingState
Various loading animations optimized for sleep tracking contexts.

```tsx
import { LoadingState } from '@/components/ui';

<LoadingState 
  variant="sleep-wave" 
  message="Analyzing sleep data..." 
  size="large"
/>
```

**Variants:**
- `spinner`: Standard activity indicator
- `pulse`: Pulsing circle animation
- `skeleton`: Content placeholder loading
- `sleep-wave`: Sleep-themed wave animation
- `dots`: Three-dot loading animation

#### EmptyState
Pre-configured empty states for common sleep tracking scenarios.

```tsx
import { 
  EmptyState, 
  SleepDataEmptyState, 
  PermissionsEmptyState 
} from '@/components/ui';

// Generic empty state
<EmptyState
  title="No Data"
  description="Start tracking to see insights"
  actionTitle="Get Started"
  onAction={handleAction}
/>

// Pre-configured variants
<SleepDataEmptyState onSetupSleep={handleSetup} />
<PermissionsEmptyState onRequestPermissions={handlePermissions} />
```

## Theming System

All components automatically adapt to the current theme using the `useThemeColor` hook. The theme system includes:

### Color Palette
```typescript
// Sleep-optimized colors
const Colors = {
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#1F2937',
    tint: '#5B21B6', // Deep purple
    // ... sleep-specific colors
  },
  dark: {
    background: '#0F0A1E', // Very dark purple
    surface: '#1E1B3C',
    text: '#F3F4F6',
    tint: '#8B5CF6', // Lighter purple
    // ... sleep-specific colors
  }
};
```

### Typography Scale
- Display: 48px - Hero headlines
- Heading: 32px - Page titles
- Title: 24px - Section headers
- Subtitle: 20px - Card titles
- Body: 16px - Default text
- Caption: 14px - Secondary text
- Label: 12px - Form labels

### Spacing System
Based on 4px increments:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## Accessibility Features

All components include:
- Proper accessibility labels and hints
- Minimum 44pt touch targets
- WCAG AA contrast ratios
- Screen reader support
- Focus management
- Reduced motion support

## Performance Optimizations

- React Native Reanimated for 60fps animations
- Lazy loading for complex components
- Memoized style calculations
- Optimized re-renders using React.memo
- Efficient gesture handling

## Usage Examples

See `components/examples/SleepUIShowcase.tsx` for comprehensive usage examples of all components.

## Design System Constants

The design system includes predefined constants for consistent styling:

```tsx
import { 
  LUNAR_SPACING, 
  LUNAR_RADIUS, 
  LUNAR_SHADOWS,
  SLEEP_COLORS,
  COMPONENT_SIZES,
  ANIMATION_DURATIONS
} from '@/components/ui';

// Usage examples
<ThemedView 
  style={{ 
    padding: LUNAR_SPACING.md,
    borderRadius: LUNAR_RADIUS.xl 
  }}
  shadow={LUNAR_SHADOWS.glow}
>
  <ThemedText style={{ color: SLEEP_COLORS.deep }}>
    Deep Sleep Data
  </ThemedText>
</ThemedView>
```

## Dependencies

Required packages:
```json
{
  "expo-linear-gradient": "~14.1.3",
  "react-native-svg": "15.11.2",
  "react-native-reanimated": "~3.17.4",
  "react-native-gesture-handler": "~2.24.0",
  "@react-native-community/datetimepicker": "^8.4.1",
  "expo-blur": "~14.1.5",
  "expo-haptics": "~14.1.4",
  "@gluestack-ui/themed": "^1.1.55",
  "nativewind": "^4.0.1"
}
```

## Best Practices

1. **Consistent Spacing**: Use the predefined spacing scale
2. **Color Usage**: Use semantic colors (success, warning, error) appropriately
3. **Typography**: Match text variants to content hierarchy
4. **Accessibility**: Always provide meaningful labels
5. **Performance**: Use appropriate component sizes for your use case
6. **Theming**: Test components in both light and dark modes

## Contributing

When adding new components:
1. Follow the established naming conventions
2. Include comprehensive TypeScript types
3. Add proper accessibility support
4. Test in both light and dark themes
5. Update this documentation
6. Add usage examples to the showcase component