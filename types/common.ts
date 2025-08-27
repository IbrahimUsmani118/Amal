// Common types used across the application

export interface Location {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface ApiError {
  message: string;
  code?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
