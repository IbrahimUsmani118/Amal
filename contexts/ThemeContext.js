import { settingsManager } from '@/services/settingsManager.js';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
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

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');
  const [themeSettings, setThemeSettings] = useState({
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

  const setTheme = async (newTheme) => {
    try {
      const updatedSettings = { ...themeSettings, mode: newTheme };
      await settingsManager.saveSettings('theme', updatedSettings);
      setThemeSettings(updatedSettings);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const updateThemeSetting = async (key, value) => {
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