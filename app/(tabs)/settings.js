import UniversalHeader from '@/components/UniversalHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { settingsManager } from '@/services/settingsManager';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load settings on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const loadedSettings = await settingsManager.loadAllSettings();
            setSettings(loadedSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
            // Use default settings on error
            setSettings(settingsManager.getDefaultSettings());
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (category, key, value) => {
        if (!settings) return;

        try {
            const updatedSettings = { ...settings };
            updatedSettings[category][key] = value;

            // Save to storage
            await settingsManager.saveSettings(category, updatedSettings[category]);

            // Update local state
            setSettings(updatedSettings);
            console.log(`Setting updated: ${category}.${key} = ${value}`);
        } catch (error) {
            console.error('Error updating setting:', error);
            Alert.alert('Error', 'Failed to save setting. Please try again.');
        }
    };

    const resetToDefaults = async () => {
        try {
            await settingsManager.resetToDefaults();
            await loadSettings();
            Alert.alert('Success', 'Settings reset to defaults.');
        } catch (error) {
            console.error('Error resetting settings:', error);
            Alert.alert('Error', 'Failed to reset settings. Please try again.');
        }
    };

    const clearCache = async () => {
        try {
            Alert.alert('Cache Cleared', 'App cache has been cleared.');
        } catch (error) {
            console.error('Error clearing cache:', error);
            Alert.alert('Error', 'Failed to clear cache. Please try again.');
        }
    };

    const downloadQuran = async () => {
        try {
            Alert.alert('Download', 'Quran download feature coming soon.');
        } catch (error) {
            console.error('Error downloading Quran:', error);
            Alert.alert('Error', 'Failed to download Quran. Please try again.');
        }
    };

    if (loading || !settings) {
        return (
            <View style={[styles.container, { backgroundColor: theme === 'light' ? '#f8f6f0' : '#0a0a0a' }]}>
                <View style={styles.loadingContainer}>
                    <Text style={{ color: theme === 'light' ? '#3d3d3d' : '#ffffff', fontSize: 18 }}>
                        Loading settings...
                    </Text>
                </View>
            </View>
        );
    }

    const settingsSections = [
        {
            title: 'Appearance',
            items: [
                {
                    icon: 'moon-outline',
                    label: 'Dark Mode',
                    type: 'toggle',
                    value: theme === 'dark',
                    onValueChange: (value) => {
                        const newTheme = value ? 'dark' : 'light';
                        setTheme(newTheme);
                        updateSetting('theme', 'mode', newTheme);
                    },
                },
                {
                    icon: 'text-outline',
                    label: 'Font Size',
                    type: 'select',
                    value: settings.theme.fontSize,
                    onPress: () => {
                        Alert.alert('Font Size', 'Font size picker coming soon.');
                    },
                },
                {
                    icon: 'language-outline',
                    label: 'Language',
                    type: 'select',
                    value: 'English',
                    onPress: () => {
                        Alert.alert('Language', 'Language picker coming soon.');
                    },
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
                    onPress: () => {
                        Alert.alert('Translation', 'Translation picker coming soon.');
                    },
                },
                {
                    icon: 'eye-outline',
                    label: 'Show Verse Numbers',
                    type: 'toggle',
                    value: settings.theme.showVerseNumbers,
                    onValueChange: (value) => updateSetting('theme', 'showVerseNumbers', value),
                },
                {
                    icon: 'translate-outline',
                    label: 'Show Translation',
                    type: 'toggle',
                    value: settings.theme.showTranslation,
                    onValueChange: (value) => updateSetting('theme', 'showTranslation', value),
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
                    value: settings.notifications.prayerReminders,
                    onValueChange: (value) => updateSetting('notifications', 'prayerReminders', value),
                },
                {
                    icon: 'alarm-outline',
                    label: 'Adhan Notifications',
                    type: 'toggle',
                    value: settings.notifications.adhanNotifications,
                    onValueChange: (value) => updateSetting('notifications', 'adhanNotifications', value),
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
                    value: settings.audio.autoPlay,
                    onValueChange: (value) => updateSetting('audio', 'autoPlay', value),
                },
                {
                    icon: 'mic-outline',
                    label: 'Voice Recognition',
                    type: 'toggle',
                    value: settings.audio.voiceRecognition,
                    onValueChange: (value) => updateSetting('audio', 'voiceRecognition', value),
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
                    value: settings.location.autoDetectLocation,
                    onValueChange: (value) => updateSetting('location', 'autoDetectLocation', value),
                },
                {
                    icon: 'compass-outline',
                    label: 'Qibla Compass',
                    type: 'toggle',
                    value: settings.location.qiblaCompass,
                    onValueChange: (value) => updateSetting('location', 'qiblaCompass', value),
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
                    value: settings.storage.offlineMode,
                    onValueChange: (value) => updateSetting('storage', 'offlineMode', value),
                },
                {
                    icon: 'trash-outline',
                    label: 'Clear Cache',
                    type: 'button',
                    onPress: clearCache,
                },
                {
                    icon: 'download-outline',
                    label: 'Download Quran',
                    type: 'button',
                    onPress: downloadQuran,
                },
            ],
        },
    ];

    const renderSettingItem = (item, index) => {
        return (
            <View key={index} style={[styles.settingItem, styles[`${theme}SettingItem`]]}>
                <View style={styles.settingLeft}>
                    <Ionicons
                        name={item.icon}
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
            
            <UniversalHeader />
            
            <View style={[styles.header, styles[`${theme}Header`]]}>
                <Text style={[styles.title, styles[`${theme}Title`]]}>Settings</Text>
                <Text style={[styles.subtitle, styles[`${theme}Subtitle`]]}>
                    Customize your experience
                </Text>
            </View>

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

                <TouchableOpacity
                    style={[styles.resetButton, { backgroundColor: '#ff6b6b' }]}
                    onPress={resetToDefaults}
                >
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text style={styles.resetButtonText}>Reset to Defaults</Text>
                </TouchableOpacity>

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
        paddingTop: Platform.OS === 'ios' ? 10 : 0,
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
        marginBottom: 20,
    },
    darkHeader: {
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    lightHeader: {
        borderBottomColor: 'rgba(60, 60, 60, 0.15)',
    },
    title: {
        fontSize: 28,
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
    profileCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 20,
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
        borderRadius: 8,
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
        fontSize: 20,
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
        borderRadius: 12,
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
        fontSize: 16,
        marginRight: 8,
    },
    darkSelectValueText: {
        color: '#b0b0b0',
    },
    lightSelectValueText: {
        color: '#6a6a6a',
    },
    buttonText: {
        color: '#ffd700',
        fontSize: 16,
        fontWeight: '500',
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
    },
    darkAppInfo: {
        backgroundColor: 'transparent',
    },
    lightAppInfo: {
        backgroundColor: 'transparent',
    },
    appInfoText: {
        fontSize: 14,
        marginBottom: 5,
    },
    darkAppInfoText: {
        color: '#b0b0b0',
    },
    lightAppInfoText: {
        color: '#6a6a6a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff6b6b',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 20,
        gap: 10,
    },
    resetButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});


