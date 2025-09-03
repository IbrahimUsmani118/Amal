import { settingsManager, ThemeSettings } from '@/services/settingsManager';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeSettings: ThemeSettings;
  setTheme: (theme: 'light' | 'dark') => void;
  updateThemeSetting: (key: keyof ThemeSettings, value: any) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  themeSettings: {
    mode: 'auto',
    primaryColor: '#ffd700',
    fontSize: 'medium',
    fontFamily: 'Amiri',
  },
  setTheme: () => {},
  updateThemeSetting: async () => {},
});

export { ThemeContext };

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    mode: 'auto',
    primaryColor: '#ffd700',
    fontSize: 'medium',
    fontFamily: 'Amiri',
  });

  // Load theme settings on mount
  useEffect(() => {
    loadThemeSettings();
  }, []);

  // Apply theme when settings change
  useEffect(() => {
    if (themeSettings.mode === 'auto') {
      // Auto theme - you could implement system theme detection here
      setThemeState('dark'); // Default to dark for now
    } else {
      setThemeState(themeSettings.mode);
    }
  }, [themeSettings.mode]);

  const loadThemeSettings = async () => {
    try {
      const settings = await settingsManager.loadSettings('theme');
      setThemeSettings(settings);
    } catch (error) {
      console.error('Error loading theme settings:', error);
      // Use default settings on error
    }
  };

  const setTheme = async (newTheme: 'light' | 'dark') => {
    try {
      const updatedSettings = { ...themeSettings, mode: newTheme };
      await settingsManager.saveSettings('theme', updatedSettings);
      setThemeSettings(updatedSettings);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const updateThemeSetting = async (key: keyof ThemeSettings, value: any) => {
    try {
      const updatedSettings = { ...themeSettings, [key]: value };
      await settingsManager.saveSettings('theme', updatedSettings);
      setThemeSettings(updatedSettings);
      
      // If updating mode, also update current theme
      if (key === 'mode') {
        setThemeState(value);
      }
    } catch (error) {
      console.error('Error updating theme setting:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeSettings,
        setTheme,
        updateThemeSetting,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
