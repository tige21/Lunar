import { HeroText, TitleText } from '@/components/ui';
import React from 'react';
import { StyleSheet } from 'react-native';
import { TRANSLATIONS } from './messages';
import { AiChatHeaderProps } from './types';

const AiChatHeader = React.memo<AiChatHeaderProps>(({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <>
      <HeroText style={styles.title}>
        {t.meetLuna}
      </HeroText>
      
      <TitleText style={styles.subtitle}>
        {t.aiSleepAssistant}
      </TitleText>
      
     
    </>
  );
});

AiChatHeader.displayName = 'AiChatHeader';

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 32,
  },
  subtitle: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
    maxWidth: '90%',
  },
});

export default AiChatHeader;