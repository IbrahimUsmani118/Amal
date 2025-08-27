import LocationSelector from '@/components/LocationSelector';
import UniversalHeader from '@/components/UniversalHeader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PrayerTime, prayerTimeApi } from '@/services/prayerTimeApi';
import { Location } from '@/types/common';
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
  View,
} from 'react-native';

export default function PrayerTimesScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'dark';
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<{ hours: number; minutes: number } | null>(null);

  // Set default location on component mount
  useEffect(() => {
    if (!currentLocation) {
      setCurrentLocation({ city: 'Istanbul', country: 'Turkey' });
    }
  }, []);

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

  const fetchPrayerTimes = async () => {
    if (!currentLocation) return;

    setLoading(true);
    try {
      const response = await prayerTimeApi.getPrayerTimes(currentLocation.city, currentLocation.country);
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

  const handleLocationSelect = (location: Location) => {
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
                  {prayerTimeApi.formatPrayerTime(nextPrayer.time)}
                </Text>
              </View>
              <View style={styles.countdownContainer}>
                <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>
                  Time Remaining
                </Text>
                <Text style={[styles.countdownTime, { color: colors.accent }]}>
                  {timeUntilNext.hours}h {timeUntilNext.minutes}m
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
            {prayerTimes.map((prayer, index) => (
              <View
                key={`${prayer.name}-${index}`}
                style={[
                  styles.prayerTimeItem,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    borderLeftColor: nextPrayer?.name === prayer.name ? colors.accent : colors.border,
                    borderLeftWidth: nextPrayer?.name === prayer.name ? 4 : 1,
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
                  <Text style={[styles.prayerTime, { color: colors.primary }]}>
                    {prayerTimeApi.formatPrayerTime(prayer.time)}
                  </Text>
                  {nextPrayer?.name === prayer.name && (
                    <View style={[styles.nextIndicator, { backgroundColor: colors.accent }]}>
                      <Text style={styles.nextIndicatorText}>Next</Text>
                    </View>
                  )}
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
  nextPrayerCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  nextPrayerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  nextPrayerNameEnglish: {
    fontSize: 18,
    fontWeight: '400',
  },
  nextPrayerTime: {
    fontSize: 28,
    fontWeight: '700',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  countdownTime: {
    fontSize: 28,
    fontWeight: '700',
  },
  prayerTimesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
  },
  prayerTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  prayerTimeLeft: {
    flex: 1,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  prayerNameEnglish: {
    fontSize: 14,
    fontWeight: '400',
  },
  prayerTimeRight: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: '600',
  },
  nextIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  nextIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 15,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
