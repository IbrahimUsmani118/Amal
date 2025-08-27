// Qibla API Service using Aladhan API
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
  code?: number;
}

class QiblaApiService {
  private baseUrl = 'https://api.aladhan.com/v1';

  async getQiblaDirection(latitude: number, longitude: number): Promise<QiblaDirection> {
    try {
      const response = await fetch(`${this.baseUrl}/qibla/${latitude}/${longitude}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching qibla direction:', error);
      throw new Error('Failed to fetch qibla direction');
    }
  }

  async getQiblaCompass(latitude: number, longitude: number): Promise<QiblaCompass> {
    try {
      const response = await fetch(`${this.baseUrl}/qibla/${latitude}/${longitude}/compass`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching qibla compass:', error);
      throw new Error('Failed to fetch qibla compass');
    }
  }

  // Calculate distance between two points (Haversine formula)
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

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Format direction in degrees with cardinal directions
  formatDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return `${degrees.toFixed(1)}° ${directions[index]}`;
  }

  // Get cardinal direction from degrees
  getCardinalDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  // Validate coordinates
  validateCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }
}

export const qiblaApi = new QiblaApiService();
export default QiblaApiService;
