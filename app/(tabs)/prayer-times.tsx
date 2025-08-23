import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function PrayerTimesScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [isLightMode, setIsLightMode] = useState(false);
  const theme = isLightMode ? 'light' : 'dark';

  // Mock prayer times data - replace with actual API call
  const prayerTimes = [
    { name: 'Fajr', time: '5:30 AM', icon: 'sunny-outline' },
    { name: 'Dhuhr', time: '12:30 PM', icon: 'sunny' },
    { name: 'Asr', time: '3:45 PM', icon: 'partly-sunny' },
    { name: 'Maghrib', time: '6:15 PM', icon: 'moon-outline' },
    { name: 'Isha', time: '7:45 PM', icon: 'moon' },
  ];

  const toggleTheme = () => setIsLightMode(!isLightMode);

  return (
    <View style={[styles.container, styles[theme]]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
      
      {/* Header */}
      <View style={[styles.header, styles[`${theme}Header`]]}>
        <Text style={[styles.title, styles[`${theme}Title`]]}>Prayer Times</Text>
        <Text style={[styles.subtitle, styles[`${theme}Subtitle`]]}>
          Daily prayer schedule
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

      {/* Prayer Times List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {prayerTimes.map((prayer, index) => (
          <View key={prayer.name} style={[styles.prayerCard, styles[`${theme}PrayerCard`]]}>
            <View style={styles.prayerInfo}>
              <Ionicons 
                name={prayer.icon as any} 
                size={32} 
                color={theme === 'light' ? '#3d3d3d' : '#ffd700'} 
              />
              <View style={styles.prayerText}>
                <Text style={[styles.prayerName, styles[`${theme}PrayerName`]]}>
                  {prayer.name}
                </Text>
                <Text style={[styles.prayerTime, styles[`${theme}PrayerTime`]]}>
                  {prayer.time}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.notifyButton, styles[`${theme}NotifyButton`]]}>
              <Ionicons name="notifications-outline" size={20} color={theme === 'light' ? '#3d3d3d' : '#ffd700'} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Location Info */}
        <View style={[styles.locationCard, styles[`${theme}LocationCard`]]}>
          <Ionicons name="location-outline" size={24} color={theme === 'light' ? '#3d3d3d' : '#ffd700'} />
          <Text style={[styles.locationText, styles[`${theme}LocationText`]]}>
            Current Location: New York, NY
          </Text>
          <TouchableOpacity style={[styles.changeLocationButton, styles[`${theme}ChangeLocationButton`]]}>
            <Text style={styles.changeLocationText}>Change</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  prayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  darkPrayerCard: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightPrayerCard: {
    backgroundColor: '#fefdfb',
    borderColor: 'rgba(60, 60, 60, 0.1)',
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prayerText: {
    marginLeft: 20,
  },
  prayerName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  darkPrayerName: {
    color: '#e8e8e8',
  },
  lightPrayerName: {
    color: '#3d3d3d',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '400',
  },
  darkPrayerTime: {
    color: '#b0b0b0',
  },
  lightPrayerTime: {
    color: '#6a6a6a',
  },
  notifyButton: {
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
  },
  darkNotifyButton: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightNotifyButton: {
    borderColor: 'rgba(60, 60, 60, 0.2)',
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1,
  },
  darkLocationCard: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightLocationCard: {
    backgroundColor: '#fefdfb',
    borderColor: 'rgba(60, 60, 60, 0.1)',
  },
  locationText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  darkLocationText: {
    color: '#e8e8e8',
  },
  lightLocationText: {
    color: '#3d3d3d',
  },
  changeLocationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ffd700',
  },
  darkChangeLocationButton: {
    backgroundColor: '#ffd700',
  },
  lightChangeLocationButton: {
    backgroundColor: '#ffd700',
  },
  changeLocationText: {
    color: '#1a1a2e',
    fontWeight: '600',
    fontSize: 14,
  },
});
