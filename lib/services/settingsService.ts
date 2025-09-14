import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_SETTINGS } from '@/types/settings';

const SETTINGS_KEY = 'lunar_app_settings';

class SettingsService {
  private cachedSettings: AppSettings | null = null;

  async loadSettings(): Promise<AppSettings> {
    try {
      if (this.cachedSettings) {
        return this.cachedSettings;
      }

      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!stored) {
        this.cachedSettings = { ...DEFAULT_SETTINGS };
        await this.saveSettings(this.cachedSettings);
        return this.cachedSettings;
      }

      const parsed = JSON.parse(stored);
      this.cachedSettings = this.migrateSettings(parsed);
      return this.cachedSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.cachedSettings = { ...DEFAULT_SETTINGS };
      return this.cachedSettings;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      this.cachedSettings = settings;
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Не удалось сохранить настройки');
    }
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.loadSettings();
    const updated = this.deepMerge(current, updates);
    await this.saveSettings(updated);
    return updated;
  }

  async resetSettings(): Promise<AppSettings> {
    const fresh = { ...DEFAULT_SETTINGS };
    await this.saveSettings(fresh);
    return fresh;
  }

  async clearCache(): Promise<void> {
    this.cachedSettings = null;
  }

  private migrateSettings(stored: any): AppSettings {
    // Handle version migrations here
    if (!stored.version || stored.version !== DEFAULT_SETTINGS.version) {
      // Migrate from older versions
      return {
        ...DEFAULT_SETTINGS,
        ...stored,
        version: DEFAULT_SETTINGS.version,
      };
    }
    return stored;
  }

  private deepMerge(target: any, source: any): any {
    if (!source || typeof source !== 'object') return target;

    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  // Helper methods for specific settings
  async updateTheme(mode: 'light' | 'dark' | 'auto'): Promise<void> {
    await this.updateSettings({
      theme: { ...this.cachedSettings?.theme || DEFAULT_SETTINGS.theme, mode }
    });
  }

  async updateAISettings(aiSettings: Partial<AppSettings['ai']>): Promise<void> {
    await this.updateSettings({
      ai: { ...this.cachedSettings?.ai || DEFAULT_SETTINGS.ai, ...aiSettings }
    });
  }

  async updateLanguageSettings(language: Partial<AppSettings['language']>): Promise<void> {
    await this.updateSettings({
      language: { ...this.cachedSettings?.language || DEFAULT_SETTINGS.language, ...language }
    });
  }

  async clearAIHistory(): Promise<void> {
    // This would integrate with the AI service to clear chat history
    console.log('Clearing AI history...');
    // TODO: Integrate with actual AI service
  }

  async exportSettings(): Promise<string> {
    const settings = await this.loadSettings();
    return JSON.stringify(settings, null, 2);
  }

  async importSettings(settingsData: string): Promise<void> {
    try {
      const imported = JSON.parse(settingsData);
      const migrated = this.migrateSettings(imported);
      await this.saveSettings(migrated);
    } catch (error) {
      throw new Error('Неверный формат файла настроек');
    }
  }
}

export const settingsService = new SettingsService();