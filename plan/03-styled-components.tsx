/**
 * Custom Styled Components for Lunar Sleep Analysis App
 * 
 * These components extend gluestack-ui base components with sleep-specific
 * styling and behavior patterns for consistent UI throughout the app.
 */

import {
    Badge,
    BadgeText, Box, Button, Card, Heading, HStack,
    Pressable, Progress,
    ProgressFilledTrack, styled, Text, VStack
} from '@gluestack-ui/themed';
import React from 'react';

// ===== SLEEP SCORE COMPONENTS =====

// Sleep Score Card with gradient background
export const SleepScoreCard = styled(Card, {
  bg: '$white',
  borderRadius: '$2xl',
  shadowColor: '$moonstone400',
  shadowOpacity: 0.15,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  overflow: 'hidden',
  
  variants: {
    score: {
      excellent: { borderTopWidth: '$1', borderTopColor: '$deepSleep500' },
      good: { borderTopWidth: '$1', borderTopColor: '$lightSleep500' },
      fair: { borderTopWidth: '$1', borderTopColor: '$rem500' },
      poor: { borderTopWidth: '$1', borderTopColor: '$awake500' },
    },
  },
});

// Large sleep score display
export const SleepScoreDisplay = ({ score, maxScore = 100, label }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return '$deepSleep500';
    if (score >= 70) return '$lightSleep500';
    if (score >= 50) return '$rem500';
    return '$awake500';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <VStack space="md" alignItems="center">
      <VStack space="xs" alignItems="center">
        <HStack alignItems="baseline" space="xs">
          <Heading size="6xl" color={getScoreColor(score)} fontFamily="$mono">
            {score}
          </Heading>
          <Text size="xl" color="$moonstone600" pb="$3">
            /{maxScore}
          </Text>
        </HStack>
        <Badge 
          action={score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error'}
          borderRadius="$full"
          px="$3"
          py="$1"
        >
          <BadgeText size="sm" textTransform="uppercase" letterSpacing="$md">
            {getScoreGrade(score)}
          </BadgeText>
        </Badge>
      </VStack>
      
      {label && (
        <Text size="sm" color="$moonstone600" textAlign="center">
          {label}
        </Text>
      )}
    </VStack>
  );
};

// ===== SLEEP STAGE COMPONENTS =====

// Sleep stage progress bar with custom colors
export const SleepStageProgress = styled(Progress, {
  h: '$3',
  bg: '$moonstone200',
  borderRadius: '$full',
  overflow: 'hidden',
});

export const SleepStageTrack = styled(ProgressFilledTrack, {
  borderRadius: '$full',
  
  variants: {
    stage: {
      deep: { bg: '$deepSleep500' },
      light: { bg: '$lightSleep500' },
      rem: { bg: '$rem500' },
      awake: { bg: '$awake500' },
    },
  },
});

// Sleep stage indicator dot
export const SleepStageIndicator = styled(Box, {
  w: '$4',
  h: '$4',
  borderRadius: '$full',
  
  variants: {
    stage: {
      deep: { bg: '$deepSleep500' },
      light: { bg: '$lightSleep500' },
      rem: { bg: '$rem500' },
      awake: { bg: '$awake500' },
    },
    size: {
      sm: { w: '$2', h: '$2' },
      md: { w: '$3', h: '$3' },
      lg: { w: '$4', h: '$4' },
      xl: { w: '$6', h: '$6' },
    },
  },
  
  defaultProps: {
    size: 'lg',
  },
});

// Sleep stage card with consistent styling
export const SleepStageCard = ({ stage, duration, percentage, icon }) => {
  const stageColors = {
    deep: '$deepSleep500',
    light: '$lightSleep500',
    rem: '$rem500',
    awake: '$awake500',
  };

  return (
    <Card bg="$white" borderRadius="$lg" p="$4" borderWidth="$1" borderColor="$moonstone200">
      <VStack space="sm">
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space="sm" alignItems="center">
            <Text size="xl">{icon}</Text>
            <Heading size="md" color="$moonstone900">{stage}</Heading>
          </HStack>
          <Text size="sm" color="$moonstone600">{percentage}%</Text>
        </HStack>
        
        <SleepStageProgress value={percentage}>
          <SleepStageTrack stage={stage.toLowerCase().replace(' ', '')} />
        </SleepStageProgress>
        
        <HStack justifyContent="space-between" alignItems="center">
          <Text size="lg" fontWeight="$semibold" color={stageColors[stage.toLowerCase().replace(' ', '')]}>
            {duration}
          </Text>
          <Text size="xs" color="$moonstone500" textTransform="uppercase" letterSpacing="$sm">
            Duration
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
};

// ===== METRIC CARDS =====

// Animated metric card with trend indicator
export const MetricCard = ({ title, value, unit, trend, trendValue, color = '$lunar500' }) => {
  const isPositive = trend === 'up';
  const trendColor = isPositive ? '$green500' : '$red500';
  const trendIcon = isPositive ? '↗' : '↘';

  return (
    <Card flex={1} bg="$white" borderRadius="$xl" p="$4" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={12}>
      <VStack space="sm">
        <Text size="xs" color="$moonstone600" textTransform="uppercase" letterSpacing="$md" fontWeight="$medium">
          {title}
        </Text>
        
        <HStack alignItems="baseline" space="xs">
          <Heading size="2xl" color={color} fontFamily="$mono">
            {value}
          </Heading>
          {unit && (
            <Text size="md" color="$moonstone600" fontWeight="$medium">
              {unit}
            </Text>
          )}
        </HStack>
        
        {trend && (
          <HStack alignItems="center" space="xs">
            <Text size="sm" color={trendColor} fontWeight="$semibold">
              {trendIcon} {trendValue}
            </Text>
            <Text size="xs" color="$moonstone500">vs last week</Text>
          </HStack>
        )}
      </VStack>
    </Card>
  );
};

// ===== CHAT COMPONENTS =====

// AI message bubble
export const AIChatBubble = styled(Box, {
  bg: '$white',
  borderRadius: '$lg',
  borderBottomLeftRadius: '$sm',
  p: '$4',
  maxWidth: '85%',
  shadowColor: '$moonstone300',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
});

// User message bubble
export const UserChatBubble = styled(Box, {
  bg: '$lunar500',
  borderRadius: '$lg',
  borderBottomRightRadius: '$sm',
  p: '$4',
  maxWidth: '85%',
  alignSelf: 'flex-end',
});

// Chat input container
export const ChatInputContainer = styled(Box, {
  bg: '$white',
  borderTopWidth: '$1',
  borderTopColor: '$moonstone200',
  p: '$4',
  paddingBottom: '$8', // Account for safe area
});

// Typing indicator
export const TypingIndicator = () => {
  return (
    <HStack space="sm" alignItems="center" py="$2" px="$4">
      <Box p="$2" bg="$lunar100" borderRadius="$full">
        <Text size="xs" color="$lunar600" fontWeight="$semibold">AI</Text>
      </Box>
      <HStack space="xs" alignItems="center">
        <Box w="$2" h="$2" bg="$moonstone400" borderRadius="$full" />
        <Box w="$2" h="$2" bg="$moonstone400" borderRadius="$full" />
        <Box w="$2" h="$2" bg="$moonstone400" borderRadius="$full" />
      </HStack>
    </HStack>
  );
};

// ===== CHART CONTAINERS =====

// Chart card with gradient background
export const ChartCard = styled(Card, {
  bg: '$white',
  borderRadius: '$xl',
  overflow: 'hidden',
  shadowColor: '$moonstone300',
  shadowOpacity: 0.1,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
});

// Chart placeholder with gradient background
export const ChartPlaceholder = ({ height = '$48', children }) => {
  return (
    <Box 
      h={height} 
      borderRadius="$lg" 
      overflow="hidden"
      justifyContent="center" 
      alignItems="center"
      bg="$moonstone50"
    >
      {children || (
        <VStack space="sm" alignItems="center">
          <Text color="$moonstone600" size="sm">Chart Visualization</Text>
          <Text color="$moonstone500" size="xs">Coming Soon</Text>
        </VStack>
      )}
    </Box>
  );
};

// ===== ACTION BUTTONS =====

// Primary CTA button with lunar theme
export const LunarButton = styled(Button, {
  bg: '$lunar500',
  borderRadius: '$xl',
  h: '$12',
  px: '$6',
  shadowColor: '$lunar500',
  shadowOpacity: 0.3,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  
  ':hover': {
    bg: '$lunar600',
    shadowRadius: 16,
  },
  
  ':active': {
    bg: '$lunar700',
    shadowRadius: 8,
  },
  
  variants: {
    size: {
      sm: { h: '$8', px: '$4', borderRadius: '$lg' },
      md: { h: '$10', px: '$5', borderRadius: '$xl' },
      lg: { h: '$12', px: '$6', borderRadius: '$xl' },
      xl: { h: '$14', px: '$8', borderRadius: '$2xl' },
    },
    
    variant: {
      solid: { bg: '$lunar500' },
      outline: { 
        bg: 'transparent', 
        borderWidth: '$2', 
        borderColor: '$lunar500',
        shadowOpacity: 0,
      },
      ghost: { 
        bg: 'transparent',
        shadowOpacity: 0,
      },
    },
  },
  
  defaultProps: {
    size: 'lg',
    variant: 'solid',
  },
});

// Floating action button
export const FloatingActionButton = styled(Pressable, {
  position: 'absolute',
  bottom: '$20',
  right: '$4',
  w: '$16',
  h: '$16',
  bg: '$lunar500',
  borderRadius: '$full',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '$lunar500',
  shadowOpacity: 0.4,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  
  ':hover': {
    bg: '$lunar600',
    shadowRadius: 20,
  },
  
  ':active': {
    bg: '$lunar700',
    shadowRadius: 12,
  },
});

// ===== NAVIGATION COMPONENTS =====

// Bottom tab bar with blur background
export const BottomTabBar = styled(Box, {
  bg: '$white',
  borderTopWidth: '$1',
  borderTopColor: '$moonstone200',
  paddingBottom: '$8', // Safe area
  shadowColor: '$moonstone400',
  shadowOpacity: 0.1,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: -4 },
});

// Tab item with sleep-themed icons
export const TabItem = ({ isActive, icon, label, onPress }) => {
  return (
    <Pressable flex={1} alignItems="center" py="$2" onPress={onPress}>
      <VStack space="xs" alignItems="center">
        <Box 
          p="$2" 
          borderRadius="$lg"
          bg={isActive ? '$lunar100' : 'transparent'}
        >
          <Text 
            size="xl" 
            color={isActive ? '$lunar600' : '$moonstone500'}
          >
            {icon}
          </Text>
        </Box>
        <Text 
          size="xs" 
          color={isActive ? '$lunar600' : '$moonstone600'}
          fontWeight={isActive ? '$semibold' : '$normal'}
        >
          {label}
        </Text>
      </VStack>
    </Pressable>
  );
};

// ===== HEADER COMPONENTS =====

// Screen header with gradient background
export const ScreenHeader = ({ title, subtitle, rightElement, showBackButton = false }) => {
  return (
    <Box 
      bg="$white" 
      pt="$12" 
      pb="$4" 
      px="$4"
      borderBottomWidth="$1"
      borderBottomColor="$moonstone200"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack flex={1} space="xs">
          {showBackButton && (
            <Pressable alignSelf="flex-start" mb="$2">
              <Text size="lg" color="$lunar500">← Back</Text>
            </Pressable>
          )}
          <Heading size="2xl" color="$moonstone900">{title}</Heading>
          {subtitle && (
            <Text size="sm" color="$moonstone600">{subtitle}</Text>
          )}
        </VStack>
        {rightElement}
      </HStack>
    </Box>
  );
};

// ===== EMPTY STATES =====

// Empty state with illustration placeholder
export const EmptyState = ({ icon, title, description, actionButton }) => {
  return (
    <VStack space="lg" alignItems="center" p="$8" flex={1} justifyContent="center">
      <Box 
        w="$24" 
        h="$24" 
        bg="$moonstone100" 
        borderRadius="$full" 
        justifyContent="center" 
        alignItems="center"
      >
        <Text size="4xl">{icon}</Text>
      </Box>
      
      <VStack space="sm" alignItems="center">
        <Heading size="xl" color="$moonstone900" textAlign="center">
          {title}
        </Heading>
        <Text size="sm" color="$moonstone600" textAlign="center" maxWidth="$64">
          {description}
        </Text>
      </VStack>
      
      {actionButton}
    </VStack>
  );
};

// ===== LOADING STATES =====

// Loading skeleton for cards
export const SkeletonCard = () => {
  return (
    <Card bg="$white" p="$4" borderRadius="$xl">
      <VStack space="sm">
        <Box w="$20" h="$4" bg="$moonstone200" borderRadius="$sm" />
        <Box w="$32" h="$8" bg="$moonstone200" borderRadius="$sm" />
        <Box w="$full" h="$2" bg="$moonstone200" borderRadius="$sm" />
      </VStack>
    </Card>
  );
};

// Loading spinner with lunar theme
export const LunarSpinner = () => {
  return (
    <Box justifyContent="center" alignItems="center" p="$8">
      <Box 
        w="$8" 
        h="$8" 
        borderWidth="$1" 
        borderColor="$lunar200"
        borderTopColor="$lunar500"
        borderRadius="$full"
      />
    </Box>
  );
};

export {
    AIChatBubble, BottomTabBar, ChartCard,
    ChartPlaceholder, ChatInputContainer, EmptyState, FloatingActionButton, LunarButton, LunarSpinner, MetricCard, ScreenHeader, SkeletonCard, SleepScoreCard,
    SleepScoreDisplay, SleepStageCard, SleepStageIndicator, SleepStageProgress,
    SleepStageTrack, TabItem, TypingIndicator, UserChatBubble
};
