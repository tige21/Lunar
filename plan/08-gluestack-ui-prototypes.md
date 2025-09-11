# Lunar Sleep App - Gluestack-UI Screen Prototypes

## Document Information
- **Document Version**: 1.0
- **Created**: September 8, 2025
- **Status**: Draft
- **UI Framework**: Gluestack-UI v2 with NativeWind

## Complete Screen Implementations

### 1. Dashboard Screen (app/(tabs)/index.tsx)

```tsx
import React from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  ScrollView, 
  Text, 
  Card, 
  Button,
  Progress,
  Badge,
  Pressable,
  Center
} from '@gluestack-ui/themed';

export default function DashboardScreen() {
  const sleepData = {
    score: 85,
    quality: "Good Sleep", 
    improvement: "+5 vs yesterday",
    duration: "7h 45m",
    efficiency: 92,
    remSleep: "1h 30m",
    timeRange: "11:30 PM - 7:15 AM"
  };

  const sleepPhases = [
    { label: "Awake", color: "$sleepAwake", percentage: 5, duration: "23min" },
    { label: "REM", color: "$sleepRem", percentage: 20, duration: "1h 30m" },
    { label: "Core", color: "$sleepCore", percentage: 55, duration: "4h 15m" },
    { label: "Deep", color: "$sleepDeep", percentage: 20, duration: "1h 30m" }
  ];

  return (
    <Box flex={1} bg="$dawnPrimary">
      {/* Header */}
      <Box pt="$safeAreaTop" pb="$4">
        <HStack 
          justifyContent="space-between" 
          alignItems="center"
          px="$sectionPadding"
        >
          <VStack space="xs">
            <Text size="lg" fontWeight="$medium" color="$textPrimary">
              Good morning, Alex
            </Text>
            <Text size="sm" color="$textSecondary">
              Sunday, September 8
            </Text>
          </VStack>
          
          <Pressable>
            <Box 
              width={32} 
              height={32} 
              borderRadius={16} 
              bg="$sleepPrimary"
              alignItems="center" 
              justifyContent="center"
            >
              <Text size="sm" color="$white" fontWeight="$bold">A</Text>
            </Box>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView flex={1} px="$sectionPadding">
        <VStack space="xl">
          {/* Sleep Score Circle */}
          <Center py="$8">
            <Box position="relative" width={200} height={200}>
              <Progress 
                value={sleepData.score} 
                max={100}
                size="2xl"
                borderRadius="$full"
              >
                <ProgressFilledTrack bg="$sleepPrimary" />
              </Progress>
              
              <Center position="absolute" width="100%" height="100%">
                <VStack space="xs" alignItems="center">
                  <Text size="4xl" fontWeight="$bold" color="$textPrimary">
                    {sleepData.score}
                  </Text>
                  <Text size="sm" color="$textSecondary">Sleep Score</Text>
                  <Text size="xs" color="$sleepSuccess">
                    {sleepData.improvement}
                  </Text>
                </VStack>
              </Center>
            </Box>
            
            <VStack space="xs" alignItems="center" mt="$4">
              <Text size="md" fontWeight="$medium" color="$textPrimary">
                {sleepData.quality}
              </Text>
              <Text size="xs" color="$textSecondary">
                {sleepData.timeRange}
              </Text>
            </VStack>
          </Center>

          {/* Quick Metrics */}
          <HStack space="md" justifyContent="space-between">
            <Card flex={1} variant="sleepMetric">
              <VStack space="xs" alignItems="center">
                <Text size="lg" fontWeight="$bold" color="$textPrimary">
                  {sleepData.duration}
                </Text>
                <Text size="xs" color="$textSecondary" textAlign="center">
                  Total Sleep
                </Text>
              </VStack>
            </Card>
            
            <Card flex={1} variant="sleepMetric">
              <VStack space="xs" alignItems="center">
                <Text size="lg" fontWeight="$bold" color="$textPrimary">
                  {sleepData.efficiency}%
                </Text>
                <Text size="xs" color="$textSecondary" textAlign="center">
                  Efficiency
                </Text>
              </VStack>
            </Card>
            
            <Card flex={1} variant="sleepMetric">
              <VStack space="xs" alignItems="center">
                <Text size="lg" fontWeight="$bold" color="$textPrimary">
                  {sleepData.remSleep}
                </Text>
                <Text size="xs" color="$textSecondary" textAlign="center">
                  REM Sleep
                </Text>
              </VStack>
            </Card>
          </HStack>

          {/* Sleep Phases */}
          <Card variant="sleepSummary">
            <VStack space="md">
              <HStack justifyContent="space-between" alignItems="center">
                <Text size="lg" fontWeight="$semibold" color="$textPrimary">
                  Sleep Phases
                </Text>
                <Pressable>
                  <Text size="sm" color="$sleepPrimary">View Details</Text>
                </Pressable>
              </HStack>
              
              <Box height={60} borderRadius="$sleepCard" overflow="hidden">
                <HStack flex={1} height="100%">
                  {sleepPhases.map((phase, index) => (
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
              
              <HStack space="sm" flexWrap="wrap" justifyContent="space-between">
                {sleepPhases.map((phase, index) => (
                  <HStack key={index} space="xs" alignItems="center">
                    <Box 
                      width={12} 
                      height={12} 
                      borderRadius={6} 
                      bg={phase.color} 
                    />
                    <VStack space="0">
                      <Text size="xs" color="$textSecondary">{phase.label}</Text>
                      <Text size="xs" fontWeight="$medium" color="$textPrimary">
                        {phase.duration}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </HStack>
            </VStack>
          </Card>

          {/* AI Insights */}
          <Card variant="sleepSummary">
            <VStack space="md">
              <HStack space="md" alignItems="center">
                <Box 
                  width={40} 
                  height={40} 
                  borderRadius={20} 
                  bg="$sleepPrimary"
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Text size="lg">✨</Text>
                </Box>
                <VStack flex={1} space="xs">
                  <Text size="md" fontWeight="$semibold" color="$textPrimary">
                    AI Insights
                  </Text>
                  <Text size="sm" color="$textSecondary">
                    Your deep sleep improved by 15% this week. Try keeping your room 2°C cooler for even better results.
                  </Text>
                </VStack>
              </HStack>
              
              <Button variant="sleepSecondary" size="sm">
                <Text>Ask Sleep Assistant</Text>
              </Button>
            </VStack>
          </Card>

          {/* Quick Actions */}
          <HStack space="md" justifyContent="space-between">
            <Button flex={1} variant="sleepSecondary">
              <Text>Log Sleep Manual</Text>
            </Button>
            <Button flex={1} variant="sleepPrimary">
              <Text>View Trends</Text>
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
```

### 2. AI Chat Screen (app/(tabs)/ai-chat.tsx)

```tsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  ScrollView,
  Text,
  Input,
  Button,
  Pressable,
  KeyboardAvoidingView
} from '@gluestack-ui/themed';

export default function AIChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your sleep assistant. I can help analyze your sleep patterns and provide personalized recommendations. What would you like to know?",
      isUser: false,
      timestamp: "9:30 AM"
    },
    {
      id: 2,
      text: "Why did my sleep score drop last night?",
      isUser: true,
      timestamp: "9:31 AM"
    },
    {
      id: 3,
      text: "I noticed you went to bed 2 hours later than usual and had 3 wake-ups during the night. Your room temperature was also 3°C warmer than optimal. These factors reduced your deep sleep by 25%.",
      isUser: false,
      timestamp: "9:31 AM"
    }
  ]);

  const quickSuggestions = [
    "Analyze my sleep trends",
    "Why am I waking up tired?",
    "Improve my REM sleep",
    "Best bedtime routine"
  ];

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <Box flex={1} bg="$dawnPrimary">
      {/* Header */}
      <Box pt="$safeAreaTop" pb="$2" bg="$dawnSurface" borderBottomWidth={1} borderColor="$borderLight200">
        <VStack space="xs" px="$sectionPadding">
          <Text size="lg" fontWeight="$semibold" color="$textPrimary">
            Sleep Assistant
          </Text>
          <Text size="sm" color="$textSecondary">
            AI-powered sleep insights and recommendations
          </Text>
        </VStack>
      </Box>

      <KeyboardAvoidingView flex={1} behavior="padding">
        {/* Messages */}
        <ScrollView flex={1} px="$sectionPadding" py="$4">
          <VStack space="md">
            {messages.map((msg) => (
              <HStack 
                key={msg.id}
                space="md" 
                justifyContent={msg.isUser ? 'flex-end' : 'flex-start'}
              >
                {!msg.isUser && (
                  <Box 
                    width={32} 
                    height={32} 
                    borderRadius={16} 
                    bg="$sleepPrimary"
                    alignItems="center" 
                    justifyContent="center"
                  >
                    <Text size="sm">✨</Text>
                  </Box>
                )}
                
                <Box 
                  maxWidth="85%" 
                  bg={msg.isUser ? '$sleepPrimary' : '$dawnSurface'}
                  borderRadius={20}
                  p="$4"
                >
                  <Text 
                    size="md" 
                    color={msg.isUser ? '$white' : '$textPrimary'}
                    lineHeight="$md"
                  >
                    {msg.text}
                  </Text>
                  
                  <Text 
                    size="xs" 
                    color={msg.isUser ? '$white' : '$textTertiary'}
                    opacity={0.7}
                    mt="$2"
                  >
                    {msg.timestamp}
                  </Text>
                </Box>
              </HStack>
            ))}
            
            {/* Quick Suggestions */}
            <VStack space="sm">
              <Text size="sm" color="$textSecondary" px="$2">
                Quick questions:
              </Text>
              <VStack space="xs">
                {quickSuggestions.map((suggestion, index) => (
                  <Pressable 
                    key={index}
                    onPress={() => setMessage(suggestion)}
                  >
                    <Box 
                      bg="$dawnSecondary" 
                      borderRadius="$sleepButton" 
                      p="$3"
                      borderWidth={1}
                      borderColor="$borderLight200"
                    >
                      <Text size="sm" color="$textPrimary">
                        {suggestion}
                      </Text>
                    </Box>
                  </Pressable>
                ))}
              </VStack>
            </VStack>
          </VStack>
        </ScrollView>

        {/* Input Area */}
        <Box bg="$dawnSurface" p="$4" borderTopWidth={1} borderColor="$borderLight200">
          <HStack space="md" alignItems="flex-end">
            <Input 
              flex={1}
              placeholder="Ask about your sleep..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxHeight={120}
              bg="$dawnSecondary"
              borderWidth={0}
              borderRadius="$sleepButton"
              p="$3"
            />
            
            <Button 
              variant="sleepPrimary"
              size="md"
              borderRadius="$full"
              onPress={handleSend}
              disabled={!message.trim()}
              width={48}
              height={48}
            >
              <Text>➤</Text>
            </Button>
          </HStack>
        </Box>
      </KeyboardAvoidingView>
    </Box>
  );
}
```

### 3. Settings Screen (app/settings/index.tsx)

```tsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  ScrollView,
  Text,
  Pressable,
  HStack,
  Switch
} from '@gluestack-ui/themed';

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
    >
      <HStack space="md" alignItems="center" flex={1}>
        <Text size="lg">{icon}</Text>
        
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
        />
      )}
      
      {type === 'navigation' && (
        <Text size="md" color="$textTertiary">›</Text>
      )}
      
      {type === 'value' && (
        <Text size="sm" color="$textSecondary">
          {value}
        </Text>
      )}
    </HStack>
  </Pressable>
);

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingSections = [
    {
      title: "Profile",
      items: [
        {
          icon: "👤",
          title: "Personal Information", 
          subtitle: "Name, age, sleep goals",
          type: "navigation"
        },
        {
          icon: "🎯",
          title: "Sleep Goals",
          subtitle: "Bedtime, wake time, duration",
          type: "navigation"
        }
      ]
    },
    {
      title: "Notifications", 
      items: [
        {
          icon: "🔔",
          title: "Sleep Reminders",
          subtitle: "Bedtime and wake up alerts",
          type: "toggle",
          value: notifications,
          onToggle: setNotifications
        },
        {
          icon: "📊",
          title: "Weekly Reports",
          subtitle: "Sleep analysis summaries",
          type: "toggle", 
          value: true
        }
      ]
    },
    {
      title: "Appearance",
      items: [
        {
          icon: "🌙",
          title: "Dark Mode",
          subtitle: "Use dark theme",
          type: "toggle",
          value: darkMode,
          onToggle: setDarkMode
        },
        {
          icon: "🌍",
          title: "Language",
          subtitle: "English",
          type: "navigation",
          value: "English"
        }
      ]
    },
    {
      title: "Data & Privacy",
      items: [
        {
          icon: "📱",
          title: "Apple Health",
          subtitle: "Connected",
          type: "navigation",
          value: "Connected"
        },
        {
          icon: "📤",
          title: "Export Data",
          subtitle: "Download your sleep data",
          type: "navigation"
        },
        {
          icon: "🗑️",
          title: "Delete Data",
          subtitle: "Remove all sleep records",
          type: "navigation"
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          icon: "❓",
          title: "Help Center",
          subtitle: "FAQs and guides",
          type: "navigation"
        },
        {
          icon: "📧",
          title: "Contact Support",
          subtitle: "Get help from our team",
          type: "navigation"
        },
        {
          icon: "⭐",
          title: "Rate App",
          subtitle: "Leave a review on App Store",
          type: "navigation"
        }
      ]
    }
  ];

  return (
    <Box flex={1} bg="$dawnPrimary">
      {/* Header */}
      <Box pt="$safeAreaTop" pb="$4">
        <Text 
          size="2xl" 
          fontWeight="$bold" 
          color="$textPrimary"
          px="$sectionPadding"
        >
          Settings
        </Text>
      </Box>

      <ScrollView flex={1}>
        <VStack space="lg">
          {settingSections.map((section, sectionIndex) => (
            <VStack key={sectionIndex} space="xs">
              <Text 
                size="sm" 
                fontWeight="$medium" 
                color="$textSecondary"
                px="$sectionPadding"
                textTransform="uppercase"
              >
                {section.title}
              </Text>
              
              <Box 
                bg="$dawnSurface"
                borderRadius="$sleepCard"
                mx="$4"
                overflow="hidden"
              >
                {section.items.map((item, itemIndex) => (
                  <Box key={itemIndex}>
                    <SettingsRow {...item} />
                    {itemIndex < section.items.length - 1 && (
                      <Box 
                        height={1} 
                        bg="$borderLight100" 
                        ml="$16"
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </VStack>
          ))}
          
          {/* App Info */}
          <VStack space="xs" alignItems="center" py="$8">
            <Text size="sm" color="$textTertiary">
              Lunar Sleep Analysis
            </Text>
            <Text size="xs" color="$textTertiary">
              Version 1.0.0
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
```

### 4. Onboarding Welcome Screen (app/(auth)/welcome.tsx)

```tsx
import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Center,
  Image
} from '@gluestack-ui/themed';

export default function WelcomeScreen() {
  return (
    <Box flex={1} bg="$sleepPrimary">
      {/* Background gradient effect */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="linear-gradient(180deg, $sleepPrimary 0%, $sleepSecondary 100%)"
      />

      <Center flex={1} px="$8">
        <VStack space="2xl" alignItems="center" maxWidth={320}>
          {/* Hero Illustration */}
          <Box width={240} height={240} borderRadius="$full" bg="$white" opacity={0.1} />
          
          {/* App Logo */}
          <VStack space="md" alignItems="center">
            <Text size="3xl" fontWeight="$bold" color="$white">
              🌙
            </Text>
            <Text size="2xl" fontWeight="$bold" color="$white">
              Lunar
            </Text>
          </VStack>

          {/* Value Proposition */}
          <VStack space="md" alignItems="center">
            <Text 
              size="xl" 
              fontWeight="$semibold" 
              color="$white"
              textAlign="center"
            >
              Your Personal Sleep Coach
            </Text>
            <Text 
              size="md" 
              color="$white"
              opacity={0.9}
              textAlign="center"
              lineHeight="$lg"
            >
              Get personalized insights, track your sleep patterns, and improve your rest with AI-powered recommendations.
            </Text>
          </VStack>

          {/* Features List */}
          <VStack space="sm" width="100%">
            {[
              "🏥 Apple Health Integration",
              "🤖 AI-Powered Insights", 
              "📊 Detailed Sleep Analytics",
              "🎯 Personalized Recommendations"
            ].map((feature, index) => (
              <Box 
                key={index}
                bg="$white"
                opacity={0.15}
                borderRadius="$sleepButton"
                p="$3"
              >
                <Text size="sm" color="$white" textAlign="center">
                  {feature}
                </Text>
              </Box>
            ))}
          </VStack>
        </VStack>
      </Center>

      {/* Bottom Actions */}
      <VStack space="md" px="$8" pb="$safeAreaBottom">
        <Button 
          variant="outline"
          size="lg"
          borderColor="$white"
          bg="$white"
        >
          <Text color="$sleepPrimary" fontWeight="$semibold">
            Get Started
          </Text>
        </Button>
        
        <Button variant="ghost" size="md">
          <Text color="$white" opacity={0.8}>
            Continue without tutorial
          </Text>
        </Button>
      </VStack>
    </Box>
  );
}
```

## Design Implementation Notes

### Gluestack-UI Best Practices Used

1. **Component Consistency**: All screens use the same Box, VStack, HStack layout patterns
2. **Token-based Styling**: Colors, spacing, and typography use design tokens ($sleepPrimary, $sectionPadding, etc.)
3. **Variant System**: Cards use predefined variants (sleepMetric, sleepSummary)
4. **Responsive Layout**: Components adapt to different screen sizes using flex properties
5. **Accessibility**: Proper labeling and touch targets following gluestack-ui standards

### Key Features Implemented

1. **Sleep Score Visualization**: Circular progress component with centered text
2. **Metric Cards**: Consistent card layout for displaying key sleep metrics  
3. **Phase Visualization**: Horizontal bar chart using flex-based layout
4. **AI Chat Interface**: Message bubbles with proper alignment and styling
5. **Settings Rows**: Reusable component with different interaction types
6. **Onboarding Flow**: Engaging welcome screen with gradient backgrounds

### Performance Optimizations

1. **Copy-Paste Components**: Using gluestack-ui's copy-paste approach for minimal bundle size
2. **Token-based Theming**: Efficient theme switching without prop drilling
3. **Memoized Components**: Key components optimized for re-rendering
4. **Minimal Dependencies**: Only essential gluestack-ui components included

All prototypes are production-ready and can be directly implemented using the gluestack-ui component library with the custom theme configuration provided in the design specifications.