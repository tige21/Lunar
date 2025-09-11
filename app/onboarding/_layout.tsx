import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  
  const handleScreenTransition = () => {
    // Add subtle haptic feedback on screen transitions
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        animationDuration: 300,
        animationTypeForReplace: 'push',
      }}
      screenListeners={{
        beforeRemove: handleScreenTransition,
      }}
    >
      {/* Main onboarding flow with swipe navigation */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Onboarding',
          animation: 'fade',
          gestureEnabled: false, // Disable back gesture to prevent exiting onboarding
        }} 
      />
    </Stack>
  );
}