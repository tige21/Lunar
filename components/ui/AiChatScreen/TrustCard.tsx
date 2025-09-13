import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, BodyText, CaptionText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { TrustCardProps } from './types';
import { TRANSLATIONS } from './messages';

const TrustCard = React.memo<TrustCardProps>(({ language, colorScheme }) => {
  const t = TRANSLATIONS[language];

  return (
    <ThemedView style={[styles.trustCard, {
      backgroundColor: colorScheme === 'dark' 
        ? 'rgba(45, 27, 105, 0.4)' 
        : 'rgba(248, 250, 252, 0.8)',
      borderColor: colorScheme === 'dark'
        ? 'rgba(139, 92, 246, 0.3)'
        : 'rgba(91, 33, 182, 0.2)'
    }]}>
      <ThemedView style={styles.trustHeader}>
        <IconSymbol size={20} color={Colors.semantic.success} name="shield.checkered" />
        <BodyText style={styles.trustTitle}>
          {t.privacyFirstAI}
        </BodyText>
      </ThemedView>
      
      <CaptionText style={styles.trustDescription}>
        {t.privacyDesc}
      </CaptionText>
    </ThemedView>
  );
});

TrustCard.displayName = 'TrustCard';

const styles = StyleSheet.create({
  trustCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trustTitle: {
    fontWeight: '600',
  },
  trustDescription: {
    opacity: 0.7,
    lineHeight: 18,
  },
});

export default TrustCard;