import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function QiblaScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [isLightMode, setIsLightMode] = useState(false);
  const [compassRotation, setCompassRotation] = useState(0);
  const theme = isLightMode ? 'light' : 'dark';

  // Mock compass rotation - replace with actual sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      setCompassRotation(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => setIsLightMode(!isLightMode);

  return (
    <View style={[styles.container, styles[theme]]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
      
      {/* Header */}
      <View style={[styles.header, styles[`${theme}Header`]]}>
        <Text style={[styles.title, styles[`${theme}Title`]]}>Qibla Direction</Text>
        <Text style={[styles.subtitle, styles[`${theme}Subtitle`]]}>
          Point towards the Kaaba
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

      {/* Compass Container */}
      <View style={styles.compassContainer}>
        {/* Outer Ring */}
        <View style={[styles.outerRing, styles[`${theme}OuterRing`]]}>
          {/* Cardinal Directions */}
          <Text style={[styles.direction, styles.north, styles[`${theme}Direction`]]}>N</Text>
          <Text style={[styles.direction, styles.south, styles[`${theme}Direction`]]}>S</Text>
          <Text style={[styles.direction, styles.east, styles[`${theme}Direction`]]}>E</Text>
          <Text style={[styles.direction, styles.west, styles[`${theme}Direction`]]}>W</Text>
          
          {/* Compass Needle */}
          <View 
            style={[
              styles.compassNeedle, 
              { transform: [{ rotate: `${compassRotation}deg` }] }
            ]}
          >
            <View style={styles.needleTop} />
            <View style={styles.needleCenter} />
            <View style={styles.needleBottom} />
          </View>
        </View>

        {/* Qibla Arrow */}
        <View style={styles.qiblaContainer}>
          <Text style={[styles.qiblaLabel, styles[`${theme}QiblaLabel`]]}>
            Qibla Direction
          </Text>
          <View style={[styles.qiblaArrow, styles[`${theme}QiblaArrow`]]}>
            <Ionicons name="arrow-up" size={40} color="#ffd700" />
          </View>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoContainer}>
        <View style={[styles.infoCard, styles[`${theme}InfoCard`]]}>
          <Ionicons name="location-outline" size={24} color={theme === 'light' ? '#3d3d3d' : '#ffd700'} />
          <Text style={[styles.infoTitle, styles[`${theme}InfoTitle`]]}>Current Location</Text>
          <Text style={[styles.infoText, styles[`${theme}InfoText`]]}>New York, NY, USA</Text>
        </View>

        <View style={[styles.infoCard, styles[`${theme}InfoCard`]]}>
          <Ionicons name="compass-outline" size={24} color={theme === 'light' ? '#3d3d3d' : '#ffd700'} />
          <Text style={[styles.infoTitle, styles[`${theme}InfoTitle`]]}>Qibla Angle</Text>
          <Text style={[styles.infoText, styles[`${theme}InfoText`]]}>45° Northeast</Text>
        </View>

        <View style={[styles.infoCard, styles[`${theme}InfoCard`]]}>
          <Ionicons name="globe-outline" size={24} color={theme === 'light' ? '#3d3d3d' : '#ffd700'} />
          <Text style={[styles.infoTitle, styles[`${theme}InfoTitle`]]}>Distance to Kaaba</Text>
          <Text style={[styles.infoText, styles[`${theme}InfoText`]]}>10,847 km</Text>
        </View>
      </View>

      {/* Calibration Button */}
      <TouchableOpacity style={[styles.calibrateButton, styles[`${theme}CalibrateButton`]]}>
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.calibrateText}>Calibrate Compass</Text>
      </TouchableOpacity>
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
  compassContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  outerRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 30,
  },
  darkOuterRing: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  lightOuterRing: {
    borderColor: 'rgba(60, 60, 60, 0.2)',
    backgroundColor: 'rgba(60, 60, 60, 0.05)',
  },
  direction: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
  },
  north: {
    top: 20,
  },
  south: {
    bottom: 20,
  },
  east: {
    right: 20,
  },
  west: {
    left: 20,
  },
  darkDirection: {
    color: '#ffd700',
  },
  lightDirection: {
    color: '#3d3d3d',
  },
  compassNeedle: {
    position: 'absolute',
    alignItems: 'center',
  },
  needleTop: {
    width: 4,
    height: 100,
    backgroundColor: '#ffd700',
    borderRadius: 2,
  },
  needleCenter: {
    width: 20,
    height: 20,
    backgroundColor: '#ffd700',
    borderRadius: 10,
    marginTop: -10,
  },
  needleBottom: {
    width: 4,
    height: 100,
    backgroundColor: '#e8e8e8',
    borderRadius: 2,
    marginTop: -10,
  },
  qiblaContainer: {
    alignItems: 'center',
  },
  qiblaLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  darkQiblaLabel: {
    color: '#e8e8e8',
  },
  lightQiblaLabel: {
    color: '#3d3d3d',
  },
  qiblaArrow: {
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  darkQiblaArrow: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  lightQiblaArrow: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  darkInfoCard: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightInfoCard: {
    backgroundColor: '#fefdfb',
    borderColor: 'rgba(60, 60, 60, 0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
    marginBottom: 4,
  },
  darkInfoTitle: {
    color: '#e8e8e8',
  },
  lightInfoTitle: {
    color: '#3d3d3d',
  },
  infoText: {
    fontSize: 14,
    marginLeft: 15,
  },
  darkInfoText: {
    color: '#b0b0b0',
  },
  lightInfoText: {
    color: '#6a6a6a',
  },
  calibrateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffd700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginHorizontal: 20,
    gap: 10,
  },
  darkCalibrateButton: {
    backgroundColor: '#ffd700',
  },
  lightCalibrateButton: {
    backgroundColor: '#ffd700',
  },
  calibrateText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
});
