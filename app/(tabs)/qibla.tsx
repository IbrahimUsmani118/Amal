import LocationSelector from '@/components/LocationSelector';
import UniversalHeader from '@/components/UniversalHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { qiblaApi, QiblaDirection } from '@/services/qiblaApi';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CustomQiblaCompass from '@/components/CustomQiblaCompass';

export default function QiblaScreen() {
  const { theme } = useTheme();
  const [currentLocation, setCurrentLocation] = useState<ExpoLocation.LocationObject | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<QiblaDirection | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [locationSuccessMessage, setLocationSuccessMessage] = useState<string | null>(null);
  


  // Set default location on component mount
  useEffect(() => {
    if (!currentLocation) {
      getUserLocation();
    }
  }, []);

  const getUserLocation = async () => {
    try {
      // Check if we have location permission first
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Request permission if not granted
        const { status: newStatus } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          console.log('Location permission denied');
          setHasLocationPermission(false);
          // Fallback to Mecca coordinates
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
          return;
        }
      }

      setHasLocationPermission(true);
      
      // Get current location using Expo Location
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      setCurrentLocation(location);
      setLocationSuccessMessage(`GPS Location: ${getCityNameFromCoordinates(location.coords.latitude, location.coords.longitude)}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setLocationSuccessMessage(null);
      }, 3000);
      
      console.log('Current location obtained:', location);
      
    } catch (error) {
      console.log('Could not get user location, using Mecca as fallback:', error);
      setHasLocationPermission(false);
      // Fallback to Mecca coordinates
      const fallbackLocation = {
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
      };
      setCurrentLocation(fallbackLocation);
      setLocationSuccessMessage('Using fallback location (Mecca)');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setLocationSuccessMessage(null);
      }, 3000);
    }
  };

  // Fetch qibla direction when location changes
  useEffect(() => {
    if (currentLocation) {
      fetchQiblaDirection();
    }
  }, [currentLocation]);

  const fetchQiblaDirection = async () => {
    if (!currentLocation) return;

    setLoading(true);
    try {
      console.log('Fetching qibla direction for coordinates:', {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude
      });

      const response = await qiblaApi.getQiblaDirection(
        currentLocation.coords.latitude, 
        currentLocation.coords.longitude
      );
      
      console.log('Qibla direction API response:', response);
      
      if (response && response.data && typeof response.data.qibla_direction === 'number') {
        setQiblaDirection(response);
        console.log('Qibla direction set successfully:', response.data.qibla_direction);
      } else {
        console.error('Invalid response format:', response);
        throw new Error(`Invalid qibla direction response format: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      console.error('Error fetching qibla direction:', error);
      Alert.alert(
        'Error',
        `Failed to fetch qibla direction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (location: any) => {
    try {
      console.log('Location selected:', location);
      
      // If location has coordinates, use them directly
      if (location.latitude && location.longitude) {
        const expoLocation: ExpoLocation.LocationObject = {
          coords: {
            latitude: location.latitude,
            longitude: location.longitude,
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
        setLocationSuccessMessage(`Location set to coordinates (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setLocationSuccessMessage(null);
        }, 3000);
        
        // Fetch qibla direction for the new location
        setTimeout(() => {
          fetchQiblaDirection();
        }, 500);
        return;
      }
      
      // If location only has city/country, use hardcoded coordinates for popular cities
      if (location.city && location.country) {
        console.log('Getting coordinates for:', location.city, location.country);
        
        // Hardcoded coordinates for popular cities
        const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
          // Middle East
          'Istanbul': { lat: 41.0082, lng: 28.9784 },
          'Mecca': { lat: 21.4225, lng: 39.8262 },
          'Medina': { lat: 24.5247, lng: 39.5692 },
          'Cairo': { lat: 30.0444, lng: 31.2357 },
          'Dubai': { lat: 25.2048, lng: 55.2708 },
          'Riyadh': { lat: 24.7136, lng: 46.6753 },
          'Amman': { lat: 31.9454, lng: 35.9284 },
          'Beirut': { lat: 33.8935, lng: 35.5016 },
          'Tehran': { lat: 35.6892, lng: 51.3890 },
          'Baghdad': { lat: 33.3152, lng: 44.3661 },
          
          // Asia
          'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
          'Jakarta': { lat: -6.2088, lng: 106.8456 },
          'Karachi': { lat: 24.8607, lng: 67.0011 },
          'Lahore': { lat: 31.5204, lng: 74.3587 },
          'Dhaka': { lat: 23.8103, lng: 90.4125 },
          'Mumbai': { lat: 19.0760, lng: 72.8777 },
          'Delhi': { lat: 28.7041, lng: 77.1025 },
          'Bangkok': { lat: 13.7563, lng: 100.5018 },
          'Singapore': { lat: 1.3521, lng: 103.8198 },
          'Manila': { lat: 14.5995, lng: 120.9842 },
          'Tokyo': { lat: 35.6762, lng: 139.6503 },
          'Seoul': { lat: 37.5665, lng: 126.9780 },
          'Beijing': { lat: 39.9042, lng: 116.4074 },
          'Hong Kong': { lat: 22.3193, lng: 114.1694 },
          
          // Europe
          'London': { lat: 51.5074, lng: -0.1278 },
          'Paris': { lat: 48.8566, lng: 2.3522 },
          'Berlin': { lat: 52.5200, lng: 13.4050 },
          'Rome': { lat: 41.9028, lng: 12.4964 },
          'Madrid': { lat: 40.4168, lng: -3.7038 },
          'Amsterdam': { lat: 52.3676, lng: 4.9041 },
          'Vienna': { lat: 48.2082, lng: 16.3738 },
          'Prague': { lat: 50.0755, lng: 14.4378 },
          'Warsaw': { lat: 52.2297, lng: 21.0122 },
          'Moscow': { lat: 55.7558, lng: 37.6176 },
          
          // Americas
          'New York': { lat: 40.7128, lng: -74.0060 },
          'Los Angeles': { lat: 34.0522, lng: -118.2437 },
          'Chicago': { lat: 41.8781, lng: -87.6298 },
          'Toronto': { lat: 43.6532, lng: -79.3832 },
          'Vancouver': { lat: 49.2827, lng: -123.1207 },
          'Mexico City': { lat: 19.4326, lng: -99.1332 },
          'São Paulo': { lat: -23.5505, lng: -46.6333 },
          'Buenos Aires': { lat: -34.6118, lng: -58.3960 },
          'Lima': { lat: -12.0464, lng: -77.0428 },
          
          // Africa
          'Lagos': { lat: 6.5244, lng: 3.3792 },
          'Nairobi': { lat: -1.2921, lng: 36.8219 },
          'Johannesburg': { lat: -26.2041, lng: 28.0473 },
          'Casablanca': { lat: 33.5731, lng: -7.5898 },
          'Algiers': { lat: 36.7538, lng: 3.0588 },
          'Tunis': { lat: 36.8065, lng: 10.1815 },
          
          // Oceania
          'Sydney': { lat: -33.8688, lng: 151.2093 },
          'Melbourne': { lat: -37.8136, lng: 144.9631 },
          'Perth': { lat: -31.9505, lng: 115.8605 },
          'Auckland': { lat: -36.8485, lng: 174.7633 }
        };
        
        const cityKey = location.city;
        const coordinates = cityCoordinates[cityKey];
        
        if (coordinates) {
          console.log(`Found coordinates for ${cityKey}:`, coordinates);
          const expoLocation: ExpoLocation.LocationObject = {
            coords: {
              latitude: coordinates.lat,
              longitude: coordinates.lng,
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
          setLocationSuccessMessage(`Location set to ${cityKey}`);
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setLocationSuccessMessage(null);
          }, 3000);
          
          // Fetch qibla direction for the new location
          setTimeout(() => {
            fetchQiblaDirection();
          }, 500);
          return;
        } else {
          console.log(`No coordinates found for city: ${cityKey}`);
          console.log('Available cities:', Object.keys(cityCoordinates));
          
          // Try to find a partial match
          const partialMatches = Object.keys(cityCoordinates).filter(city => 
            city.toLowerCase().includes(location.city.toLowerCase()) ||
            city.toLowerCase().includes(location.country.toLowerCase())
          );
          
          if (partialMatches.length > 0) {
            console.log('Found partial matches:', partialMatches);
            const bestMatch = partialMatches[0];
            const coordinates = cityCoordinates[bestMatch];
            
            console.log(`Using best match: ${bestMatch}`, coordinates);
            const expoLocation: ExpoLocation.LocationObject = {
              coords: {
                latitude: coordinates.lat,
                longitude: coordinates.lng,
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
            
            // Fetch qibla direction for the new location
            setTimeout(() => {
              fetchQiblaDirection();
            }, 500);
            return;
          }
        }
      }
      
      // Fallback: use default coordinates (Mecca)
      console.log('Using fallback coordinates (Mecca)');
      const expoLocation: ExpoLocation.LocationObject = {
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
      };
      
      setCurrentLocation(expoLocation);
      setQiblaDirection(null);
      
      // Fetch qibla direction for the new location
      setTimeout(() => {
        fetchQiblaDirection();
      }, 500);
      
    } catch (error) {
      console.error('Error handling location selection:', error);
      Alert.alert('Error', 'Failed to set location. Please try again.');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        
        // Get current location using Expo Location
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
    };
  };

  // Function to get city name from coordinates
  const getCityNameFromCoordinates = (lat: number, lng: number): string => {
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      // Middle East
      'Istanbul': { lat: 41.0082, lng: 28.9784 },
      'Mecca': { lat: 21.4225, lng: 39.8262 },
      'Medina': { lat: 24.5247, lng: 39.5692 },
      'Cairo': { lat: 30.0444, lng: 31.2357 },
      'Dubai': { lat: 25.2048, lng: 55.2708 },
      'Riyadh': { lat: 24.7136, lng: 46.6753 },
      'Amman': { lat: 31.9454, lng: 35.9284 },
      'Beirut': { lat: 33.8935, lng: 35.5016 },
      'Tehran': { lat: 35.6892, lng: 51.3890 },
      'Baghdad': { lat: 33.3152, lng: 44.3661 },
      
      // Asia
      'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
      'Jakarta': { lat: -6.2088, lng: 106.8456 },
      'Karachi': { lat: 24.8607, lng: 67.0011 },
      'Lahore': { lat: 31.5204, lng: 74.3587 },
      'Dhaka': { lat: 23.8103, lng: 90.4125 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.7041, lng: 77.1025 },
      'Bangkok': { lat: 13.7563, lng: 100.5018 },
      'Singapore': { lat: 1.3521, lng: 103.8198 },
      'Manila': { lat: 14.5995, lng: 120.9842 },
      'Tokyo': { lat: 35.6762, lng: 139.6503 },
      'Seoul': { lat: 37.5665, lng: 126.9780 },
      'Beijing': { lat: 39.9042, lng: 116.4074 },
      'Hong Kong': { lat: 22.3193, lng: 114.1694 },
      
      // Europe
      'London': { lat: 51.5074, lng: -0.1278 },
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Berlin': { lat: 52.5200, lng: 13.4050 },
      'Rome': { lat: 41.9028, lng: 12.4964 },
      'Madrid': { lat: 40.4168, lng: -3.7038 },
      'Amsterdam': { lat: 52.3676, lng: 4.9041 },
      'Vienna': { lat: 48.2082, lng: 16.3738 },
      'Prague': { lat: 50.0755, lng: 14.4378 },
      'Warsaw': { lat: 52.2297, lng: 21.0122 },
      'Moscow': { lat: 55.7558, lng: 37.6176 },
      
      // Americas
      'New York': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'Chicago': { lat: 41.8781, lng: -87.6298 },
      'Toronto': { lat: 43.6532, lng: -79.3832 },
      'Vancouver': { lat: 49.2827, lng: -123.1207 },
      'Mexico City': { lat: 19.4326, lng: -99.1332 },
      'São Paulo': { lat: -23.5505, lng: -46.6333 },
      'Buenos Aires': { lat: -34.6118, lng: -58.3960 },
      'Lima': { lat: -12.0464, lng: -77.0428 },
      
      // Africa
      'Lagos': { lat: 6.5244, lng: 3.3792 },
      'Nairobi': { lat: -1.2921, lng: 36.8219 },
      'Johannesburg': { lat: -26.2041, lng: 28.0473 },
      'Casablanca': { lat: 33.5731, lng: -7.5898 },
      'Algiers': { lat: 36.7538, lng: 3.0588 },
      'Tunis': { lat: 36.8065, lng: 10.1815 },
      
      // Oceania
      'Sydney': { lat: -33.8688, lng: 151.2093 },
      'Melbourne': { lat: -37.8136, lng: 144.9631 },
      'Perth': { lat: -31.9505, lng: 115.8605 },
      'Auckland': { lat: -36.8485, lng: 174.7633 }
    };

    // Find the closest city within a reasonable tolerance
    let closestCity = 'Unknown Location';
    let minDistance = Infinity;
    
    Object.entries(cityCoordinates).forEach(([cityName, coords]) => {
      const distance = Math.sqrt(
        Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
      );
      if (distance < minDistance && distance < 0.5) { // Within ~55km for better matching
        minDistance = distance;
        closestCity = cityName;
      }
    });
    
    // If no close city found, return coordinates as fallback
    if (closestCity === 'Unknown Location') {
      return `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
    
    return closestCity;
  };

  const colors = getThemeColors();

    const renderCompassInfo = () => {
    return (
      <View style={[styles.compassInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.compassInfoTitle, { color: colors.text }]}>
          Compass Information
        </Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Qibla Direction:</Text>
          <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
            {qiblaDirection?.data?.qibla_direction ? `${qiblaDirection.data.qibla_direction.toFixed(1)}°` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Your Location:</Text>
          <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
            {currentLocation ? 
              `${getCityNameFromCoordinates(currentLocation.coords.latitude, currentLocation.coords.longitude)} (${currentLocation.coords.latitude?.toFixed(4)}, ${currentLocation.coords.longitude?.toFixed(4)})` : 
              'Unknown'
            }
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Kaaba Location:</Text>
          <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
            Mecca, Saudi Arabia
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
          
          {/* Compass Status */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { 
              backgroundColor: hasLocationPermission ? colors.accent : colors.primary
            }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {hasLocationPermission ? 'Location Active' : 'Location Required'}
            </Text>
            {hasLocationPermission && currentLocation && (
              <Text style={[styles.statusSubtext, { color: colors.textSecondary }]}>
                {getCityNameFromCoordinates(currentLocation.coords.latitude, currentLocation.coords.longitude)} • Compass will update automatically
              </Text>
            )}
            {hasLocationPermission && !currentLocation && (
              <Text style={[styles.statusSubtext, { color: colors.textSecondary }]}>
                Select a location to get started
              </Text>
            )}
          </View>
          
          {/* Success Message */}
          {locationSuccessMessage && (
            <View style={[styles.successMessage, { backgroundColor: colors.accent, borderColor: colors.border }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.surface} />
              <Text style={[styles.successMessageText, { color: colors.surface }]}>
                {locationSuccessMessage}
              </Text>
            </View>
          )}
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
        
        {/* Manual Refresh Button */}
        <View style={styles.refreshContainer}>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (currentLocation) {
                console.log('Refreshing qibla direction for current location');
                fetchQiblaDirection();
              } else {
                console.log('No current location, cannot refresh');
                Alert.alert('No Location', 'Please select a location first or enable location services.');
              }
            }}
          >
            <Ionicons name="refresh" size={20} color={colors.surface} />
            <Text style={[styles.refreshButtonText, { color: colors.surface }]}>
              Refresh Qibla Direction
            </Text>
          </TouchableOpacity>
          
          {/* Force Refresh with Current GPS */}
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.accent, marginTop: 10 }]}
            onPress={() => {
              console.log('Force refreshing with current GPS location');
              getUserLocation();
            }}
          >
            <Ionicons name="location" size={20} color={colors.surface} />
            <Text style={[styles.refreshButtonText, { color: colors.surface }]}>
              Use Current GPS Location
            </Text>
          </TouchableOpacity>
          

          

        </View>

        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>
            How to Use
          </Text>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            • Hold your device flat and level{'\n'}
            • Rotate your device to see the compass move{'\n'}
            • The blue arrow points to the Qibla direction{'\n'}
            • Make sure location services are enabled{'\n'}
            • Compass updates in real-time as you move
          </Text>
        </View>

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
          <>
            {/* Visual Qibla Compass */}
            <View style={styles.compassContainer}>
              <CustomQiblaCompass
                qiblaDirection={qiblaDirection?.data?.qibla_direction || 0}
                color={colors.primary}
                backgroundColor={colors.surface}
                textColor={colors.text}
              />
            </View>
            
                    {/* Compass Information */}
        {renderCompassInfo()}
        
        {/* Debug Information */}
        {__DEV__ && (
          <View style={[styles.debugCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.debugTitle, { color: colors.text }]}>
              Debug Information
            </Text>
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              Location: {currentLocation ? 
                `${getCityNameFromCoordinates(currentLocation.coords.latitude, currentLocation.coords.longitude)} (${currentLocation.coords.latitude?.toFixed(4)}, ${currentLocation.coords.longitude?.toFixed(4)})` : 
                'Unknown'
              }
            </Text>
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              Has Permission: {hasLocationPermission ? 'Yes' : 'No'}
            </Text>
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              Qibla Direction: {qiblaDirection?.data?.qibla_direction ? `${qiblaDirection.data.qibla_direction.toFixed(1)}°` : 'N/A'}
            </Text>
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              Loading: {loading ? 'Yes' : 'No'}
            </Text>
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              Last Updated: {currentLocation ? new Date(currentLocation.timestamp).toLocaleTimeString() : 'Never'}
            </Text>
          </View>
        )}
          </>
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
                {currentLocation ? 
                  `${getCityNameFromCoordinates(currentLocation.coords.latitude, currentLocation.coords.longitude)} (${currentLocation.coords.latitude?.toFixed(4) || '0.0000'}, ${currentLocation.coords.longitude?.toFixed(4) || '0.0000'})` : 
                  'Unknown'
                }
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
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
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
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  debugCard: {
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    marginBottom: 5,
  },
  refreshContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusSubtext: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 5,
  },
  instructionsCard: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  compassInfoCard: {
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  compassInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorCard: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    gap: 10,
  },
  successMessageText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
