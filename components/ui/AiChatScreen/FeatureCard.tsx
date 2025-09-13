import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ThemedView, BodyText, CaptionText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FeatureCardProps } from './types';

const { width } = Dimensions.get('window');

const FeatureCard = React.memo<FeatureCardProps>(({ 
  icon, 
  iconColor, 
  title, 
  description, 
  colorScheme 
}) => {
  return (
    <ThemedView style={[styles.featureCard, {
      backgroundColor: colorScheme === 'dark' 
        ? 'rgba(30, 27, 60, 0.6)' 
        : 'rgba(255, 255, 255, 0.8)',
      borderColor: colorScheme === 'dark'
        ? 'rgba(139, 92, 246, 0.2)'
        : 'rgba(226, 232, 240, 0.6)'
    }]}>
      <IconSymbol size={24} color={iconColor} name={icon as any} />
      <BodyText style={styles.featureTitle}>
        {title}
      </BodyText>
      <CaptionText style={styles.featureDescription}>
        {description}
      </CaptionText>
    </ThemedView>
  );
});

FeatureCard.displayName = 'FeatureCard';

const styles = StyleSheet.create({
  featureCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 120,
  },
  featureTitle: {
    marginTop: 8,
    marginBottom: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureDescription: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 16,
  },
});

export default FeatureCard;