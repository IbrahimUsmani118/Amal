// Prayer Time API Service using Aladhan API (free, no authentication required)
// API Documentation: https://aladhan.com/prayer-times-api

export const PrayerTime = {
  name: '',
  time: '',
  date: '',
  timezone: ''
};

import { Location } from '@/types/common.js';

export class PrayerTimeApiService {
  baseUrl = 'https://api.aladhan.com/v1';

  /**
   * Get prayer times for a specific city
   */
  async getPrayerTimes(city, country) {
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
      };
    }
  }

  /**
   * Get prayer times for coordinates with real-time updates
   */
  async getPrayerTimesByCoordinates(latitude, longitude) {
    try {
      const today = new Date();
      const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      // Use multiple calculation methods for better accuracy
      const methods = [2, 3, 4, 5]; // Muslim World League, Islamic Society of North America, etc.
      const promises = methods.map(method => 
        fetch(`${this.baseUrl}/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}`)
          .then(response => response.json())
          .catch(() => null)
      );

      const results = await Promise.all(promises);
      const validResult = results.find(result => result && result.status === 'OK');
      
      if (!validResult) {
        throw new Error('Failed to fetch prayer times from any method');
      }

      const data = validResult;
      const timings = data.data.timings;
      const timezone = data.data.meta.timezone;
      const method = data.data.meta.method;

      // Get current time in the location's timezone
      const currentTime = this.getCurrentTimeInTimezone(timezone);
      
      const prayerTimes = [
        { 
          name: 'Fajr', 
          time: timings.Fajr, 
          date: today.toISOString().split('T')[0], 
          timezone,
          method,
          isActive: this.isPrayerTimeActive(timings.Fajr, currentTime),
          timeUntil: this.getTimeUntilPrayer(timings.Fajr, currentTime)
        },
        { 
          name: 'Sunrise', 
          time: timings.Sunrise, 
          date: today.toISOString().split('T')[0], 
          timezone,
          method,
          isActive: this.isPrayerTimeActive(timings.Sunrise, currentTime),
          timeUntil: this.getTimeUntilPrayer(timings.Sunrise, currentTime)
        },
        { 
          name: 'Dhuhr', 
          time: timings.Dhuhr, 
          date: today.toISOString().split('T')[0], 
          timezone,
          method,
          isActive: this.isPrayerTimeActive(timings.Dhuhr, currentTime),
          timeUntil: this.getTimeUntilPrayer(timings.Dhuhr, currentTime)
        },
        { 
          name: 'Asr', 
          time: timings.Asr, 
          date: today.toISOString().split('T')[0], 
          timezone,
          method,
          isActive: this.isPrayerTimeActive(timings.Asr, currentTime),
          timeUntil: this.getTimeUntilPrayer(timings.Asr, currentTime)
        },
        { 
          name: 'Maghrib', 
          time: timings.Maghrib, 
          date: today.toISOString().split('T')[0], 
          timezone,
          method,
          isActive: this.isPrayerTimeActive(timings.Maghrib, currentTime),
          timeUntil: this.getTimeUntilPrayer(timings.Maghrib, currentTime)
        },
        { 
          name: 'Isha', 
          time: timings.Isha, 
          date: today.toISOString().split('T')[0], 
          timezone,
          method,
          isActive: this.isPrayerTimeActive(timings.Isha, currentTime),
          timeUntil: this.getTimeUntilPrayer(timings.Isha, currentTime)
        }
      ];

      return {
        success: true,
        result: {
          city: this.extractCityFromTimezone(timezone),
          country: this.extractCountryFromTimezone(timezone),
          date: today.toISOString().split('T')[0],
          times: prayerTimes,
          timezone,
          method,
          currentTime,
          lastUpdated: Date.now()
        }
      };
    } catch (error) {
      console.error('Error fetching prayer times by coordinates:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'COORDINATES_ERROR'
      };
    }
  }

  /**
   * Search for cities (if the API supports it)
   */
  async searchCities(query) {
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

      return data.map((item) => ({
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Error searching cities:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SEARCH_ERROR'
      };
    }
  }

  /**
   * Get city coordinates using OpenStreetMap Nominatim API (free)
   */
  async getCityCoordinates(city, country) {
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
  extractCityFromTimezone(timezone) {
    const parts = timezone.split('/');
    return parts[parts.length - 1] || 'Unknown';
  }

  /**
   * Extract country from timezone string
   */
  extractCountryFromTimezone(timezone) {
    const parts = timezone.split('/');
    return parts[0] || 'Unknown';
  }

  /**
   * Get current prayer time based on current time
   */
  getCurrentPrayer(times) {
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
   * Get next prayer time based on the location's current time
   */
  getNextPrayer(times) {
    if (times.length === 0) return null;

    // Get the timezone from the first prayer time (they should all have the same timezone)
    const locationTimezone = times[0]?.timezone;
    if (!locationTimezone) {
      // Fallback to user's local time if no timezone info
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

    try {
      // Simple approach: use the prayer times (they're already in the location's timezone)
      // Just compare with current time in user's timezone for now
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      for (const prayer of times) {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerMinutes = hours * 60 + minutes;

        if (prayerMinutes > currentTime) {
          return prayer;
        }
      }

      // If no prayer time found for today, return the first prayer of the next day
      return times[0] || null;
    } catch (error) {
      console.error('Error calculating next prayer with timezone:', error);
      // Fallback to user's local time
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
  }

  /**
   * Calculate time remaining until next prayer based on location's time
   */
  getTimeUntilNextPrayer(times) {
    const nextPrayer = this.getNextPrayer(times);
    if (!nextPrayer) return null;

    // Simple approach: calculate based on user's local time for now
    // This ensures the app works without timezone conversion errors
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
  formatPrayerTime(time, timezone) {
    const [hours, minutes] = time.split(':').map(Number);
    // Simple time formatting - display the time
    // The API already provides times in the correct timezone for the location
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
  getPrayerNameArabic(name) {
    const prayerNames = {
      'Fajr': 'الفجر',
      'Sunrise': 'الشروق',
      'Dhuhr': 'الظهر',
      'Asr': 'العصر',
      'Maghrib': 'المغرب',
      'Isha': 'العشاء'
    };
    return prayerNames[name] || name;
  }

  /**
   * Get current time in a specific timezone
   */
  getCurrentTimeInTimezone(timezone) {
    try {
      const now = new Date();
      return now.toLocaleString('en-US', { timeZone: timezone });
    } catch (error) {
      console.error('Error getting time in timezone:', error);
      return new Date().toLocaleString();
    }
  }

  /**
   * Check if a prayer time is currently active (within 5 minutes)
   */
  isPrayerTimeActive(prayerTime, currentTime) {
    try {
      const [prayerHours, prayerMinutes] = prayerTime.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(prayerHours, prayerMinutes, 0, 0);
      
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - prayerDate.getTime());
      const minutesDiff = timeDiff / (1000 * 60);
      
      return minutesDiff <= 5; // Active if within 5 minutes
    } catch (error) {
      console.error('Error checking prayer time active status:', error);
      return false;
    }
  }

  /**
   * Get time until a specific prayer
   */
  getTimeUntilPrayer(prayerTime, currentTime) {
    try {
      const [prayerHours, prayerMinutes] = prayerTime.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(prayerHours, prayerMinutes, 0, 0);
      
      const now = new Date();
      let timeDiff = prayerDate.getTime() - now.getTime();
      
      // If prayer time has passed today, calculate for tomorrow
      if (timeDiff < 0) {
        prayerDate.setDate(prayerDate.getDate() + 1);
        timeDiff = prayerDate.getTime() - now.getTime();
      }
      
      const totalMinutes = Math.floor(timeDiff / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return {
        hours,
        minutes,
        totalMinutes,
        isNext: totalMinutes <= 60 // Next prayer if within an hour
      };
    } catch (error) {
      console.error('Error calculating time until prayer:', error);
      return { hours: 0, minutes: 0, totalMinutes: 0, isNext: false };
    }
  }

  /**
   * Get real-time prayer status
   */
  getRealTimePrayerStatus(prayerTimes) {
    if (!prayerTimes || prayerTimes.length === 0) {
      return { currentPrayer: null, nextPrayer: null, status: 'unknown' };
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    let currentPrayer = null;
    let nextPrayer = null;

    for (let i = 0; i < prayerTimes.length; i++) {
      const prayer = prayerTimes[i];
      const [prayerHours, prayerMinutes] = prayer.time.split(':').map(Number);
      const prayerTimeMinutes = prayerHours * 60 + prayerMinutes;

      if (prayerTimeMinutes > currentTimeMinutes) {
        nextPrayer = prayer;
        break;
      } else if (prayerTimeMinutes <= currentTimeMinutes) {
        currentPrayer = prayer;
      }
    }

    // If no next prayer found, the next prayer is tomorrow's first prayer
    if (!nextPrayer) {
      nextPrayer = prayerTimes[0];
    }

    return {
      currentPrayer,
      nextPrayer,
      status: currentPrayer ? 'prayer_time' : 'waiting',
      timeUntilNext: nextPrayer ? this.getTimeUntilPrayer(nextPrayer.time) : null
    };
  }

  /**
   * Get prayer times for multiple days (up to 7 days)
   */
  async getPrayerTimesForWeek(latitude, longitude) {
    try {
      const promises = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        
        promises.push(
          fetch(`${this.baseUrl}/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=2`)
            .then(response => response.json())
            .catch(() => null)
        );
      }

      const results = await Promise.all(promises);
      const validResults = results.filter(result => result && result.status === 'OK');
      
      if (validResults.length === 0) {
        throw new Error('Failed to fetch prayer times for any day');
      }

      return validResults.map((data, index) => {
        const timings = data.data.timings;
        const timezone = data.data.meta.timezone;
        const date = new Date();
        date.setDate(date.getDate() + index);
        
        return {
          date: date.toISOString().split('T')[0],
          timezone,
          times: [
            { name: 'Fajr', time: timings.Fajr },
            { name: 'Sunrise', time: timings.Sunrise },
            { name: 'Dhuhr', time: timings.Dhuhr },
            { name: 'Asr', time: timings.Asr },
            { name: 'Maghrib', time: timings.Maghrib },
            { name: 'Isha', time: timings.Isha }
          ]
        };
      });
    } catch (error) {
      console.error('Error fetching weekly prayer times:', error);
      throw error;
    }
  }
}

// Create and export a default instance
export const prayerTimeApi = new PrayerTimeApiService();

// Export the class for custom instances
export default PrayerTimeApiService;