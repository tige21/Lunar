/**
 * Component Compositions for Lunar Sleep Analysis App
 * 
 * This file defines how gluestack-ui components are composed together
 * to create the main screen layouts and UI patterns.
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Heading,
  Button,
  ButtonText,
  Progress,
  ProgressFilledTrack,
  Badge,
  BadgeText,
  ScrollView,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Pressable,
  Toast,
  ToastTitle,
  ToastDescription,
  Tabs,
  TabsTab,
  TabsTabList,
  TabsTabPanels,
  TabsTabPanel,
} from '@gluestack-ui/themed';

// ===== DASHBOARD SCREEN COMPOSITION =====

export const DashboardScreen = () => {
  return (
    <ScrollView flex={1} bg="$moonstone50">
      <VStack space="lg" p="$4">
        
        {/* Header Section */}
        <VStack space="sm">
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text size="sm" color="$moonstone600">Good morning</Text>
              <Heading size="2xl" color="$moonstone900">Sleep Dashboard</Heading>
            </VStack>
            <Pressable>
              <Box p="$2" borderRadius="$full" bg="$lunar100">
                {/* Profile Avatar */}
                <Text size="lg">🌙</Text>
              </Box>
            </Pressable>
          </HStack>
        </VStack>

        {/* Sleep Score Card */}
        <Card size="lg" bg="$white" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={8}>
          <CardHeader>
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="lg" color="$moonstone900">Sleep Score</Heading>
              <Badge action="success" borderRadius="$full">
                <BadgeText>Excellent</BadgeText>
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack space="md">
              <HStack alignItems="end" space="sm">
                <Heading size="5xl" color="$deepSleep500">87</Heading>
                <Text size="lg" color="$moonstone600" pb="$1">/100</Text>
              </HStack>
              <Progress value={87} bg="$moonstone200" h="$2">
                <ProgressFilledTrack bg="$deepSleep500" />
              </Progress>
              <Text size="sm" color="$moonstone600">
                +5 points from yesterday
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Sleep Stages Overview */}
        <Card bg="$white" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={8}>
          <CardHeader>
            <Heading size="lg" color="$moonstone900">Last Night</Heading>
          </CardHeader>
          <CardBody>
            <VStack space="md">
              <HStack justifyContent="space-between">
                <Text color="$moonstone600">Total Sleep</Text>
                <Text fontWeight="$semibold" color="$moonstone900">7h 23m</Text>
              </HStack>
              
              {/* Sleep Stages Breakdown */}
              <VStack space="sm">
                <SleepStageRow 
                  stage="Deep Sleep" 
                  duration="1h 45m" 
                  percentage={24} 
                  color="$deepSleep500"
                />
                <SleepStageRow 
                  stage="Light Sleep" 
                  duration="4h 12m" 
                  percentage={57} 
                  color="$lightSleep500"
                />
                <SleepStageRow 
                  stage="REM Sleep" 
                  duration="1h 18m" 
                  percentage={17} 
                  color="$rem500"
                />
                <SleepStageRow 
                  stage="Awake" 
                  duration="8m" 
                  percentage={2} 
                  color="$awake500"
                />
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <HStack space="md">
          <Button flex={1} action="secondary" borderColor="$lunar200">
            <ButtonText color="$lunar600">View Trends</ButtonText>
          </Button>
          <Button flex={1} bg="$lunar500">
            <ButtonText color="$white">AI Insights</ButtonText>
          </Button>
        </HStack>

        {/* Sleep Chart Card */}
        <Card bg="$white" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={8}>
          <CardHeader>
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="lg" color="$moonstone900">Sleep Pattern</Heading>
              <Badge action="muted" borderRadius="$md">
                <BadgeText>7 days</BadgeText>
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box h="$40" bg="$moonstone50" borderRadius="$lg" justifyContent="center" alignItems="center">
              <Text color="$moonstone600">Sleep Chart Visualization</Text>
            </Box>
          </CardBody>
        </Card>

      </VStack>
    </ScrollView>
  );
};

// Sleep Stage Row Component
const SleepStageRow = ({ stage, duration, percentage, color }) => {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack space="sm" alignItems="center" flex={1}>
        <Box w="$3" h="$3" bg={color} borderRadius="$sm" />
        <Text size="sm" color="$moonstone700">{stage}</Text>
      </HStack>
      <HStack space="md" alignItems="center">
        <Text size="sm" fontWeight="$medium" color="$moonstone900">{duration}</Text>
        <Text size="sm" color="$moonstone600" minWidth="$10" textAlign="right">
          {percentage}%
        </Text>
      </HStack>
    </HStack>
  );
};

// ===== ANALYTICS SCREEN COMPOSITION =====

export const AnalyticsScreen = () => {
  return (
    <ScrollView flex={1} bg="$moonstone50">
      <VStack space="lg" p="$4">
        
        {/* Header */}
        <VStack space="sm">
          <Heading size="2xl" color="$moonstone900">Analytics</Heading>
          <Text size="sm" color="$moonstone600">Detailed insights into your sleep patterns</Text>
        </VStack>

        {/* Time Period Selector */}
        <Tabs defaultValue="week" bg="$white" borderRadius="$lg" p="$1">
          <TabsTabList>
            <TabsTab value="week" flex={1}>
              <Text size="sm">Week</Text>
            </TabsTab>
            <TabsTab value="month" flex={1}>
              <Text size="sm">Month</Text>
            </TabsTab>
            <TabsTab value="year" flex={1}>
              <Text size="sm">Year</Text>
            </TabsTab>
          </TabsTabList>
        </Tabs>

        {/* Key Metrics Grid */}
        <VStack space="md">
          <HStack space="md">
            <MetricCard 
              title="Avg Sleep Score"
              value="84"
              change="+3"
              color="$deepSleep500"
            />
            <MetricCard 
              title="Avg Duration"
              value="7h 15m"
              change="+12m"
              color="$lightSleep500"
            />
          </HStack>
          
          <HStack space="md">
            <MetricCard 
              title="Sleep Efficiency"
              value="89%"
              change="+2%"
              color="$rem500"
            />
            <MetricCard 
              title="Bedtime Consistency"
              value="92%"
              change="-1%"
              color="$lunar500"
            />
          </HStack>
        </VStack>

        {/* Charts Section */}
        <VStack space="md">
          <ChartCard title="Sleep Score Trend" />
          <ChartCard title="Sleep Stages Distribution" />
          <ChartCard title="Bedtime vs Wake Time" />
        </VStack>

      </VStack>
    </ScrollView>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, color }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <Card flex={1} bg="$white" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={8}>
      <CardBody>
        <VStack space="sm">
          <Text size="xs" color="$moonstone600" textTransform="uppercase" letterSpacing="$sm">
            {title}
          </Text>
          <Heading size="2xl" color={color}>{value}</Heading>
          <HStack alignItems="center" space="xs">
            <Text size="xs" color={isPositive ? "$green500" : "$red500"}>
              {change}
            </Text>
            <Text size="xs" color="$moonstone500">vs last week</Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Chart Card Component
const ChartCard = ({ title }) => {
  return (
    <Card bg="$white" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={8}>
      <CardHeader>
        <Heading size="lg" color="$moonstone900">{title}</Heading>
      </CardHeader>
      <CardBody>
        <Box h="$48" bg="$moonstone50" borderRadius="$lg" justifyContent="center" alignItems="center">
          <Text color="$moonstone600">{title} Chart</Text>
        </Box>
      </CardBody>
    </Card>
  );
};

// ===== AI CHAT INTERFACE COMPOSITION =====

export const AIChatScreen = () => {
  return (
    <VStack flex={1} bg="$moonstone50">
      
      {/* Header */}
      <Box bg="$white" pt="$12" pb="$4" px="$4" borderBottomWidth="$1" borderBottomColor="$moonstone200">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Heading size="xl" color="$moonstone900">AI Sleep Coach</Heading>
            <Text size="sm" color="$moonstone600">Your personal sleep assistant</Text>
          </VStack>
          <Box p="$2" bg="$lunar100" borderRadius="$full">
            <Text size="lg">🤖</Text>
          </Box>
        </HStack>
      </Box>

      {/* Chat Messages */}
      <ScrollView flex={1} p="$4">
        <VStack space="md">
          
          {/* AI Message */}
          <HStack space="sm" alignItems="flex-start">
            <Box p="$2" bg="$lunar500" borderRadius="$full" mt="$1">
              <Text size="sm" color="$white">AI</Text>
            </Box>
            <Box flex={1} bg="$white" p="$3" borderRadius="$lg" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={4}>
              <Text color="$moonstone800" size="sm">
                Good morning! I noticed your sleep score improved to 87 last night. Your deep sleep increased by 20 minutes. Would you like some insights on what might have contributed to this improvement?
              </Text>
            </Box>
          </HStack>

          {/* User Message */}
          <HStack space="sm" alignItems="flex-start" justifyContent="flex-end">
            <Box flex={1} bg="$lunar500" p="$3" borderRadius="$lg" maxWidth="80%">
              <Text color="$white" size="sm">
                Yes, that would be great! What factors helped?
              </Text>
            </Box>
          </HStack>

          {/* AI Response with Suggestions */}
          <HStack space="sm" alignItems="flex-start">
            <Box p="$2" bg="$lunar500" borderRadius="$full" mt="$1">
              <Text size="sm" color="$white">AI</Text>
            </Box>
            <VStack flex={1} space="sm">
              <Box bg="$white" p="$3" borderRadius="$lg" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={4}>
                <Text color="$moonstone800" size="sm">
                  Based on your data, here are the key factors that improved your sleep:
                </Text>
              </Box>
              <VStack space="xs">
                <SuggestionCard 
                  icon="🛏️"
                  title="Earlier Bedtime"
                  description="You went to bed 30 minutes earlier than usual"
                />
                <SuggestionCard 
                  icon="🌡️"
                  title="Optimal Temperature"
                  description="Room temperature was in the ideal 65-68°F range"
                />
                <SuggestionCard 
                  icon="📱"
                  title="Reduced Screen Time"
                  description="No device usage 1 hour before bed"
                />
              </VStack>
            </VStack>
          </HStack>

        </VStack>
      </ScrollView>

      {/* Chat Input */}
      <Box bg="$white" p="$4" borderTopWidth="$1" borderTopColor="$moonstone200">
        <HStack space="sm" alignItems="center">
          <Box flex={1} bg="$moonstone100" borderRadius="$full" px="$4" py="$3">
            <Text color="$moonstone600" size="sm">Ask about your sleep...</Text>
          </Box>
          <Button size="sm" bg="$lunar500" borderRadius="$full" p="$3">
            <Text color="$white">→</Text>
          </Button>
        </HStack>
      </Box>

    </VStack>
  );
};

// Suggestion Card Component
const SuggestionCard = ({ icon, title, description }) => {
  return (
    <HStack space="sm" bg="$white" p="$3" borderRadius="$md" borderWidth="$1" borderColor="$moonstone200">
      <Text size="lg">{icon}</Text>
      <VStack flex={1} space="xs">
        <Text fontWeight="$medium" color="$moonstone900" size="sm">{title}</Text>
        <Text color="$moonstone600" size="xs">{description}</Text>
      </VStack>
    </HStack>
  );
};

// ===== SETTINGS SCREEN COMPOSITION =====

export const SettingsScreen = () => {
  return (
    <ScrollView flex={1} bg="$moonstone50">
      <VStack space="lg" p="$4">
        
        {/* Header */}
        <VStack space="sm">
          <Heading size="2xl" color="$moonstone900">Settings</Heading>
          <Text size="sm" color="$moonstone600">Customize your sleep tracking experience</Text>
        </VStack>

        {/* Profile Section */}
        <Card bg="$white" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={8}>
          <CardHeader>
            <Heading size="lg" color="$moonstone900">Profile</Heading>
          </CardHeader>
          <CardBody>
            <VStack space="md">
              <HStack space="md" alignItems="center">
                <Box w="$16" h="$16" bg="$lunar100" borderRadius="$full" justifyContent="center" alignItems="center">
                  <Text size="2xl">🌙</Text>
                </Box>
                <VStack flex={1}>
                  <Text fontWeight="$semibold" color="$moonstone900">Sleep Explorer</Text>
                  <Text size="sm" color="$moonstone600">Member since Jan 2024</Text>
                </VStack>
                <Button action="secondary" size="sm">
                  <ButtonText>Edit</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Sleep Goals */}
        <Card bg="$white" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={8}>
          <CardHeader>
            <Heading size="lg" color="$moonstone900">Sleep Goals</Heading>
          </CardHeader>
          <CardBody>
            <VStack space="md">
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText>Target Sleep Duration</FormControlLabelText>
                </FormControlLabel>
                <HStack justifyContent="space-between" alignItems="center" mt="$2">
                  <Text color="$moonstone600">8 hours</Text>
                  <Button action="secondary" size="sm">
                    <ButtonText>Adjust</ButtonText>
                  </Button>
                </HStack>
              </FormControl>
              
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText>Bedtime Reminder</FormControlLabelText>
                </FormControlLabel>
                <HStack justifyContent="space-between" alignItems="center" mt="$2">
                  <Text color="$moonstone600">10:30 PM</Text>
                  <Button action="secondary" size="sm">
                    <ButtonText>Change</ButtonText>
                  </Button>
                </HStack>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card bg="$white" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={8}>
          <CardHeader>
            <Heading size="lg" color="$moonstone900">Notifications</Heading>
          </CardHeader>
          <CardBody>
            <VStack space="md">
              <SettingsToggle title="Sleep Reminders" enabled={true} />
              <SettingsToggle title="Weekly Reports" enabled={true} />
              <SettingsToggle title="AI Insights" enabled={false} />
            </VStack>
          </CardBody>
        </Card>

        {/* Data & Privacy */}
        <Card bg="$white" shadowColor="$moonstone300" shadowOpacity={0.1} shadowRadius={8}>
          <CardHeader>
            <Heading size="lg" color="$moonstone900">Data & Privacy</Heading>
          </CardHeader>
          <CardBody>
            <VStack space="md">
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color="$moonstone700">Export Sleep Data</Text>
                  <Text color="$moonstone600">→</Text>
                </HStack>
              </Pressable>
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color="$moonstone700">Privacy Policy</Text>
                  <Text color="$moonstone600">→</Text>
                </HStack>
              </Pressable>
            </VStack>
          </CardBody>
        </Card>

      </VStack>
    </ScrollView>
  );
};

// Settings Toggle Component
const SettingsToggle = ({ title, enabled }) => {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Text color="$moonstone700">{title}</Text>
      <Box 
        w="$12" 
        h="$6" 
        bg={enabled ? "$lunar500" : "$moonstone300"} 
        borderRadius="$full" 
        justifyContent="center"
        alignItems={enabled ? "flex-end" : "flex-start"}
        px="$1"
      >
        <Box w="$5" h="$5" bg="$white" borderRadius="$full" />
      </Box>
    </HStack>
  );
};

export { DashboardScreen, AnalyticsScreen, AIChatScreen, SettingsScreen };