import LocationSelector from '@/components/LocationSelector';
import UniversalHeader from '@/components/UniversalHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { prayerTimeApi } from '@/services/prayerTimeApi';
import realTimeDataService from '@/services/realTimeDataService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function PrayerTimesScreen() {
  const { theme } = useTheme();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [timeUntilNext, setTimeUntilNext] = useState(null);
  const [userTimezone, setUserTimezone] = useState('');
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const [realTimeStatus, setRealTimeStatus] = useState('initializing');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Initialize real-time data service
  useEffect(() => {
    initializeRealTimeData();
    
    return () => {
      // Cleanup listeners when component unmounts
      realTimeDataService.removeListener('prayerTimes', handlePrayerTimesUpdate);
      realTimeDataService.removeListener('location', handleLocationUpdate);
      realTimeDataService.removeListener('prayerTimesError', handlePrayerTimesError);
    };
  }, []);

  const initializeRealTimeData = () => {
    // Add listeners for real-time updates
    realTimeDataService.addListener('prayerTimes', handlePrayerTimesUpdate);
    realTimeDataService.addListener('location', handleLocationUpdate);
    realTimeDataService.addListener('prayerTimesError', handlePrayerTimesError);

    // Get initial data
    const currentLocation = realTimeDataService.getCurrentLocation();
    const currentPrayerTimes = realTimeDataService.getPrayerTimes();
    
    if (currentLocation) {
      setCurrentLocation(currentLocation);
    }
    
    if (currentPrayerTimes.length > 0) {
      setPrayerTimes(currentPrayerTimes);
      updatePrayerStatus(currentPrayerTimes);
    }

    setRealTimeStatus('active');
  };

  const handlePrayerTimesUpdate = (data) => {
    console.log('🕌 Real-time prayer times update:', data);
    setPrayerTimes(data.prayerTimes);
    setNextPrayer(data.nextPrayer);
    setTimeUntilNext(data.timeUntilNext);
    setLastUpdated(data.timestamp);
    updatePrayerStatus(data.prayerTimes);
  };

  const handleLocationUpdate = (data) => {
    console.log('📍 Real-time location update:', data);
    setCurrentLocation(data.location);
  };

  const handlePrayerTimesError = (data) => {
    console.error('❌ Prayer times error:', data);
    Alert.alert('Error', `Failed to update prayer times: ${data.error}`);
  };

  const updatePrayerStatus = (times) => {
    if (times && times.length > 0) {
      const next = prayerTimeApi.getNextPrayer(times);
      const timeUntil = prayerTimeApi.getTimeUntilNextPrayer(times);
      
      setNextPrayer(next);
      setTimeUntilNext(timeUntil);
    }
  };

  // Set default location on component mount
  useEffect(() => {
    if (!currentLocation) {
      getUserLocation();
    }
  }, []);

  const getUserLocation = async () => {
    try {
      // Get user's timezone first
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(timezone);

      // Try to get user's current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      // Use coordinates to get location info
      const { latitude, longitude } = position.coords;
      
      try {
        // Try to get prayer times by coordinates first
        const response = await prayerTimeApi.getPrayerTimesByCoordinates(latitude, longitude);
        if (response.success) {
          setCurrentLocation({
            city: response.result.city,
            country: response.result.country
          });
          return;
        }
      } catch (error) {
        console.log('Could not get location by coordinates, falling back to timezone-based location');
      }

      // Fallback to a reasonable default based on user's timezone
      const defaultLocation = getDefaultLocationByTimezone(timezone);
      setCurrentLocation(defaultLocation);
    } catch (error) {
      console.log('Could not get user location, using timezone-based fallback');
      // Fallback to timezone-based location
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(timezone);
      const defaultLocation = getDefaultLocationByTimezone(timezone);
      setCurrentLocation(defaultLocation);
    }
  };

  const getDefaultLocationByTimezone = (timezone) => {
    // Map common timezones to appropriate cities
    const timezoneMap = {
      'America/New_York': { city: 'New York', country: 'USA' },
      'America/Chicago': { city: 'Chicago', country: 'USA' },
      'America/Denver': { city: 'Denver', country: 'USA' },
      'America/Los_Angeles': { city: 'Los Angeles', country: 'USA' },
      'America/Toronto': { city: 'Toronto', country: 'Canada' },
      'America/Vancouver': { city: 'Vancouver', country: 'Canada' },
      'Europe/London': { city: 'London', country: 'UK' },
      'Europe/Paris': { city: 'Paris', country: 'France' },
      'Europe/Berlin': { city: 'Berlin', country: 'Germany' },
      'Europe/Moscow': { city: 'Moscow', country: 'Russia' },
      'Asia/Dubai': { city: 'Dubai', country: 'UAE' },
      'Asia/Karachi': { city: 'Karachi', country: 'Pakistan' },
      'Asia/Dhaka': { city: 'Dhaka', country: 'Bangladesh' },
      'Asia/Kolkata': { city: 'Mumbai', country: 'India' },
      'Asia/Shanghai': { city: 'Shanghai', country: 'China' },
      'Asia/Tokyo': { city: 'Tokyo', country: 'Japan' },
      'Asia/Seoul': { city: 'Seoul', country: 'South Korea' },
      'Australia/Sydney': { city: 'Sydney', country: 'Australia' },
      'Australia/Melbourne': { city: 'Melbourne', country: 'Australia' },
      'Pacific/Auckland': { city: 'Auckland', country: 'New Zealand' },
      'Africa/Cairo': { city: 'Cairo', country: 'Egypt' },
      'Africa/Lagos': { city: 'Lagos', country: 'Nigeria' },
      'Africa/Johannesburg': { city: 'Johannesburg', country: 'South Africa' },
    };

    return timezoneMap[timezone] || { city: 'London', country: 'UK' };
  };

  const getCurrentLocationTime = (timezone) => {
    try {
      // Try to get a simple timezone offset if possible
      const now = new Date();
      // For now, just show the timezone name in a readable format
      const cleanTimezone = timezone.replace(/_/g, ' ').replace(/\//g, ' / ');
      return cleanTimezone;
    } catch (error) {
      console.error('Error getting location time:', error);
      return 'Unknown';
    }
  };

  const getTimeDifference = (locationTimezone) => {
    try {
      // For now, just show a simple indicator
      // This avoids complex timezone conversion errors
      return 'Local time';
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return 'Unknown';
    }
  };

  // Fetch prayer times when location changes
  useEffect(() => {
    if (currentLocation) {
      fetchPrayerTimes();
    }
  }, [currentLocation]);

  // Update next prayer and countdown every minute
  useEffect(() => {
    if (prayerTimes.length > 0) {
      updateNextPrayer();
      const interval = setInterval(updateNextPrayer, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  // Real-time countdown timer
  useEffect(() => {
    if (timeUntilNext && prayerTimes.length > 0) {
      // Calculate total seconds
      const totalSeconds = timeUntilNext.hours * 3600 + timeUntilNext.minutes * 60;
      setCountdownSeconds(totalSeconds);
      setIsCountdownActive(true);

      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            // Countdown finished, refresh prayer times
            setIsCountdownActive(false);
            updateNextPrayer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Add subtle pulse effect every second
      const pulseInterval = setInterval(() => {
        setPulseScale(1.02);
        setTimeout(() => setPulseScale(1), 200);
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
        clearInterval(pulseInterval);
      };
    } else {
      setIsCountdownActive(false);
      setCountdownSeconds(0);
    }
  }, [timeUntilNext, prayerTimes.length]);

  const fetchPrayerTimes = async () => {
    if (!currentLocation) return;
    
    setLoading(true);
    try {
      const response = await prayerTimeApi.getPrayerTimes(
        currentLocation.city, 
        currentLocation.country
      );
      setPrayerTimes(response.result.times);
      console.log('Prayer times fetched:', response.result);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      Alert.alert(
        'Error',
        'Failed to fetch prayer times. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const updateNextPrayer = () => {
    if (prayerTimes.length === 0) return;
    
    const next = prayerTimeApi.getNextPrayer(prayerTimes);
    setNextPrayer(next);
    
    const timeUntil = prayerTimeApi.getTimeUntilNextPrayer(prayerTimes);
    setTimeUntilNext(timeUntil);
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    setPrayerTimes([]);
    setNextPrayer(null);
    setTimeUntilNext(null);
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

  const colors = getThemeColors();

  const formatCountdown = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Universal Header */}
      <UniversalHeader />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Prayer Times
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {currentLocation ? `${currentLocation.city}, ${currentLocation.country}` : 'Select your location'}
          </Text>
          {userTimezone && (
            <Text style={[styles.timezoneInfo, { color: colors.textSecondary }]}>
              Your timezone: {userTimezone}
            </Text>
          )}
          
          {/* Real-time Status Indicator */}
          <View style={styles.realTimeStatus}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: realTimeStatus === 'active' ? colors.accent : colors.primary }
            ]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {realTimeStatus === 'active' ? 'Real-time updates active' : 'Initializing...'}
            </Text>
            {lastUpdated && (
              <Text style={[styles.lastUpdatedText, { color: colors.textSecondary }]}>
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </Text>
            )}
          </View>
        </View>

        {/* Location Selector */}
        <LocationSelector
          currentLocation={currentLocation}
          onLocationSelect={handleLocationSelect}
          theme={theme}
        />

        {/* Next Prayer Highlight */}
        {nextPrayer && timeUntilNext && (
          <View style={[styles.nextPrayerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.nextPrayerTitle, { color: colors.text }]}>
              Next Prayer
            </Text>
            <View style={styles.nextPrayerContent}>
              <View style={styles.nextPrayerInfo}>
                <Text style={[styles.nextPrayerName, { color: colors.primary }]}>
                  {prayerTimeApi.getPrayerNameArabic(nextPrayer.name)}
                </Text>
                <Text style={[styles.nextPrayerNameEnglish, { color: colors.text }]}>
                  {nextPrayer.name}
                </Text>
                <Text style={[styles.nextPrayerTime, { color: colors.text }]}>
                  {prayerTimeApi.formatPrayerTime(nextPrayer.time, nextPrayer.timezone)}
                </Text>
                {nextPrayer.timezone && (
                  <Text style={[styles.locationTimeInfo, { color: colors.textSecondary }]}>
                    Location timezone: {getCurrentLocationTime(nextPrayer.timezone)}
                  </Text>
                )}
              </View>
              <View style={styles.countdownContainer}>
                <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>
                  Time Until {nextPrayer?.name}
                </Text>
                <Text style={[
                  styles.countdownTime,
                  {
                    color: countdownSeconds < 600 ? '#ff6b6b' : colors.accent, // Red when less than 10 minutes
                    transform: [{ scale: pulseScale }]
                  }
                ]}>
                  {formatCountdown(countdownSeconds)}
                </Text>
                <Text style={[styles.countdownSubtext, { color: colors.textSecondary }]}>
                  Updates every second
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Prayer Times List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading prayer times...
            </Text>
          </View>
        ) : prayerTimes.length > 0 ? (
          <View style={styles.prayerTimesContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Today's Prayer Times
            </Text>
            <Text style={[styles.timezoneNote, { color: colors.textSecondary }]}>
              Times shown are in {currentLocation?.city}'s local timezone
            </Text>
            {prayerTimes.map((prayer, index) => (
              <View
                key={`${prayer.name}-${index}`}
                style={[
                  styles.prayerTimeItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderLeftColor: nextPrayer?.name === prayer.name ? colors.accent : colors.border,
                    borderLeftWidth: nextPrayer?.name === prayer.name ? 4 : 1
                  }
                ]}
              >
                <View style={styles.prayerTimeLeft}>
                  <Text style={[styles.prayerName, { color: colors.text }]}>
                    {prayerTimeApi.getPrayerNameArabic(prayer.name)}
                  </Text>
                  <Text style={[styles.prayerNameEnglish, { color: colors.textSecondary }]}>
                    {prayer.name}
                  </Text>
                </View>
                <View style={styles.prayerTimeRight}>
                  <View style={styles.timeAndNextContainer}>
                    {nextPrayer?.name === prayer.name && (
                      <View style={[styles.nextIndicator, { backgroundColor: colors.accent }]}>
                        <Text style={[styles.nextIndicatorText, { color: colors.surface }]}>
                          Next
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.prayerTime, { color: colors.primary }]}>
                      {prayerTimeApi.formatPrayerTime(prayer.time, prayer.timezone)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : currentLocation ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No prayer times available
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={fetchPrayerTimes}
            >
              <Text style={[styles.retryButtonText, { color: colors.surface }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Please select a location to view prayer times
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
  },
  timezoneInfo: {
    fontSize: 14,
    fontWeight: '300',
    marginTop: 4,
    opacity: 0.8,
  },
  nextPrayerCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  nextPrayerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  nextPrayerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerInfo: {
    flex: 1,
  },
  nextPrayerName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  nextPrayerNameEnglish: {
    fontSize: 16,
    fontWeight: '400',
  },
  nextPrayerTime: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  countdownContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  countdownLabel: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  countdownTime: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  countdownSubtext: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
  prayerTimesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  prayerTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  prayerTimeLeft: {
    flex: 1,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  prayerNameEnglish: {
    fontSize: 14,
    fontWeight: '400',
  },
  prayerTimeRight: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  nextIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeAndNextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  timeDifference: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
    opacity: 0.7,
  },
  locationTimeInfo: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  timezoneNote: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  realTimeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastUpdatedText: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
});