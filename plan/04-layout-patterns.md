# Layout Patterns and Responsive Guidelines

## Overview
This document defines the layout patterns, responsive behavior, and grid systems for the Lunar sleep analysis app using gluestack-ui components.

## Grid System

### Base Grid Structure
```typescript
// 4px base unit system
const spacing = {
  xs: 4,    // $1
  sm: 8,    // $2  
  md: 16,   // $4
  lg: 24,   // $6
  xl: 32,   // $8
  xxl: 48,  // $12
}
```

### Container Widths
```typescript
const containers = {
  mobile: '100%',       // < 480px
  tablet: '768px',      // 480-768px  
  desktop: '1024px',    // > 768px
}
```

## Layout Patterns

### 1. Dashboard Grid Layout
```tsx
<VStack flex={1} space="lg" p="$4">
  {/* Header Section */}
  <VStack space="sm">
    <HStack justifyContent="space-between" alignItems="center">
      <VStack flex={1}>
        <Heading>Dashboard Title</Heading>
      </VStack>
      <Box>Action Element</Box>
    </HStack>
  </VStack>

  {/* Primary Content Area */}
  <VStack space="md">
    {/* Hero Card - Full Width */}
    <Card>Sleep Score Display</Card>
    
    {/* Two Column Grid */}
    <HStack space="md">
      <Card flex={1}>Metric 1</Card>
      <Card flex={1}>Metric 2</Card>
    </HStack>
    
    {/* Chart Section - Full Width */}
    <Card>Chart Visualization</Card>
  </VStack>
</VStack>
```

### 2. Analytics Multi-Column Layout
```tsx
<ScrollView flex={1}>
  <VStack space="lg" p="$4">
    {/* Metrics Grid - 2x2 on mobile, 4x1 on tablet+ */}
    <VStack space="md">
      <HStack space="md">
        <MetricCard flex={1} />
        <MetricCard flex={1} />
      </HStack>
      <HStack space="md">
        <MetricCard flex={1} />
        <MetricCard flex={1} />
      </HStack>
    </VStack>

    {/* Charts Stack */}
    <VStack space="md">
      <ChartCard />
      <ChartCard />
    </VStack>
  </VStack>
</ScrollView>
```

### 3. Chat Interface Layout
```tsx
<VStack flex={1}>
  {/* Fixed Header */}
  <ScreenHeader />
  
  {/* Scrollable Messages */}
  <ScrollView flex={1} p="$4">
    <VStack space="md">
      {/* AI Messages - Left Aligned */}
      <HStack space="sm" justifyContent="flex-start">
        <Avatar />
        <ChatBubble maxWidth="85%" />
      </HStack>
      
      {/* User Messages - Right Aligned */}
      <HStack space="sm" justifyContent="flex-end">
        <ChatBubble maxWidth="85%" />
      </HStack>
    </VStack>
  </ScrollView>
  
  {/* Fixed Input Area */}
  <ChatInputContainer />
</VStack>
```

### 4. Settings List Layout
```tsx
<ScrollView flex={1}>
  <VStack space="lg" p="$4">
    {/* Profile Section */}
    <Card>
      <HStack space="md" alignItems="center">
        <Avatar size="lg" />
        <VStack flex={1}>
          <Text>Profile Info</Text>
        </VStack>
        <Button>Action</Button>
      </HStack>
    </Card>
    
    {/* Settings Groups */}
    <VStack space="md">
      {settingsGroups.map(group => (
        <Card key={group.id}>
          <VStack space="sm">
            {group.items.map(item => (
              <HStack key={item.id} justifyContent="space-between">
                <Text>{item.label}</Text>
                <SettingControl />
              </HStack>
            ))}
          </VStack>
        </Card>
      ))}
    </VStack>
  </VStack>
</ScrollView>
```

## Responsive Breakpoints

### Mobile First Approach
```typescript
const breakpoints = {
  base: 0,      // Mobile portrait
  sm: 480,      // Mobile landscape  
  md: 768,      // Tablet portrait
  lg: 992,      // Tablet landscape
  xl: 1280,     // Desktop
}
```

### Responsive Modifiers
```tsx
// Example: Responsive grid columns
<HStack 
  space={{ base: "sm", md: "md", lg: "lg" }}
  flexDirection={{ base: "column", md: "row" }}
>
  <Box flex={{ base: 1, md: 1 }}>Item 1</Box>
  <Box flex={{ base: 1, md: 1 }}>Item 2</Box>
</HStack>
```

## Screen-Specific Layouts

### Dashboard Screen Layout
```
┌─────────────────────────────────────┐
│ Header (Profile + Time)             │
├─────────────────────────────────────┤
│ Sleep Score Card (Full Width)       │
├─────────────────────────────────────┤
│ Sleep Stages (Full Width)           │  
├─────────────────────────────────────┤
│ [Quick Action] [Quick Action]       │
├─────────────────────────────────────┤
│ Sleep Pattern Chart (Full Width)    │
├─────────────────────────────────────┤
│ Recent Insights (Full Width)        │
└─────────────────────────────────────┘
```

### Analytics Screen Layout
```
┌─────────────────────────────────────┐
│ Header + Period Selector            │
├─────────────────────────────────────┤
│ [Metric 1] [Metric 2]              │
│ [Metric 3] [Metric 4]              │
├─────────────────────────────────────┤
│ Trend Chart (Full Width)           │
├─────────────────────────────────────┤
│ Sleep Stages Chart (Full Width)    │
├─────────────────────────────────────┤
│ Schedule Chart (Full Width)        │
└─────────────────────────────────────┘
```

### Chat Screen Layout
```
┌─────────────────────────────────────┐
│ Chat Header (Fixed)                 │
├─────────────────────────────────────┤
│ ┌─ AI Message                       │
│ └─ User Message              ─┐     │
│ ┌─ AI Message + Suggestions         │
│ │  [Suggestion Cards]               │
│ └─ User Message              ─┐     │
│ (Scrollable Area)                   │
├─────────────────────────────────────┤
│ Input Area (Fixed)                  │
│ [Text Input] [Send Button]          │
└─────────────────────────────────────┘
```

## Component Spacing

### Card Spacing
```tsx
// Internal card padding
const cardPadding = {
  sm: '$3',    // 12px - Compact cards
  md: '$4',    // 16px - Standard cards  
  lg: '$6',    // 24px - Feature cards
  xl: '$8',    // 32px - Hero cards
}

// Card margin/gap
const cardSpacing = {
  tight: '$2',   // 8px - Dense lists
  normal: '$4',  // 16px - Standard spacing
  loose: '$6',   // 24px - Section spacing
}
```

### Text Hierarchy Spacing
```tsx
const textSpacing = {
  // Heading to body text
  headingToBody: '$2',      // 8px
  
  // Between paragraphs  
  paragraphGap: '$4',       // 16px
  
  // Section spacing
  sectionGap: '$8',         // 32px
}
```

## Safe Area Handling

### iOS Safe Areas
```tsx
// Top safe area for headers
<Box pt="$12">  // Account for notch + status bar

// Bottom safe area for inputs/tabs
<Box pb="$8">   // Account for home indicator
```

### Android Edge-to-Edge
```tsx
// Use React Native's SafeAreaView or expo-status-bar
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

<Box pt={insets.top} pb={insets.bottom}>
  {/* Content */}
</Box>
```

## Animation Layout Patterns

### Page Transitions
```tsx
// Slide transitions between screens
const slideTransition = {
  type: 'slide',
  direction: 'horizontal',
  duration: 300,
}

// Fade transitions for modals
const fadeTransition = {
  type: 'fade',
  duration: 200,
}
```

### Component Animations
```tsx
// Card entrance animations
<Card 
  entering={FadeInUp.duration(400)}
  layout={Layout.springify()}
>
  {/* Card content */}
</Card>

// Progress bar animations
<Progress 
  value={animatedValue}
  animate={{ duration: 1000 }}
/>
```

## Accessibility Considerations

### Touch Targets
```tsx
// Minimum touch target size: 44px x 44px
const touchTarget = {
  minHeight: '$11',    // 44px
  minWidth: '$11',     // 44px
}
```

### Focus Management
```tsx
// Keyboard navigation order
<VStack space="$2">
  <Button tabIndex={1}>Primary Action</Button>
  <Button tabIndex={2} variant="outline">Secondary</Button>
</VStack>
```

### Screen Reader Support
```tsx
// Semantic grouping
<Box role="region" aria-label="Sleep metrics">
  <Heading role="heading" level={2}>Sleep Score</Heading>
  <Text role="text">87/100</Text>
</Box>
```

## Performance Optimization

### Lazy Loading
```tsx
// Lazy load heavy chart components
const SleepChart = lazy(() => import('./SleepChart'));

<Suspense fallback={<ChartSkeleton />}>
  <SleepChart data={sleepData} />
</Suspense>
```

### Virtualization for Lists
```tsx
// Use FlatList for long lists
<FlatList
  data={sleepRecords}
  renderItem={({ item }) => <SleepRecordCard data={item} />}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  windowSize={10}
  removeClippedSubviews={true}
/>
```

This layout system ensures consistent, accessible, and performant user interfaces across all screen sizes while maintaining the sleep-focused design language of the Lunar app.