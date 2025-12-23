// Secure Storage Service
// Handles persistent storage of authentication tokens and user data
// Uses expo-secure-store for sensitive data (JWT tokens)
// Falls back to AsyncStorage for non-sensitive data

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const REFRESH_TOKEN_KEY = 'refresh_token';

class SecureStorageService {
  // Store authentication token securely
  async storeToken(token) {
    try {
      if (!token) {
        console.warn('⚠️ Attempted to store empty token');
        return false;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('✅ Token stored securely');
      return true;
    } catch (error) {
      console.error('❌ Error storing token:', error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        console.log('⚠️ Token stored in AsyncStorage (fallback)');
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback storage also failed:', fallbackError);
        return false;
      }
    }
  }

  // Retrieve authentication token
  async getToken() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        console.log('✅ Token retrieved from secure storage');
        return token;
      }
      // Fallback to AsyncStorage
      const fallbackToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (fallbackToken) {
        console.log('⚠️ Token retrieved from AsyncStorage (fallback)');
        return fallbackToken;
      }
      return null;
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      // Try AsyncStorage fallback
      try {
        const fallbackToken = await AsyncStorage.getItem(TOKEN_KEY);
        return fallbackToken;
      } catch (fallbackError) {
        console.error('❌ Fallback retrieval also failed:', fallbackError);
        return null;
      }
    }
  }

  // Store refresh token securely
  async storeRefreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        return false;
      }
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      console.log('✅ Refresh token stored securely');
      return true;
    } catch (error) {
      console.error('❌ Error storing refresh token:', error);
      try {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback storage failed:', fallbackError);
        return false;
      }
    }
  }

  // Retrieve refresh token
  async getRefreshToken() {
    try {
      const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (token) return token;
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Error retrieving refresh token:', error);
      try {
        return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      } catch (fallbackError) {
        return null;
      }
    }
  }

  // Store user data (non-sensitive, can use AsyncStorage)
  async storeUserData(userData) {
    try {
      const userDataString = JSON.stringify(userData);
      await AsyncStorage.setItem(USER_KEY, userDataString);
      console.log('✅ User data stored');
      return true;
    } catch (error) {
      console.error('❌ Error storing user data:', error);
      return false;
    }
  }

  // Retrieve user data
  async getUserData() {
    try {
      const userDataString = await AsyncStorage.getItem(USER_KEY);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('✅ User data retrieved');
        return userData;
      }
      return null;
    } catch (error) {
      console.error('❌ Error retrieving user data:', error);
      return null;
    }
  }

  // Clear all authentication data
  async clearAuthData() {
    try {
      // Clear secure storage
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      
      // Clear AsyncStorage
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
      
      console.log('✅ All auth data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      // Try to clear AsyncStorage as fallback
      try {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback clear also failed:', fallbackError);
        return false;
      }
    }
  }

  // Check if user is logged in (has stored token)
  async isLoggedIn() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const secureStorageService = new SecureStorageService();
export default secureStorageService;

