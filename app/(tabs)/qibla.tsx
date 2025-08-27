import LocationSelector from '@/components/LocationSelector';
import UniversalHeader from '@/components/UniversalHeader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { qiblaApi, QiblaDirection } from '@/services/qiblaApi';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function QiblaScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'dark';
  const [currentLocation, setCurrentLocation] = useState<ExpoLocation.LocationObject | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<QiblaDirection | null>(null);
  const [loading, setLoading] = useState(false);
  const [compassRotation, setCompassRotation] = useState(0);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  
  const compassRotationAnim = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const compassSize = Math.min(screenWidth * 0.8, 300);

  // Set default location on component mount
  useEffect(() => {
    if (!currentLocation) {
      // Default to Mecca coordinates
      setCurrentLocation({
        coords: {
          latitude: 21.4225,
          longitude: 39.8262,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      });
    }
  }, []);

  // Fetch qibla direction when location changes
  useEffect(() => {
    if (currentLocation) {
      fetchQiblaDirection();
    }
  }, [currentLocation]);

  // Start compass updates when qibla direction is available
  useEffect(() => {
    if (qiblaDirection && hasLocationPermission) {
      startCompassUpdates();
    }
    return () => {
      // Cleanup compass updates
      Magnetometer.removeAllListeners();
    };
  }, [qiblaDirection, hasLocationPermission]);

  const fetchQiblaDirection = async () => {
    if (!currentLocation) return;

    setLoading(true);
    try {
      const response = await qiblaApi.getQiblaDirection(
        currentLocation.coords.latitude, 
        currentLocation.coords.longitude
      );
      setQiblaDirection(response);
      console.log('Qibla direction fetched:', response);
    } catch (error) {
      console.error('Error fetching qibla direction:', error);
      Alert.alert(
        'Error',
        'Failed to fetch qibla direction. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const startCompassUpdates = () => {
    // Start magnetometer updates for compass functionality
    Magnetometer.setUpdateInterval(100);
    Magnetometer.addListener((data) => {
      setMagnetometerData(data);
      
      // Calculate heading from magnetometer data
      const heading = Math.atan2(data.y, data.x) * (180 / Math.PI);
      const normalizedHeading = (heading + 360) % 360;
      setDeviceHeading(normalizedHeading);
      
      if (qiblaDirection) {
        // Calculate the rotation needed to point to qibla
        const qiblaRotation = qiblaDirection.data.qibla_direction - normalizedHeading;
        const normalizedRotation = ((qiblaRotation % 360) + 360) % 360;
        
        setCompassRotation(normalizedRotation);
        
        // Animate the compass rotation
        Animated.timing(compassRotationAnim, {
          toValue: normalizedRotation,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  const handleLocationSelect = (location: any) => {
    // Convert LocationSelector location to expo-location format
    const expoLocation: ExpoLocation.LocationObject = {
      coords: {
        latitude: location.latitude || 21.4225,
        longitude: location.longitude || 39.8262,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    };
    
    setCurrentLocation(expoLocation);
    setQiblaDirection(null);
    setCompassRotation(0);
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        
        // Get current location
        const location = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.High,
        });
        setCurrentLocation(location);
        
        console.log('Location permission granted:', location);
      } else {
        Alert.alert(
          'Location Permission',
          'Location permission is required to use the compass feature.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert(
        'Error',
        'Failed to get location permission. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getThemeColors = () => {
    if (theme === 'light') {
      return {
        background: '#f8f6f0',
        surface: '#ffffff',
        text: '#3d3d3d',
        textSecondary: '#666666',
        primary: '#007bff',
        accent: '#28a745',
        border: '#e0e0e0',
        compass: '#f0f0f0',
        needle: '#ff6b6b',
      };
    }
    return {
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      primary: '#ffd700',
      accent: '#28a745',
      border: '#404040',
      compass: '#2d2d2d',
      needle: '#ff6b6b',
    };
  };

  const colors = getThemeColors();

  const renderCompass = () => {
    if (!qiblaDirection) return null;

    return (
      <View style={styles.compassContainer}>
        <View style={[styles.compass, { width: compassSize, height: compassSize }]}>
          {/* Compass Background */}
          <View style={[styles.compassBackground, { backgroundColor: colors.compass }]}>
            {/* Cardinal Directions */}
            <Text style={[styles.cardinalDirection, styles.north, { color: colors.text }]}>N</Text>
            <Text style={[styles.cardinalDirection, styles.east, { color: colors.text }]}>E</Text>
            <Text style={[styles.cardinalDirection, styles.south, { color: colors.text }]}>S</Text>
            <Text style={[styles.cardinalDirection, styles.west, { color: colors.text }]}>W</Text>
            
            {/* Compass Ring */}
            <View style={[styles.compassRing, { borderColor: colors.border }]} />
            
            {/* Qibla Needle */}
            <Animated.View
              style={[
                styles.qiblaNeedle,
                {
                  backgroundColor: colors.needle,
                  transform: [
                    { rotate: `${compassRotationAnim}deg` }
                  ]
                }
              ]}
            />
            
            {/* Center Point */}
            <View style={[styles.centerPoint, { backgroundColor: colors.primary }]} />
          </View>
        </View>
        
        {/* Direction Info */}
        <View style={styles.directionInfo}>
          <Text style={[styles.directionText, { color: colors.text }]}>
            Qibla Direction: {qiblaDirection.data?.qibla_direction ? qiblaDirection.data.qibla_direction.toFixed(1) : '0.0'}°
          </Text>
          <Text style={[styles.directionText, { color: colors.textSecondary }]}>
            {qiblaDirection.data?.qibla_direction ? qiblaApi.getCardinalDirection(qiblaDirection.data.qibla_direction) : 'N/A'}
          </Text>
          <Text style={[styles.directionText, { color: colors.textSecondary, fontSize: 16 }]}>
            Device Heading: {deviceHeading.toFixed(1)}°
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Universal Header */}
      <UniversalHeader />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Qibla Direction
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Find the direction to the Kaaba
          </Text>
        </View>

        {/* Location Selector */}
        <LocationSelector
          currentLocation={currentLocation ? {
            city: 'Current Location',
            country: 'Unknown',
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
          } : null}
          onLocationSelect={handleLocationSelect}
          theme={theme}
        />

        {/* Location Permission Request */}
        {!hasLocationPermission && (
          <View style={[styles.permissionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="location-outline" size={32} color={colors.primary} />
            <Text style={[styles.permissionTitle, { color: colors.text }]}>
              Enable Location Access
            </Text>
            <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
              Allow location access to use the compass feature and get accurate qibla direction.
            </Text>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: colors.primary }]}
              onPress={requestLocationPermission}
            >
              <Text style={[styles.permissionButtonText, { color: colors.surface }]}>
                Enable Location
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Compass Display */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading qibla direction...
            </Text>
          </View>
        ) : (
          renderCompass()
        )}

        {/* Additional Info */}
        {qiblaDirection && (
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              About Qibla
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              The Qibla is the direction that Muslims face when performing salah (prayer). 
              This direction points towards the Kaaba in Mecca, Saudi Arabia.
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Your Location:</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                {currentLocation ? `${currentLocation.coords.latitude?.toFixed(4) || '0.0000'}, ${currentLocation.coords.longitude?.toFixed(4) || '0.0000'}` : 'Unknown'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Kaaba Location:</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                Mecca, Saudi Arabia
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 10 : 10, // Same as Quran page
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
  },
  permissionCard: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  compassContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  compass: {
    borderRadius: 150,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardinalDirection: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '600',
  },
  north: {
    top: 20,
  },
  east: {
    right: 20,
  },
  south: {
    bottom: 20,
  },
  west: {
    left: 20,
  },
  compassRing: {
    width: '80%',
    height: '80%',
    borderRadius: 140,
    borderWidth: 8,
    borderColor: 'transparent',
    position: 'absolute',
  },
  qiblaNeedle: {
    position: 'absolute',
    width: 40,
    height: 100,
    borderRadius: 20,
    borderWidth: 8,
    borderColor: 'transparent',
    alignSelf: 'center',
    bottom: 0,
  },
  centerPoint: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    position: 'absolute',
    bottom: 0,
  },
  directionInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  directionText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 5,
  },
  infoCard: {
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
