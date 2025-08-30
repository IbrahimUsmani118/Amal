import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { prayerTimeApi } from '../services/prayerTimeApi';
import { Location } from '../types/common';

interface LocationSelectorProps {
  currentLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  theme: 'light' | 'dark';
}

export default function LocationSelector({ 
  currentLocation, 
  onLocationSelect, 
  theme 
}: LocationSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);

  // Popular cities for quick selection
  const popularCities: Location[] = [
    { city: 'Istanbul', country: 'Turkey' },
    { city: 'Mecca', country: 'Saudi Arabia' },
    { city: 'Medina', country: 'Saudi Arabia' },
    { city: 'Cairo', country: 'Egypt' },
    { city: 'Dubai', country: 'UAE' },
    { city: 'Kuala Lumpur', country: 'Malaysia' },
    { city: 'Jakarta', country: 'Indonesia' },
    { city: 'Karachi', country: 'Pakistan' },
    { city: 'Lahore', country: 'Pakistan' },
    { city: 'Dhaka', country: 'Bangladesh' },
    { city: 'London', country: 'UK' },
    { city: 'New York', country: 'USA' },
    { city: 'Toronto', country: 'Canada' },
    { city: 'Sydney', country: 'Australia' },
  ];

  useEffect(() => {
    // Load recent locations from storage (you can implement this with AsyncStorage)
    loadRecentLocations();
  }, []);

  const loadRecentLocations = () => {
    // For now, we'll use a default list
    // In a real app, you'd load this from AsyncStorage
    setRecentLocations([
      { city: 'Mecca', country: 'Saudi Arabia' },
      { city: 'Medina', country: 'Saudi Arabia' },
    ]);
  };

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await prayerTimeApi.searchCities(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching cities:', error);
      // Fallback to filtering popular cities
      const filtered = popularCities.filter(city => 
        city.city.toLowerCase().includes(query.toLowerCase()) ||
        city.country.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
    setIsModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Add to recent locations
    const updatedRecent = [location, ...recentLocations.filter(loc => 
      loc.city !== location.city || loc.country !== location.country
    )].slice(0, 5); // Keep only 5 recent locations
    
    setRecentLocations(updatedRecent);
    // In a real app, save to AsyncStorage
  };

  const getThemeColors = () => {
    if (theme === 'light') {
      return {
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#333333',
        textSecondary: '#666666',
        border: '#e0e0e0',
        primary: '#007bff',
        icon: '#666666',
      };
    }
    return {
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#404040',
      primary: '#ffd700',
      icon: '#b0b0b0',
    };
  };

  const colors = getThemeColors();

  return (
    <>
      {/* Location Display Button */}
      <TouchableOpacity
        style={[styles.locationButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <View style={styles.locationText}>
            <Text style={[styles.cityName, { color: colors.text }]}>
              {currentLocation ? currentLocation.city : 'Select Location'}
            </Text>
            <Text style={[styles.countryName, { color: colors.textSecondary }]}>
              {currentLocation ? currentLocation.country : 'Tap to choose'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.icon} />
      </TouchableOpacity>

      {/* Location Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Location
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.icon} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search for a city..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchCities(text);
              }}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Search Results */}
            {searchResults.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Search Results
                </Text>
                {searchResults.map((location, index) => (
                  <TouchableOpacity
                    key={`${location.city}-${location.country}-${index}`}
                    style={[styles.locationItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleLocationSelect(location)}
                  >
                    <View style={styles.locationItemContent}>
                      <Ionicons name="location-outline" size={20} color={colors.primary} />
                      <View style={styles.locationItemText}>
                        <Text style={[styles.locationItemCity, { color: colors.text }]}>
                          {location.city}
                        </Text>
                        <Text style={[styles.locationItemCountry, { color: colors.textSecondary }]}>
                          {location.country}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent Locations */}
            {recentLocations.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Recent Locations
                </Text>
                {recentLocations.map((location, index) => (
                  <TouchableOpacity
                    key={`recent-${location.city}-${location.country}-${index}`}
                    style={[styles.locationItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleLocationSelect(location)}
                  >
                    <View style={styles.locationItemContent}>
                      <Ionicons name="time-outline" size={20} color={colors.primary} />
                      <View style={styles.locationItemText}>
                        <Text style={[styles.locationItemCity, { color: colors.text }]}>
                          {location.city}
                        </Text>
                        <Text style={[styles.locationItemCountry, { color: colors.textSecondary }]}>
                          {location.country}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Cities */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Popular Cities
              </Text>
              <View style={styles.popularGrid}>
                {popularCities.map((location, index) => (
                  <TouchableOpacity
                    key={`popular-${location.city}-${location.country}-${index}`}
                    style={[styles.popularItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleLocationSelect(location)}
                  >
                    <Text style={[styles.popularCity, { color: colors.text }]}>
                      {location.city}
                    </Text>
                    <Text style={[styles.popularCountry, { color: colors.textSecondary }]}>
                      {location.country}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  countryName: {
    fontSize: 14,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  locationItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationItemText: {
    marginLeft: 12,
    flex: 1,
  },
  locationItemCity: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationItemCountry: {
    fontSize: 14,
    marginTop: 2,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  popularCity: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  popularCountry: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
