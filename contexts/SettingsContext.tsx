import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppSettings, SettingsContextType, DEFAULT_SETTINGS } from '@/types/settings';
import { settingsService } from '@/lib/services/settingsService';

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialSettings();
  }, []);

  const loadInitialSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedSettings = await settingsService.loadSettings();
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Не удалось загрузить настройки');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      setError(null);
      const updatedSettings = await settingsService.updateSettings(updates);
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Не удалось сохранить настройки');
      throw err;
    }
  };

  const resetSettings = async () => {
    try {
      setError(null);
      const freshSettings = await settingsService.resetSettings();
      setSettings(freshSettings);
    } catch (err) {
      console.error('Failed to reset settings:', err);
      setError('Не удалось сбросить настройки');
      throw err;
    }
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    error,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Hook for theme-specific settings
export function useTheme() {
  const { settings, updateSettings } = useSettings();

  const setTheme = async (mode: 'light' | 'dark' | 'auto') => {
    await updateSettings({
      theme: { ...settings.theme, mode }
    });
  };

  const toggleSystemFollowing = async () => {
    await updateSettings({
      theme: { ...settings.theme, followSystem: !settings.theme.followSystem }
    });
  };

  return {
    theme: settings.theme,
    setTheme,
    toggleSystemFollowing,
  };
}

// Hook for AI settings
export function useAISettings() {
  const { settings, updateSettings } = useSettings();

  const updateAI = async (updates: Partial<AppSettings['ai']>) => {
    await updateSettings({
      ai: { ...settings.ai, ...updates }
    });
  };

  const toggleAI = async () => {
    await updateAI({ enabled: !settings.ai.enabled });
  };

  const clearHistory = async () => {
    await settingsService.clearAIHistory();
  };

  return {
    ai: settings.ai,
    updateAI,
    toggleAI,
    clearHistory,
  };
}

// Hook for language settings
export function useLanguageSettings() {
  const { settings, updateSettings } = useSettings();

  const setInterfaceLanguage = async (language: 'ru' | 'en' | 'auto') => {
    await updateSettings({
      language: { ...settings.language, interface: language }
    });
  };

  const setAILanguage = async (language: 'ru' | 'en' | 'auto') => {
    await updateSettings({
      language: { ...settings.language, ai: language }
    });
  };

  return {
    language: settings.language,
    setInterfaceLanguage,
    setAILanguage,
  };
}