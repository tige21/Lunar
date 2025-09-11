import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../gluestack-ui-config';

interface LunarThemeProviderProps {
  children: React.ReactNode;
}

export function LunarThemeProvider({ children }: LunarThemeProviderProps) {
  return (
    <GluestackUIProvider config={config}>
      {children}
    </GluestackUIProvider>
  );
}

export default LunarThemeProvider;