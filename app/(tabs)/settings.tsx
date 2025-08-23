import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [isLightMode, setIsLightMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const theme = isLightMode ? 'light' : 'dark';

  const toggleTheme = () => setIsLightMode(!isLightMode);

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          type: 'toggle',
          value: isLightMode,
          onValueChange: toggleTheme,
        },
        {
          icon: 'text-outline',
          label: 'Font Size',
          type: 'select',
          value: 'Medium',
        },
        {
          icon: 'language-outline',
          label: 'Language',
          type: 'select',
          value: 'English',
        },
        {
          icon: 'color-palette-outline',
          label: 'Theme Color',
          type: 'select',
          value: 'Gold',
        },
      ],
    },
    {
      title: 'Quran Settings',
      items: [
        {
          icon: 'book-outline',
          label: 'Default Translation',
          type: 'select',
          value: 'English',
        },
        {
          icon: 'text-outline',
          label: 'Arabic Font',
          type: 'select',
          value: 'Amiri',
        },
        {
          icon: 'eye-outline',
          label: 'Show Verse Numbers',
          type: 'toggle',
          value: true,
        },
        {
          icon: 'translate-outline',
          label: 'Show Translation',
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Prayer Reminders',
          type: 'toggle',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: 'time-outline',
          label: 'Reminder Time',
          type: 'select',
          value: '15 minutes before',
        },
        {
          icon: 'alarm-outline',
          label: 'Adhan Notifications',
          type: 'toggle',
          value: true,
        },
        {
          icon: 'volume-high-outline',
          label: 'Notification Sound',
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      title: 'Audio & Voice',
      items: [
        {
          icon: 'play-outline',
          label: 'Auto-play Audio',
          type: 'toggle',
          value: autoPlay,
          onValueChange: setAutoPlay,
        },
        {
          icon: 'mic-outline',
          label: 'Voice Recognition',
          type: 'toggle',
          value: true,
        },
        {
          icon: 'volume-high-outline',
          label: 'Audio Quality',
          type: 'select',
          value: 'High',
        },
        {
          icon: 'headset-outline',
          label: 'Background Audio',
          type: 'toggle',
          value: false,
        },
      ],
    },
    {
      title: 'Location & Prayer',
      items: [
        {
          icon: 'location-outline',
          label: 'Auto-detect Location',
          type: 'toggle',
          value: true,
        },
        {
          icon: 'compass-outline',
          label: 'Qibla Compass',
          type: 'toggle',
          value: true,
        },
        {
          icon: 'time-outline',
          label: 'Prayer Time Method',
          type: 'select',
          value: 'Muslim World League',
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          icon: 'cloud-download-outline',
          label: 'Offline Mode',
          type: 'toggle',
          value: offlineMode,
          onValueChange: setOfflineMode,
        },
        {
          icon: 'trash-outline',
          label: 'Clear Cache',
          type: 'button',
          onPress: () => Alert.alert('Cache Cleared', 'App cache has been cleared.'),
        },
        {
          icon: 'download-outline',
          label: 'Download Quran',
          type: 'button',
          onPress: () => Alert.alert('Download', 'Quran download feature coming soon.'),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: 'shield-outline',
          label: 'Biometric Lock',
          type: 'toggle',
          value: false,
        },
        {
          icon: 'lock-closed-outline',
          label: 'App Lock',
          type: 'toggle',
          value: false,
        },
        {
          icon: 'eye-off-outline',
          label: 'Hide Content',
          type: 'toggle',
          value: false,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number) => {
    return (
      <View key={index} style={[styles.settingItem, styles[`${theme}SettingItem`]]}>
        <View style={styles.settingLeft}>
          <Ionicons 
            name={item.icon as any} 
            size={24} 
            color={theme === 'light' ? '#3d3d3d' : '#ffd700'} 
          />
          <Text style={[styles.settingLabel, styles[`${theme}SettingLabel`]]}>
            {item.label}
          </Text>
        </View>
        
        <View style={styles.settingRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#767577', true: '#ffd700' }}
              thumbColor={item.value ? '#1a1a2e' : '#f4f3f4'}
            />
          )}
          {item.type === 'select' && (
            <View style={styles.selectValue}>
              <Text style={[styles.selectValueText, styles[`${theme}SelectValueText`]]}>
                {item.value}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme === 'light' ? '#6a6a6a' : '#b0b0b0'} 
              />
            </View>
          )}
          {item.type === 'button' && (
            <TouchableOpacity onPress={item.onPress}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, styles[theme]]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
      
      {/* Header */}
      <View style={[styles.header, styles[`${theme}Header`]]}>
        <Text style={[styles.title, styles[`${theme}Title`]]}>Settings</Text>
        <Text style={[styles.subtitle, styles[`${theme}Subtitle`]]}>
          Customize your experience
        </Text>
      </View>

      {/* Theme Toggle */}
      <TouchableOpacity style={[styles.themeToggle, styles[`${theme}ThemeToggle`]]} onPress={toggleTheme}>
        <Ionicons 
          name={theme === 'light' ? 'moon' : 'sunny'} 
          size={24} 
          color={theme === 'light' ? '#3d3d3d' : '#ffd700'} 
        />
      </TouchableOpacity>

      {/* User Profile */}
      <View style={[styles.profileCard, styles[`${theme}ProfileCard`]]}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#ffd700" />
          </View>
          <View style={styles.profileText}>
            <Text style={[styles.profileName, styles[`${theme}ProfileName`]]}>
              {user?.email || 'User'}
            </Text>
            <Text style={[styles.profileEmail, styles[`${theme}ProfileEmail`]]}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editProfileButton}>
          <Ionicons name="pencil" size={20} color="#ffd700" />
        </TouchableOpacity>
      </View>

      {/* Settings Sections */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, styles[`${theme}SectionTitle`]]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, styles[`${theme}SectionContent`]]}>
              {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
            </View>
          </View>
        ))}



        {/* App Info */}
        <View style={[styles.appInfo, styles[`${theme}AppInfo`]]}>
          <Text style={[styles.appInfoText, styles[`${theme}AppInfoText`]]}>
            App Version: 1.0.0
          </Text>
          <Text style={[styles.appInfoText, styles[`${theme}AppInfoText`]]}>
            © 2024 Amal Quran App
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  dark: {
    backgroundColor: '#0a0a0a',
  },
  light: {
    backgroundColor: '#f8f6f0',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 30,
  },
  darkHeader: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightHeader: {
    borderBottomColor: 'rgba(60, 60, 60, 0.15)',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
    color: '#ffd700',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#b0b0b0',
  },
  darkTitle: {
    color: '#ffd700',
  },
  lightTitle: {
    color: '#3d3d3d',
  },
  darkSubtitle: {
    color: '#b0b0b0',
  },
  lightSubtitle: {
    color: '#6a6a6a',
  },
  themeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 12,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkThemeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightThemeToggle: {
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  darkProfileCard: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightProfileCard: {
    backgroundColor: '#fefdfb',
    borderColor: 'rgba(60, 60, 60, 0.1)',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  darkProfileName: {
    color: '#e8e8e8',
  },
  lightProfileName: {
    color: '#3d3d3d',
  },
  profileEmail: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  darkProfileEmail: {
    color: '#b0b0b0',
  },
  lightProfileEmail: {
    color: '#6a6a6a',
  },
  editProfileButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    paddingLeft: 5,
  },
  darkSectionTitle: {
    color: '#ffd700',
  },
  lightSectionTitle: {
    color: '#3d3d3d',
  },
  sectionContent: {
    borderRadius: 15,
    borderWidth: 1,
    overflow: 'hidden',
  },
  darkSectionContent: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightSectionContent: {
    backgroundColor: '#fefdfb',
    borderColor: 'rgba(60, 60, 60, 0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  darkSettingItem: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightSettingItem: {
    borderBottomColor: 'rgba(60, 60, 60, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 15,
  },
  darkSettingLabel: {
    color: '#e8e8e8',
  },
  lightSettingLabel: {
    color: '#3d3d3d',
  },
  settingRight: {
    alignItems: 'center',
  },
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValueText: {
    fontSize: 14,
    marginRight: 5,
  },
  darkSelectValueText: {
    color: '#b0b0b0',
  },
  lightSelectValueText: {
    color: '#6a6a6a',
  },
  buttonText: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 30,
  },
  darkAppInfo: {
    backgroundColor: 'transparent',
  },
  lightAppInfo: {
    backgroundColor: 'transparent',
  },
  appInfoText: {
    fontSize: 12,
    marginBottom: 5,
  },
  darkAppInfoText: {
    color: '#b0b0b0',
  },
  lightAppInfoText: {
    color: '#6a6a6a',
  },
});
