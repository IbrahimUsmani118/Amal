// Settings Manager Service for storing user preferences
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeSettings = {
  mode: 'auto',
  primaryColor: '#ffd700',
  fontSize: 'medium',
  fontFamily: 'Amiri',
};

export const NotificationSettings = {
  prayerReminders: true,
  reminderTime: 5,
  adhanNotifications: true,
  notificationSound: true,
  vibration: true,
};

export const AudioSettings = {
  autoPlay: false,
  audioQuality: 'high',
  backgroundAudio: false,
  voiceRecognition: true,
};

export const LocationSettings = {
  autoDetectLocation: true,
  qiblaCompass: true,
  defaultLocation: {
    city: 'Mecca',
    country: 'Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
  },
  locationAccuracy: 'high',
};

export const StorageSettings = {
  offlineMode: false,
  cacheSize: 100, // MB
  autoDownload: false,
  downloadQuality: 'medium',
};

export const SecuritySettings = {
  biometricLock: false,
  appLock: false,
  hideContent: false,
  encryptionLevel: 'basic',
};

export class SettingsManager {
  static instance;
  storage;

  constructor() {
    this.storage = AsyncStorage;
  }

  static getInstance() {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  // Get default settings
  getDefaultSettings() {
    return {
      theme: ThemeSettings,
      notifications: NotificationSettings,
      audio: AudioSettings,
      location: LocationSettings,
      storage: StorageSettings,
      security: SecuritySettings,
    };
  }

  // Save settings for a specific category
  async saveSettings(category, settings) {
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
  async loadSettings(category) {
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
  async loadAllSettings() {
    try {
      const defaultSettings = this.getDefaultSettings();
      const loadedSettings = {};
      
      // Load each category
      for (const category of Object.keys(defaultSettings)) {
        loadedSettings[category] = await this.loadSettings(category);
      }
      
      return { ...defaultSettings, ...loadedSettings };
    } catch (error) {
      console.error('Error loading all settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Save all settings
  async saveAllSettings(settings) {
    try {
      const promises = Object.entries(settings).map(([category, categorySettings]) =>
        this.saveSettings(category, categorySettings)
      );
      await Promise.all(promises);
      console.log('All settings saved successfully');
    } catch (error) {
      console.error('Error saving all settings:', error);
      throw new Error('Failed to save all settings');
    }
  }

  // Reset settings to defaults
  async resetToDefaults() {
    try {
      const defaultSettings = this.getDefaultSettings();
      await this.saveAllSettings(defaultSettings);
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw new Error('Failed to reset settings');
    }
  }

  // Export settings
  async exportSettings() {
    try {
      const settings = await this.loadAllSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw new Error('Failed to export settings');
    }
  }

  // Import settings from JSON
  async importSettings(settingsJson) {
    try {
      const settings = JSON.parse(settingsJson);
      await this.saveAllSettings(settings);
      console.log('Settings imported successfully');
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Failed to import settings');
    }
  }

  // Clear all settings
  async clearAllSettings() {
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
  async getSetting(category, key) {
    try {
      const categorySettings = await this.loadSettings(category);
      return categorySettings[key];
    } catch (error) {
      console.error(`Error getting setting ${category}.${key}:`, error);
      const defaultSettings = this.getDefaultSettings();
      return defaultSettings[category][key];
    }
  }

  // Set a specific setting value
  async setSetting(category, key, value) {
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