// Qibla API Service using Aladhan API with enhanced accuracy
// API Documentation: https://api.aladhan.com/v1

export interface QiblaDirection {
  code: number;
  status: string;
  data: {
    latitude: number;
    longitude: number;
    direction: number;
    qibla_direction: number;
  };
}

export interface QiblaCompass {
  code: number;
  status: string;
  data: {
    latitude: number;
    longitude: number;
    direction: number;
    qibla_direction: number;
    compass_image: string;
  };
}

export interface QiblaError {
  message: string;
  code?: string;
}

class QiblaApiService {
  private baseUrl = 'https://api.aladhan.com/v1';
  
  // Kaaba coordinates (Mecca, Saudi Arabia)
  private readonly KAABA_LAT = 21.4225;
  private readonly KAABA_LNG = 39.8262;

  /**
   * Get qibla direction with enhanced accuracy
   * Uses the compass endpoint for better precision
   */
  async getQiblaDirection(latitude: number, longitude: number): Promise<QiblaDirection> {
    try {
      // First try the compass endpoint for better accuracy
      const compassResponse = await this.getQiblaCompass(latitude, longitude);
      
      // Convert compass response to direction format
      return {
        code: compassResponse.code,
        status: compassResponse.status,
        data: {
          latitude: compassResponse.data.latitude,
          longitude: compassResponse.data.longitude,
          direction: compassResponse.data.direction,
          qibla_direction: compassResponse.data.qibla_direction
        }
      };
    } catch (error) {
      console.log('Compass endpoint failed, trying basic endpoint:', error);
      
      // Fallback to basic endpoint
      try {
        const response = await fetch(`${this.baseUrl}/qibla/${latitude}/${longitude}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Basic API response:', data);
        
        // Handle the actual Aladhan API response format
        if (data && data.data) {
          return {
            code: data.code || 200,
            status: data.status || 'OK',
            data: {
              latitude: data.data.latitude || latitude,
              longitude: data.data.longitude || longitude,
              direction: data.data.direction || 0,
              qibla_direction: data.data.qibla_direction || data.data.direction || 0
            }
          };
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (fallbackError) {
        console.log('Both API endpoints failed, using local calculation:', fallbackError);
        
        // Final fallback: calculate locally
        return this.calculateQiblaDirectionLocally(latitude, longitude);
      }
    }
  }

  /**
   * Get qibla compass with enhanced accuracy
   */
  async getQiblaCompass(latitude: number, longitude: number): Promise<QiblaCompass> {
    try {
      const response = await fetch(`${this.baseUrl}/qibla/${latitude}/${longitude}/compass`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error('API returned error status');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching qibla compass:', error);
      throw new Error('Failed to fetch qibla compass');
    }
  }

  /**
   * Calculate qibla direction locally using Great Circle formula
   * This provides a mathematical fallback when API is unavailable
   */
  private calculateQiblaDirectionLocally(latitude: number, longitude: number): QiblaDirection {
    try {
      // Convert coordinates to radians
      const lat1 = this.deg2rad(latitude);
      const lon1 = this.deg2rad(longitude);
      const lat2 = this.deg2rad(this.KAABA_LAT);
      const lon2 = this.deg2rad(this.KAABA_LNG);
      
      // Calculate qibla direction using Great Circle formula
      const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
      
      let qiblaDirection = this.rad2deg(Math.atan2(y, x));
      
      // Normalize to 0-360 degrees
      qiblaDirection = (qiblaDirection + 360) % 360;
      
      // Calculate distance to Kaaba
      const distance = this.calculateDistance(latitude, longitude, this.KAABA_LAT, this.KAABA_LNG);
      
      console.log('Local qibla calculation:', {
        userLat: latitude,
        userLng: longitude,
        kaabaLat: this.KAABA_LAT,
        kaabaLng: this.KAABA_LNG,
        calculatedDirection: qiblaDirection,
        distance: distance
      });
      
      return {
        code: 200,
        status: 'OK',
        data: {
          latitude: latitude,
          longitude: longitude,
          direction: qiblaDirection,
          qibla_direction: qiblaDirection
        }
      };
    } catch (error) {
      console.error('Error in local qibla calculation:', error);
      
      // Ultimate fallback: return approximate direction
      return {
        code: 200,
        status: 'FALLBACK',
        data: {
          latitude: latitude,
          longitude: longitude,
          direction: 45, // Approximate NE direction
          qibla_direction: 45
        }
      };
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * More accurate than simple Euclidean distance
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Convert radians to degrees
   */
  private rad2deg(rad: number): number {
    return rad * (180/Math.PI);
  }

  /**
   * Format direction in degrees with cardinal directions
   * Enhanced precision for better user experience
   */
  formatDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return `${degrees.toFixed(1)}° ${directions[index]}`;
  }

  /**
   * Get cardinal direction from degrees
   */
  getCardinalDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Get detailed cardinal direction with precision
   */
  getDetailedCardinalDirection(degrees: number): string {
    const normalizedDegrees = ((degrees % 360) + 360) % 360;
    
    if (normalizedDegrees >= 337.5 || normalizedDegrees < 22.5) return 'North';
    if (normalizedDegrees >= 22.5 && normalizedDegrees < 67.5) return 'Northeast';
    if (normalizedDegrees >= 67.5 && normalizedDegrees < 112.5) return 'East';
    if (normalizedDegrees >= 112.5 && normalizedDegrees < 157.5) return 'Southeast';
    if (normalizedDegrees >= 157.5 && normalizedDegrees < 202.5) return 'South';
    if (normalizedDegrees >= 202.5 && normalizedDegrees < 247.5) return 'Southwest';
    if (normalizedDegrees >= 247.5 && normalizedDegrees < 292.5) return 'West';
    if (normalizedDegrees >= 292.5 && normalizedDegrees < 337.5) return 'Northwest';
    
    return 'North';
  }

  /**
   * Validate coordinates with enhanced checking
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180 &&
           !isNaN(latitude) && !isNaN(longitude);
  }

  /**
   * Get accuracy level based on calculation method
   */
  getAccuracyLevel(method: 'api' | 'compass' | 'local' | 'fallback'): string {
    switch (method) {
      case 'compass':
        return 'High (Compass API)';
      case 'api':
        return 'Medium (Basic API)';
      case 'local':
        return 'Medium (Local Calculation)';
      case 'fallback':
        return 'Low (Approximate)';
      default:
        return 'Unknown';
    }
  }
}

export const qiblaApi = new QiblaApiService();
export default QiblaApiService;
