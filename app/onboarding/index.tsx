import { OnboardingPager } from '@/components/ui';
import { router } from 'expo-router';
import React from 'react';

// Import screen components - we'll create these as pure components
import BenefitsScreen from './screens/BenefitsScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SleepGoalsScreen from './screens/SleepGoalsScreen';
import ChronotypeScreen from './screens/ChronotypeScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import AiChatScreen from './screens/AiChatScreen';
import CompletionScreen from './screens/CompletionScreen';
import PermissionsScreen from './screens/PermissionsScreen';

export default function OnboardingIndex() {
  const handleComplete = () => {
    // Navigate to main app
    router.replace('/(tabs)');
  };

  const screens = [
    <WelcomeScreen key="welcome" />,
    <BenefitsScreen key="benefits" />,
    <PermissionsScreen key="permissions" />,
    <SleepGoalsScreen key="sleep-goals" />,
    <ChronotypeScreen key="chronotype" />,
    // <NotificationsScreen key="notifications" />,
    <AiChatScreen key="ai-chat" />,
    <CompletionScreen key="completion" onComplete={handleComplete} />,
  ];

  return (
    <OnboardingPager
      totalSteps={8}
      onComplete={handleComplete}
    >
      {screens}
    </OnboardingPager>
  );
}