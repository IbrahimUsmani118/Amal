import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { logout } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UniversalHeader() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getIconColor = () => {
        return theme === 'light' ? '#3d3d3d' : '#ffd700';
    };

    return (
        <View style={[styles.header, styles[`${theme}Header`], { paddingTop: insets.top + 8 }]}>
            <View style={styles.headerLeft}>
                <Text style={[styles.title, styles[`${theme}Title`]]}>
                    أمال
                </Text>
                <Text style={[styles.subtitle, styles[`${theme}Subtitle`]]}>
                    AMAL - Enhanced Quran Reader
                </Text>
            </View>
            <View style={styles.headerRight}>
                {/* Theme Toggle */}
                <TouchableOpacity
                    style={[styles.themeToggle, styles[`${theme}ThemeToggle`]]}
                    onPress={toggleTheme}
                >
                    <Ionicons
                        name={theme === 'light' ? 'moon' : 'sunny'}
                        size={20}
                        color={theme === 'light' ? '#3d3d3d' : '#ffd700'}
                    />
                </TouchableOpacity>
                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={getIconColor()} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        marginBottom: 20,
    },
    headerLeft: {
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 6,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '500',
    },
    darkHeader: {
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    lightHeader: {
        borderBottomColor: 'rgba(60, 60, 60, 0.15)',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
    },
    darkTitle: {
        color: '#ffd700',
    },
    lightTitle: {
        color: '#3d3d3d',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '300',
    },
    darkSubtitle: {
        color: '#b0b0b0',
    },
    lightSubtitle: {
        color: '#6a6a6a',
    },
    themeToggle: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 8,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    darkThemeToggle: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    lightThemeToggle: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
});