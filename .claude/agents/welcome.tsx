import React, { useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import AuthTrustBadge from '@/components/AuthTrustBadge'

export default function WelcomeScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  const features = [
    {
      icon: 'wallet-outline' as const,
      title: t('welcome.features.expense_tracking.title', 'Smart Expense Tracking'),
      description: t('welcome.features.expense_tracking.description', 'Track your expenses with AI-powered categorization')
    },
    {
      icon: 'analytics-outline' as const,
      title: t('welcome.features.analytics.title', 'Advanced Analytics'),
      description: t('welcome.features.analytics.description', 'Get insights into your spending patterns')
    },
    {
      icon: 'sync-outline' as const,
      title: t('welcome.features.sync.title', 'Cloud Sync'),
      description: t('welcome.features.sync.description', 'Access your data on all devices')
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: t('welcome.features.security.title', 'Bank-Level Security'),
      description: t('welcome.features.security.description', 'Your data is protected with enterprise-grade encryption')
    }
  ]

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#007AFF', '#0056CC']}
          className="px-6 pt-8 pb-16 rounded-b-3xl"
        >
          <Animated.View 
            entering={FadeInUp.delay(300).duration(800)}
            className="items-center"
          >
            <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-6">
              <Ionicons name="wallet" size={40} color="white" />
            </View>
            
            <Text className="text-3xl font-bold text-white text-center mb-3">
              {t('welcome.hero.title', 'Welcome to WalletWatch')}
            </Text>
            
            <Text className="text-lg text-white/80 text-center leading-6">
              {t('welcome.hero.subtitle', 'Take control of your finances with smart expense tracking and powerful insights')}
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Features Section */}
        <View className="px-6 py-8">
          <Animated.Text 
            entering={FadeInDown.delay(500).duration(800)}
            className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8"
          >
            {t('welcome.features.title', 'Everything you need to manage your money')}
          </Animated.Text>

          <View className="space-y-6">
            {features.map((feature, index) => (
              <Animated.View
                key={feature.icon}
                entering={FadeInDown.delay(600 + index * 100).duration(800)}
                className="flex-row items-start space-x-4"
              >
                <View className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl items-center justify-center">
                  <Ionicons 
                    name={feature.icon} 
                    size={24} 
                    color="#007AFF" 
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400 leading-5">
                    {feature.description}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Trust Badges */}
        <Animated.View 
          entering={FadeInDown.delay(1000).duration(800)}
          className="px-6 py-4"
        >
          <AuthTrustBadge 
            variant="bank-security"
            size="small"
          />
        </Animated.View>

        {/* Social Proof */}
        <Animated.View 
          entering={FadeInDown.delay(1100).duration(800)}
          className="px-6 py-6 bg-gray-50 dark:bg-gray-800/50 mx-6 rounded-2xl"
        >
          <View className="flex-row items-center justify-center space-x-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">50K+</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {t('welcome.social_proof.users', 'Users')}
              </Text>
            </View>
            <View className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">4.9</Text>
              <View className="flex-row items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star}
                    name="star" 
                    size={12} 
                    color="#FFD700" 
                  />
                ))}
              </View>
            </View>
            <View className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {t('welcome.social_proof.uptime', 'Uptime')}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* CTA Section */}
      <Animated.View 
        entering={FadeInDown.delay(1200).duration(800)}
        className="px-6 py-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      >
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signin')}
          className="bg-blue-600 py-4 px-8 rounded-2xl mb-3 active:scale-95"
          style={{ transform: [{ scale: 1 }] }}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {t('welcome.cta.get_started', 'Get Started')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/task-screen')} // Guest mode - will redirect based on auth state
          className="py-3"
        >
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            {t('welcome.cta.guest_mode', 'Continue as Guest')}
          </Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4 leading-4">
          {t('welcome.legal.terms', 'By continuing, you agree to our Terms of Service and Privacy Policy')}
        </Text>
      </Animated.View>
    </SafeAreaView>
  )
}