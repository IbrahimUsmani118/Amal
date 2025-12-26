// Backend API Service
// Centralized service for all backend API calls
import Constants from 'expo-constants';

class BackendApiService {
  constructor() {
    // Get API URL from environment or use default
    this.baseURL = 
      Constants.expoConfig?.extra?.transcribeApiUrl ||
      process.env.EXPO_PUBLIC_TRANSCRIBE_API_URL ||
      'http://localhost:3000';
    
    // Remove trailing slash
    this.baseURL = this.baseURL.replace(/\/$/, '');
    
    console.log('🔗 Backend API URL:', this.baseURL);
  }

  // Test backend connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
      return { success: false, error: 'Health check failed' };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload audio for transcription with progress tracking and retry logic
  async transcribeAudio(audioUri, language = 'en-US', onProgress = null, maxRetries = 2) {
    let lastError = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retrying transcription (attempt ${attempt + 1}/${maxRetries + 1})...`);
          // Exponential backoff: wait 1s, 2s, 4s...
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }

        // Create FormData
        const formData = new FormData();
        
        formData.append('audio', {
          uri: audioUri,
          type: 'audio/m4a',
          name: 'upload.m4a',
        });
        
        formData.append('language', language);

        // Create XMLHttpRequest for progress tracking
        const result = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Track upload progress
          if (onProgress) {
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                onProgress(percentComplete);
              }
            });
          }

          // Handle response
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve({
                  success: true,
                  text: response.text,
                  confidence: response.confidence || 1.0,
                  language: response.language || language,
                  timestamp: response.timestamp,
                });
              } catch (parseError) {
                reject(new Error('Failed to parse response: ' + parseError.message));
              }
            } else {
              // Don't retry on 4xx errors (client errors)
              if (xhr.status >= 400 && xhr.status < 500) {
                try {
                  const errorResponse = JSON.parse(xhr.responseText);
                  reject(new Error(errorResponse.message || errorResponse.error || 'Upload failed'));
                } catch {
                  reject(new Error(`Upload failed with status ${xhr.status}`));
                }
              } else {
                // Retry on 5xx errors (server errors)
                reject(new Error(`Server error: ${xhr.status}`));
              }
            }
          });

          // Handle errors
          xhr.addEventListener('error', () => {
            reject(new Error('Network error: Could not connect to server'));
          });

          xhr.addEventListener('timeout', () => {
            reject(new Error('Request timeout: Server took too long to respond'));
          });

          // Open and send request
          xhr.open('POST', `${this.baseURL}/transcribe`);
          xhr.timeout = 60000; // 60 second timeout
          xhr.send(formData);
        });

        return result;
      } catch (error) {
        lastError = error;
        console.error(`❌ Transcription attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry on certain errors
        if (error.message.includes('Failed to parse') || 
            error.message.includes('No audio file') ||
            attempt === maxRetries) {
          throw error;
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('Transcription failed after all retries');
  }

  // Get server status and info
  async getServerInfo() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to get server info');
    } catch (error) {
      console.error('❌ Server info request failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const backendApiService = new BackendApiService();

export { BackendApiService, backendApiService };

