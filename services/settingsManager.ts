// Settings Manager Service for storing user preferences
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
}

export interface NotificationSettings {
  prayerReminders: boolean;
  reminderTime: number; // minutes before prayer
  adhanNotifications: boolean;
  notificationSound: boolean;
  vibration: boolean;
}

export interface AudioSettings {
  autoPlay: boolean;
  audioQuality: 'low' | 'medium' | 'high';
  backgroundAudio: boolean;
  voiceRecognition: boolean;
}

export interface LocationSettings {
  autoDetectLocation: boolean;
  qiblaCompass: boolean;
  defaultLocation?: {
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  locationAccuracy: 'high' | 'medium' | 'low';
}

export interface StorageSettings {
  offlineMode: boolean;
  cacheSize: number;
  autoDownload: boolean;
  downloadQuality: 'low' | 'medium' | 'high';
}

export interface SecuritySettings {
  biometricLock: boolean;
  appLock: boolean;
  hideContent: boolean;
  encryptionLevel: 'basic' | 'advanced';
}

export interface UserPreferences {
  theme: ThemeSettings;
  notifications: NotificationSettings;
  audio: AudioSettings;
  location: LocationSettings;
  storage: StorageSettings;
  security: SecuritySettings;
}

class SettingsManager {
  private static instance: SettingsManager;
  private storage: typeof AsyncStorage;

  constructor() {
    this.storage = AsyncStorage;
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  // Get default settings
  getDefaultSettings(): UserPreferences {
    return {
      theme: {
        mode: 'auto',
        primaryColor: '#ffd700',
        fontSize: 'medium',
        fontFamily: 'Amiri',
      },
      notifications: {
        prayerReminders: true,
        reminderTime: 15,
        adhanNotifications: true,
        notificationSound: true,
        vibration: true,
      },
      audio: {
        autoPlay: false,
        audioQuality: 'high',
        backgroundAudio: false,
        voiceRecognition: false,
      },
      location: {
        autoDetectLocation: true,
        qiblaCompass: true,
        defaultLocation: {
          city: 'Mecca',
          country: 'Saudi Arabia',
          latitude: 21.4225,
          longitude: 39.8262,
        },
        locationAccuracy: 'high',
      },
      storage: {
        offlineMode: false,
        cacheSize: 100, // MB
        autoDownload: false,
        downloadQuality: 'medium',
      },
      security: {
        biometricLock: false,
        appLock: false,
        hideContent: false,
        encryptionLevel: 'basic',
      },
    };
  }

  // Save settings for a specific category
  async saveSettings(category: keyof UserPreferences, settings: any): Promise<void> {
    try {
      const key = `settings_${category}`;
      await this.storage.setItem(key, JSON.stringify(settings));
      console.log(`Settings saved for ${category}:`, settings);
    } catch (error) {
      console.error(`Error saving settings for ${category}:`, error);
      throw new Error(`Failed to save ${category} settings`);
    }
  }

  // Load settings for a specific category
  async loadSettings(category: keyof UserPreferences): Promise<any> {
    try {
      const key = `settings_${category}`;
      const data = await this.storage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      // Return default settings if none saved
      return this.getDefaultSettings()[category];
    } catch (error) {
      console.error(`Error loading settings for ${category}:`, error);
      // Return default settings on error
      return this.getDefaultSettings()[category];
    }
  }

  // Load all settings
  async loadAllSettings(): Promise<UserPreferences> {
    try {
      const defaultSettings = this.getDefaultSettings();
      const loadedSettings: Partial<UserPreferences> = {};

      // Load each category
      for (const category of Object.keys(defaultSettings) as Array<keyof UserPreferences>) {
        loadedSettings[category] = await this.loadSettings(category);
      }

      return { ...defaultSettings, ...loadedSettings };
    } catch (error) {
      console.error('Error loading all settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Save all settings
  async saveAllSettings(settings: UserPreferences): Promise<void> {
    try {
      const promises = Object.entries(settings).map(([category, categorySettings]) =>
        this.saveSettings(category as keyof UserPreferences, categorySettings)
      );
      await Promise.all(promises);
      console.log('All settings saved successfully');
    } catch (error) {
      console.error('Error saving all settings:', error);
      throw new Error('Failed to save all settings');
    }
  }

  // Reset settings to defaults
  async resetToDefaults(): Promise<void> {
    try {
      const defaultSettings = this.getDefaultSettings();
      await this.saveAllSettings(defaultSettings);
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw new Error('Failed to reset settings');
    }
  }

  // Export settings as JSON
  async exportSettings(): Promise<string> {
    try {
      const settings = await this.loadAllSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw new Error('Failed to export settings');
    }
  }

  // Import settings from JSON
  async importSettings(settingsJson: string): Promise<void> {
    try {
      const settings = JSON.parse(settingsJson) as UserPreferences;
      await this.saveAllSettings(settings);
      console.log('Settings imported successfully');
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Failed to import settings');
    }
  }

  // Clear all settings
  async clearAllSettings(): Promise<void> {
    try {
      const keys = await this.storage.getAllKeys();
      const settingsKeys = keys.filter(key => key.startsWith('settings_'));
      await this.storage.multiRemove(settingsKeys);
      console.log('All settings cleared');
    } catch (error) {
      console.error('Error clearing settings:', error);
      throw new Error('Failed to clear settings');
    }
  }

  // Get a specific setting value
  async getSetting<T>(category: keyof UserPreferences, key: string): Promise<T> {
    try {
      const categorySettings = await this.loadSettings(category);
      return (categorySettings as any)[key];
    } catch (error) {
      console.error(`Error getting setting ${category}.${key}:`, error);
      const defaultSettings = this.getDefaultSettings();
      return (defaultSettings[category] as any)[key];
    }
  }

  // Set a specific setting value
  async setSetting(category: keyof UserPreferences, key: string, value: any): Promise<void> {
    try {
      const categorySettings = await this.loadSettings(category);
      categorySettings[key] = value;
      await this.saveSettings(category, categorySettings);
    } catch (error) {
      console.error(`Error setting ${category}.${key}:`, error);
      throw new Error(`Failed to set ${category}.${key}`);
    }
  }
}

export const settingsManager = SettingsManager.getInstance();
export default SettingsManager;
