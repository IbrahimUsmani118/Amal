// Prayer Time API Service using CollectAPI
// API Documentation: https://collectapi.com/api/pray/all

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
  private baseUrl = 'https://api.collectapi.com';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get prayer times for a specific city
   */
  async getPrayerTimes(city: string, country?: string): Promise<PrayerTimesResponse> {
    try {
      const url = `${this.baseUrl}/pray/all?city=${encodeURIComponent(city)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `apikey ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch prayer times');
      }

      return data;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'FETCH_ERROR'
      } as PrayerTimeError;
    }
  }

  /**
   * Get prayer times for coordinates (if supported by the API)
   */
  async getPrayerTimesByCoordinates(latitude: number, longitude: number): Promise<PrayerTimesResponse> {
    try {
      const url = `${this.baseUrl}/pray/all?lat=${latitude}&lng=${longitude}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `apikey ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch prayer times');
      }

      return data;
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
      const url = `${this.baseUrl}/pray/cities?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `apikey ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to search cities');
      }

      return data.result || [];
    } catch (error) {
      console.error('Error searching cities:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SEARCH_ERROR'
      } as PrayerTimeError;
    }
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
// Note: You'll need to set your API key in your environment or config
const API_KEY = process.env.COLLECT_API_KEY || 'your_api_key_here';
export const prayerTimeApi = new PrayerTimeApiService(API_KEY);

// Export the class for custom instances
export default PrayerTimeApiService;
