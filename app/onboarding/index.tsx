import { OnboardingPager } from '@/components/ui';
import { router } from 'expo-router';
import React from 'react';

// Import screen components - we'll create these as pure components
import AiChatScreen from './screens/AiChatScreen';
import AIPreferencesScreenSimple from './screens/AIPreferencesScreenSimple';
import BenefitsScreen from './screens/BenefitsScreen';
import ChronotypeScreen from './screens/ChronotypeScreen';
import CompletionScreen from './screens/CompletionScreen';
import LifestyleScreenSimple from './screens/LifestyleScreenSimple';
import NotificationsScreen from './screens/NotificationsScreen';
import PermissionsScreen from './screens/PermissionsScreen';
import SleepGoalsScreen from './screens/SleepGoalsScreen';
import SleepHabitsScreenSimple from './screens/SleepHabitsScreenSimple';
import WelcomeScreen from './screens/WelcomeScreen';

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
    <SleepHabitsScreenSimple key="sleep-habits" />,
    <LifestyleScreenSimple key="lifestyle" />,
    <ChronotypeScreen key="chronotype" />,
    <AIPreferencesScreenSimple key="ai-preferences" />,
    <NotificationsScreen key="notifications" />,
    <AiChatScreen key="ai-chat" />,
    <CompletionScreen key="completion" onComplete={handleComplete} />,
  ];

  return (
    <OnboardingPager
      totalSteps={10}
      onComplete={handleComplete}
    >
      {screens}
    </OnboardingPager>
  );
}