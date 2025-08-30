// Prayer Time API Service using Aladhan API (free, no authentication required)
// API Documentation: https://aladhan.com/prayer-times-api

export interface PrayerTime {
  name: string;
  time: string;
  date: string;
}

export interface PrayerTimesResponse {
  success: boolean;
  result: {
    city: string;
    country: string;
    date: string;
    times: PrayerTime[];
  };
}

import { Location } from '../types/common';

export interface PrayerTimeError {
  message: string;
  code?: string;
}

class PrayerTimeApiService {
  private baseUrl = 'https://api.aladhan.com/v1';

  /**
   * Get prayer times for a specific city
   */
  async getPrayerTimes(city: string, country?: string): Promise<PrayerTimesResponse> {
    try {
      // First, get coordinates for the city
      const coordinates = await this.getCityCoordinates(city, country);
      
      if (!coordinates) {
        throw new Error(`Could not find coordinates for ${city}, ${country || 'Unknown'}`);
      }

      // Get prayer times using coordinates
      return await this.getPrayerTimesByCoordinates(coordinates.lat, coordinates.lng);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'FETCH_ERROR'
      } as PrayerTimeError;
    }
  }

  /**
   * Get prayer times for coordinates
   */
  async getPrayerTimesByCoordinates(latitude: number, longitude: number): Promise<PrayerTimesResponse> {
    try {
      const today = new Date();
      const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      const url = `${this.baseUrl}/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=2`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error('Failed to fetch prayer times');
      }

      // Transform Aladhan API response to our format
      const timings = data.data.timings;
      const location = data.data.meta.timezone;
      
      const prayerTimes: PrayerTime[] = [
        { name: 'Fajr', time: timings.Fajr, date: today.toISOString().split('T')[0] },
        { name: 'Sunrise', time: timings.Sunrise, date: today.toISOString().split('T')[0] },
        { name: 'Dhuhr', time: timings.Dhuhr, date: today.toISOString().split('T')[0] },
        { name: 'Asr', time: timings.Asr, date: today.toISOString().split('T')[0] },
        { name: 'Maghrib', time: timings.Maghrib, date: today.toISOString().split('T')[0] },
        { name: 'Isha', time: timings.Isha, date: today.toISOString().split('T')[0] }
      ];

      return {
        success: true,
        result: {
          city: this.extractCityFromTimezone(location),
          country: this.extractCountryFromTimezone(location),
          date: today.toISOString().split('T')[0],
          times: prayerTimes
        }
      };
    } catch (error) {
      console.error('Error fetching prayer times by coordinates:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'COORDINATES_ERROR'
      } as PrayerTimeError;
    }
  }

  /**
   * Search for cities (if the API supports it)
   */
  async searchCities(query: string): Promise<Location[]> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10`; // Increased limit for more results
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        return [];
      }

      return data.map((item: any) => ({
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Error searching cities:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SEARCH_ERROR'
      } as PrayerTimeError;
    }
  }

  /**
   * Get city coordinates using OpenStreetMap Nominatim API (free)
   */
  private async getCityCoordinates(city: string, country?: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const searchQuery = country ? `${city}, ${country}` : city;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting city coordinates:', error);
      return null;
    }
  }

  /**
   * Extract city name from timezone string
   */
  private extractCityFromTimezone(timezone: string): string {
    const parts = timezone.split('/');
    return parts[parts.length - 1] || 'Unknown';
  }

  /**
   * Extract country from timezone string
   */
  private extractCountryFromTimezone(timezone: string): string {
    const parts = timezone.split('/');
    return parts[0] || 'Unknown';
  }

  /**
   * Get current prayer time based on current time
   */
  getCurrentPrayer(times: PrayerTime[]): PrayerTime | null {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes
    
    for (let i = 0; i < times.length; i++) {
      const prayerTime = times[i];
      const [hours, minutes] = prayerTime.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      if (prayerMinutes > currentTime) {
        return prayerTime;
      }
    }
    
    // If no prayer time found, return the first prayer of the next day
    return times[0] || null;
  }

  /**
   * Get next prayer time
   */
  getNextPrayer(times: PrayerTime[]): PrayerTime | null {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const prayer of times) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      if (prayerMinutes > currentTime) {
        return prayer;
      }
    }
    
    return null;
  }

  /**
   * Calculate time remaining until next prayer
   */
  getTimeUntilNextPrayer(times: PrayerTime[]): { hours: number; minutes: number } | null {
    const nextPrayer = this.getNextPrayer(times);
    if (!nextPrayer) return null;
    
    const now = new Date();
    const [hours, minutes] = nextPrayer.time.split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);
    
    // If prayer time has passed today, calculate for tomorrow
    if (prayerTime <= now) {
      prayerTime.setDate(prayerTime.getDate() + 1);
    }
    
    const diff = prayerTime.getTime() - now.getTime();
    const totalMinutes = Math.floor(diff / (1000 * 60));
    
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    };
  }

  /**
   * Format prayer time for display
   */
  formatPrayerTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Get prayer name in Arabic
   */
  getPrayerNameArabic(name: string): string {
    const prayerNames: { [key: string]: string } = {
      'Fajr': 'الفجر',
      'Sunrise': 'الشروق',
      'Dhuhr': 'الظهر',
      'Asr': 'العصر',
      'Maghrib': 'المغرب',
      'Isha': 'العشاء'
    };
    
    return prayerNames[name] || name;
  }
}

// Create and export a default instance
export const prayerTimeApi = new PrayerTimeApiService();

// Export the class for custom instances
export default PrayerTimeApiService;
