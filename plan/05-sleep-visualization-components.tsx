/**
 * Sleep Visualization Components using Gluestack-UI
 * 
 * Custom components for visualizing sleep data, scores, and analytics
 * Built with Card + Progress + Badge combinations from gluestack-ui
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  VStack,
  HStack,
  Text,
  Heading,
  Progress,
  ProgressFilledTrack,
  Badge,
  BadgeText,
  Button,
  ButtonText,
  Pressable,
} from '@gluestack-ui/themed';

// ===== SLEEP SCORE VISUALIZATION =====

export const SleepScoreVisualization = ({ score, trend, date }) => {
  const getScoreGradient = (score) => {
    if (score >= 90) return ['$deepSleep500', '$deepSleep400'];
    if (score >= 70) return ['$lightSleep500', '$lightSleep400'];
    if (score >= 50) return ['$rem500', '$rem400'];
    return ['$awake500', '$awake400'];
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return { text: 'Excellent', action: 'success' };
    if (score >= 70) return { text: 'Good', action: 'info' };
    if (score >= 50) return { text: 'Fair', action: 'warning' };
    return { text: 'Poor', action: 'error' };
  };

  const scoreColors = getScoreGradient(score);
  const badge = getScoreBadge(score);

  return (
    <Card size="lg" bg="$white" borderRadius="$2xl" shadowColor="$moonstone400" shadowOpacity={0.12} shadowRadius={16}>
      <CardHeader pb="$2">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Heading size="lg" color="$moonstone900">Sleep Score</Heading>
            <Text size="sm" color="$moonstone600">{date}</Text>
          </VStack>
          <Badge action={badge.action} borderRadius="$full" px="$3" py="$1">
            <BadgeText size="sm" textTransform="uppercase" letterSpacing="$sm">
              {badge.text}
            </BadgeText>
          </Badge>
        </HStack>
      </CardHeader>
      
      <CardBody>
        <VStack space="lg" alignItems="center">
          {/* Circular Score Display */}
          <Box position="relative" alignItems="center" justifyContent="center">
            {/* Background Circle */}
            <Box
              w="$32"
              h="$32"
              borderRadius="$full"
              borderWidth="$2"
              borderColor="$moonstone200"
              position="absolute"
            />
            
            {/* Progress Circle - Simulated with border */}
            <Box
              w="$32"
              h="$32"
              borderRadius="$full"
              borderWidth="$2"
              borderColor={scoreColors[0]}
              borderTopColor={scoreColors[0]}
              borderRightColor={score > 25 ? scoreColors[0] : '$moonstone200'}
              borderBottomColor={score > 50 ? scoreColors[0] : '$moonstone200'}
              borderLeftColor={score > 75 ? scoreColors[0] : '$moonstone200'}
              position="absolute"
            />
            
            {/* Score Text */}
            <VStack alignItems="center" space="xs">
              <Heading size="4xl" color={scoreColors[0]} fontFamily="$mono">
                {score}
              </Heading>
              <Text size="sm" color="$moonstone600">/100</Text>
            </VStack>
          </Box>
          
          {/* Trend Indicator */}
          {trend && (
            <HStack alignItems="center" space="sm">
              <Text 
                size="sm" 
                color={trend.direction === 'up' ? '$green500' : '$red500'}
                fontWeight="$semibold"
              >
                {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
              </Text>
              <Text size="sm" color="$moonstone600">from yesterday</Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

// ===== SLEEP STAGES BREAKDOWN =====

export const SleepStagesBreakdown = ({ stages, totalSleep }) => {
  const stageConfig = {
    deep: { 
      color: '$deepSleep500', 
      name: 'Deep Sleep', 
      icon: '🛌',
      description: 'Physical recovery'
    },
    light: { 
      color: '$lightSleep500', 
      name: 'Light Sleep', 
      icon: '💤',
      description: 'Preparation for deep sleep'
    },
    rem: { 
      color: '$rem500', 
      name: 'REM Sleep', 
      icon: '🧠',
      description: 'Mental recovery'
    },
    awake: { 
      color: '$awake500', 
      name: 'Awake', 
      icon: '👁️',
      description: 'Sleep interruptions'
    },
  };

  return (
    <Card bg="$white" borderRadius="$xl" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={12}>
      <CardHeader>
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg" color="$moonstone900">Sleep Stages</Heading>
          <Badge action="muted" borderRadius="$md" px="$2" py="$1">
            <BadgeText size="xs">{totalSleep}</BadgeText>
          </Badge>
        </HStack>
      </CardHeader>
      
      <CardBody>
        <VStack space="md">
          {/* Stacked Progress Bar */}
          <VStack space="xs">
            <HStack space="xs">
              {Object.entries(stages).map(([key, stage]) => (
                <Box
                  key={key}
                  flex={stage.percentage}
                  h="$2"
                  bg={stageConfig[key]?.color}
                  borderRadius={
                    key === 'deep' ? '$sm $none $none $sm' :
                    key === 'awake' ? '$none $sm $sm $none' : '$none'
                  }
                />
              ))}
            </HStack>
            <Text size="xs" color="$moonstone500" textAlign="center">
              Sleep composition
            </Text>
          </VStack>
          
          {/* Stage Details */}
          <VStack space="sm">
            {Object.entries(stages).map(([key, stage]) => {
              const config = stageConfig[key];
              return (
                <HStack key={key} justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center" flex={1}>
                    <Text size="lg">{config.icon}</Text>
                    <VStack flex={1}>
                      <Text size="sm" fontWeight="$medium" color="$moonstone900">
                        {config.name}
                      </Text>
                      <Text size="xs" color="$moonstone600">
                        {config.description}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <VStack alignItems="flex-end" space="xs">
                    <Text size="sm" fontWeight="$semibold" color={config.color}>
                      {stage.duration}
                    </Text>
                    <Text size="xs" color="$moonstone600">
                      {stage.percentage}%
                    </Text>
                  </VStack>
                </HStack>
              );
            })}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// ===== SLEEP TREND CHART =====

export const SleepTrendChart = ({ data, period = '7d' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  
  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ];

  return (
    <Card bg="$white" borderRadius="$xl" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={12}>
      <CardHeader>
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg" color="$moonstone900">Sleep Trends</Heading>
          
          {/* Period Selector */}
          <HStack space="xs" bg="$moonstone100" borderRadius="$lg" p="$1">
            {periods.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => setSelectedPeriod(p.key)}
                bg={selectedPeriod === p.key ? '$white' : 'transparent'}
                borderRadius="$md"
                px="$3"
                py="$1"
              >
                <Text 
                  size="xs" 
                  color={selectedPeriod === p.key ? '$lunar600' : '$moonstone600'}
                  fontWeight={selectedPeriod === p.key ? '$semibold' : '$normal'}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </HStack>
      </CardHeader>
      
      <CardBody>
        <VStack space="md">
          {/* Chart Placeholder with Data Points */}
          <Box h="$48" position="relative">
            {/* Y-Axis Labels */}
            <VStack position="absolute" left="$0" top="$0" bottom="$0" justifyContent="space-between">
              <Text size="xs" color="$moonstone500">100</Text>
              <Text size="xs" color="$moonstone500">75</Text>
              <Text size="xs" color="$moonstone500">50</Text>
              <Text size="xs" color="$moonstone500">25</Text>
              <Text size="xs" color="$moonstone500">0</Text>
            </VStack>
            
            {/* Chart Area */}
            <Box flex={1} ml="$8" bg="$moonstone50" borderRadius="$lg" p="$4">
              {/* Simulated Chart Lines */}
              <VStack space="sm" flex={1}>
                {data?.map((point, index) => (
                  <HStack key={index} alignItems="center" space="sm" flex={1}>
                    <Box 
                      w="$1" 
                      h="$6" 
                      bg={
                        point.score >= 80 ? '$deepSleep500' :
                        point.score >= 60 ? '$lightSleep500' :
                        point.score >= 40 ? '$rem500' : '$awake500'
                      }
                      borderRadius="$sm"
                    />
                    <Text size="xs" color="$moonstone600">{point.score}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
            
            {/* X-Axis Labels */}
            <HStack justifyContent="space-between" mt="$2" ml="$8">
              <Text size="xs" color="$moonstone500">Mon</Text>
              <Text size="xs" color="$moonstone500">Wed</Text>
              <Text size="xs" color="$moonstone500">Fri</Text>
              <Text size="xs" color="$moonstone500">Sun</Text>
            </HStack>
          </Box>
          
          {/* Chart Legend */}
          <HStack justifyContent="center" space="md" flexWrap="wrap">
            <HStack space="xs" alignItems="center">
              <Box w="$3" h="$2" bg="$deepSleep500" borderRadius="$sm" />
              <Text size="xs" color="$moonstone600">Excellent</Text>
            </HStack>
            <HStack space="xs" alignItems="center">
              <Box w="$3" h="$2" bg="$lightSleep500" borderRadius="$sm" />
              <Text size="xs" color="$moonstone600">Good</Text>
            </HStack>
            <HStack space="xs" alignItems="center">
              <Box w="$3" h="$2" bg="$rem500" borderRadius="$sm" />
              <Text size="xs" color="$moonstone600">Fair</Text>
            </HStack>
            <HStack space="xs" alignItems="center">
              <Box w="$3" h="$2" bg="$awake500" borderRadius="$sm" />
              <Text size="xs" color="$moonstone600">Poor</Text>
            </HStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// ===== SLEEP PATTERN HEATMAP =====

export const SleepPatternHeatmap = ({ weekData }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getIntensityColor = (intensity) => {
    if (intensity === 'awake') return '$awake300';
    if (intensity === 'light') return '$lightSleep300';
    if (intensity === 'deep') return '$deepSleep500';
    if (intensity === 'rem') return '$rem400';
    return '$moonstone100';
  };

  return (
    <Card bg="$white" borderRadius="$xl" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={12}>
      <CardHeader>
        <Heading size="lg" color="$moonstone900">Sleep Pattern</Heading>
        <Text size="sm" color="$moonstone600">Last 7 days</Text>
      </CardHeader>
      
      <CardBody>
        <VStack space="sm">
          {/* Hour Labels */}
          <HStack space="xs" pl="$8">
            <Text size="xs" color="$moonstone500">6PM</Text>
            <Box flex={1} />
            <Text size="xs" color="$moonstone500">12AM</Text>
            <Box flex={1} />
            <Text size="xs" color="$moonstone500">6AM</Text>
            <Box flex={1} />
            <Text size="xs" color="$moonstone500">12PM</Text>
          </HStack>
          
          {/* Heatmap Grid */}
          <VStack space="xs">
            {days.map((day, dayIndex) => (
              <HStack key={day} space="xs" alignItems="center">
                <Text size="xs" color="$moonstone600" w="$6" textAlign="right">
                  {day}
                </Text>
                <HStack space="$0.5" flex={1}>
                  {hours.map((hour) => {
                    // Simulate sleep data
                    const sleepData = weekData?.[dayIndex]?.[hour] || 'none';
                    return (
                      <Box
                        key={`${dayIndex}-${hour}`}
                        flex={1}
                        h="$3"
                        bg={getIntensityColor(sleepData)}
                        borderRadius="$xs"
                      />
                    );
                  })}
                </HStack>
              </HStack>
            ))}
          </VStack>
          
          {/* Legend */}
          <HStack justifyContent="center" space="md" mt="$4">
            <HStack space="xs" alignItems="center">
              <Box w="$2" h="$2" bg="$moonstone100" borderRadius="$xs" />
              <Text size="xs" color="$moonstone600">Awake</Text>
            </HStack>
            <HStack space="xs" alignItems="center">
              <Box w="$2" h="$2" bg="$lightSleep300" borderRadius="$xs" />
              <Text size="xs" color="$moonstone600">Light</Text>
            </HStack>
            <HStack space="xs" alignItems="center">
              <Box w="$2" h="$2" bg="$deepSleep500" borderRadius="$xs" />
              <Text size="xs" color="$moonstone600">Deep</Text>
            </HStack>
            <HStack space="xs" alignItems="center">
              <Box w="$2" h="$2" bg="$rem400" borderRadius="$xs" />
              <Text size="xs" color="$moonstone600">REM</Text>
            </HStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// ===== SLEEP METRICS DASHBOARD =====

export const SleepMetricsDashboard = ({ metrics }) => {
  const metricCards = [
    {
      key: 'efficiency',
      title: 'Sleep Efficiency',
      value: `${metrics.efficiency}%`,
      trend: metrics.efficiencyTrend,
      color: '$deepSleep500',
      icon: '⚡',
      description: 'Time asleep vs time in bed'
    },
    {
      key: 'latency',
      title: 'Sleep Latency',
      value: `${metrics.latency}m`,
      trend: metrics.latencyTrend,
      color: '$lightSleep500',
      icon: '⏱️',
      description: 'Time to fall asleep'
    },
    {
      key: 'consistency',
      title: 'Sleep Consistency',
      value: `${metrics.consistency}%`,
      trend: metrics.consistencyTrend,
      color: '$rem500',
      icon: '📊',
      description: 'Bedtime regularity'
    },
    {
      key: 'quality',
      title: 'Sleep Quality',
      value: `${metrics.quality}/10`,
      trend: metrics.qualityTrend,
      color: '$lunar500',
      icon: '⭐',
      description: 'Subjective sleep rating'
    },
  ];

  return (
    <VStack space="md">
      {/* Metrics Grid */}
      <VStack space="md">
        <HStack space="md">
          <MetricCard metric={metricCards[0]} />
          <MetricCard metric={metricCards[1]} />
        </HStack>
        <HStack space="md">
          <MetricCard metric={metricCards[2]} />
          <MetricCard metric={metricCards[3]} />
        </HStack>
      </VStack>
      
      {/* Progress Summary */}
      <Card bg="$white" borderRadius="$xl" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={12}>
        <CardHeader>
          <Heading size="lg" color="$moonstone900">Weekly Progress</Heading>
        </CardHeader>
        <CardBody>
          <VStack space="md">
            {metricCards.map((metric) => (
              <VStack key={metric.key} space="xs">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center">
                    <Text size="md">{metric.icon}</Text>
                    <Text size="sm" color="$moonstone700">{metric.title}</Text>
                  </HStack>
                  <Text size="sm" fontWeight="$semibold" color={metric.color}>
                    {metric.value}
                  </Text>
                </HStack>
                
                <Progress 
                  value={parseInt(metric.value)} 
                  bg="$moonstone200" 
                  h="$1.5"
                  borderRadius="$full"
                >
                  <ProgressFilledTrack bg={metric.color} borderRadius="$full" />
                </Progress>
              </VStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

// Individual Metric Card Component
const MetricCard = ({ metric }) => {
  const isPositiveTrend = metric.trend?.direction === 'up' && metric.trend?.isGood;
  const trendColor = isPositiveTrend ? '$green500' : '$red500';

  return (
    <Card flex={1} bg="$white" borderRadius="$xl" shadowColor="$moonstone300" shadowOpacity={0.08} shadowRadius={8}>
      <CardBody>
        <VStack space="sm">
          <HStack justifyContent="space-between" alignItems="flex-start">
            <Text size="lg">{metric.icon}</Text>
            {metric.trend && (
              <Text size="xs" color={trendColor} fontWeight="$semibold">
                {metric.trend.direction === 'up' ? '↗' : '↘'} {metric.trend.value}
              </Text>
            )}
          </HStack>
          
          <VStack space="xs">
            <Heading size="2xl" color={metric.color} fontFamily="$mono">
              {metric.value}
            </Heading>
            <Text size="xs" color="$moonstone600" textTransform="uppercase" letterSpacing="$sm">
              {metric.title}
            </Text>
            <Text size="xs" color="$moonstone500" numberOfLines={2}>
              {metric.description}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export {
  SleepScoreVisualization,
  SleepStagesBreakdown,
  SleepTrendChart,
  SleepPatternHeatmap,
  SleepMetricsDashboard,
};