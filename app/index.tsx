import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeContainer, ThemedView, ThemedText, LoadingState } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { onboardingService } from '@/lib/database/onboardingService';

export default function IndexScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = await onboardingService.getOnboardingStatus();
        
        // Add small delay for smooth loading experience
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (hasCompletedOnboarding) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        // If there's an error checking status, assume first time user
        router.replace('/onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  if (isLoading) {
    return (
      <SafeContainer style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.content}>
          {/* App Logo */}
          <ThemedView style={styles.logoContainer}>
            <ThemedText style={styles.logo}>🌙</ThemedText>
            <ThemedText type="title" style={styles.appName}>
              Lunar
            </ThemedText>
          </ThemedView>
          
          {/* Loading indicator */}
          <LoadingState 
            message="Preparing your sleep experience..."
            size="large"
          />
        </ThemedView>
      </SafeContainer>
    );
  }

  // This shouldn't render since we redirect, but just in case
  return (
    <SafeContainer style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        <ThemedText type="body">Loading...</ThemedText>
      </ThemedView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
});