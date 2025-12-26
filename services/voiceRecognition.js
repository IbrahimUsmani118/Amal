// Voice Recognition Service - Managed Workflow
// Uses Web Speech API for web and expo-av for mobile platforms
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Import interruption modes directly from expo-av (fixed import)
// Try direct import first, fallback to numeric values if not available
let InterruptionModeIOS, InterruptionModeAndroid;
try {
  // Try direct import from expo-av
  const avModule = require('expo-av');
  if (avModule.InterruptionModeIOS && avModule.InterruptionModeAndroid) {
    InterruptionModeIOS = avModule.InterruptionModeIOS;
    InterruptionModeAndroid = avModule.InterruptionModeAndroid;
    console.log('✅ Interruption modes imported successfully');
  } else {
    // Fallback: Use numeric values
    InterruptionModeIOS = { DoNotMix: 1, DuckOthers: 2 };
    InterruptionModeAndroid = { DoNotMix: 1, DuckOthers: 2 };
    console.log('⚠️ Using numeric fallback for interruption modes');
  }
} catch (e) {
  // Fallback: Use numeric values if enums aren't available
  // DoNotMix = 1, DuckOthers = 2
  InterruptionModeIOS = { DoNotMix: 1, DuckOthers: 2 };
  InterruptionModeAndroid = { DoNotMix: 1, DuckOthers: 2 };
  console.log('⚠️ Using numeric fallback for interruption modes (import failed)');
}

class VoiceRecognitionService {
  constructor() {
    this.isListening = false;
    this.isPreparing = false; // Flag to prevent double-triggering
    this.isUploading = false; // Flag to track upload status
    this.uploadProgress = 0; // Upload progress (0-100)
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.onProgressCallback = null; // Progress callback
    this.currentLanguage = 'en-US';
    this.recognition = null; // Web Speech API recognition instance
    this.recording = null; // expo-av recording instance
    this.recordingUri = null;
    this.supportedPlatforms = ['web', 'ios', 'android'];
  }

  // Check if Web Speech API is available (for web platform)
  isWebSpeechAvailable() {
    if (Platform.OS !== 'web') {
      return false;
    }
    try {
      return (
        typeof window !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        ('webkitSpeechRecognition' in window || 
         'SpeechRecognition' in window ||
         (window.SpeechRecognition !== undefined) ||
         (window.webkitSpeechRecognition !== undefined))
      );
    } catch (error) {
      console.warn('Error checking Web Speech API availability:', error);
      return false;
    }
  }

  // Initialize Web Speech API recognition
  initWebSpeechRecognition() {
    if (!this.isWebSpeechAvailable()) {
      return null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = this.currentLanguage;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResultCallback) {
        this.onResultCallback({
          transcript: finalTranscript || interimTranscript,
          isFinal: !!finalTranscript,
          confidence: 1.0,
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
      this.isListening = false;
    };

    recognition.onend = () => {
      if (this.isListening) {
        // Restart if still listening (continuous mode)
        try {
          recognition.start();
        } catch (error) {
          console.log('Recognition already started or ended');
        }
      } else {
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      }
    };

    return recognition;
  }

  // Start listening for voice input
  async startListening(language = 'en-US') {
    try {
      if (this.isListening) {
        console.log('Already listening');
        return true;
      }

      this.currentLanguage = language;

      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Web platform: Use Web Speech API
      if (Platform.OS === 'web' && this.isWebSpeechAvailable()) {
        this.recognition = this.initWebSpeechRecognition();
        if (this.recognition) {
          this.recognition.lang = language;
          this.recognition.start();
          this.isListening = true;
          console.log('🎤 Voice recognition started (Web Speech API)');
          return true;
        }
      }

      // Mobile platforms: Use expo-av for recording
      // Note: This records audio but requires a speech recognition API to process it
      // For now, we'll record and provide a way to process it
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        return await this.startMobileRecording(language);
      }

      // Fallback: Platform not supported
      console.warn('Voice recognition not available on this platform');
      Alert.alert(
        'Voice Recognition',
        'Voice recognition is not available on this platform. Please use the text input instead.',
        [
          {
            text: 'OK',
            onPress: () => {
              this.isListening = false;
              this.onEndCallback?.();
            },
          },
        ]
      );
      return false;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.isListening = false;
      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error.message : 'Unknown error');
      }
      return false;
    }
  }

  // Start mobile recording using expo-av
  // Fix for "recorder not prepared" crash with strict canRecord check
  async startMobileRecording(language = 'en-US') {
    // 1. Safety Check: Don't start if already busy
    if (this.isPreparing || this.recording) {
      console.warn('⚠️ Recorder is busy. Ignoring start request.');
      return false;
    }

    this.isPreparing = true;
    
    try {
      // 2. Permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission denied');
      }

      // 3. Audio Mode Setup (Crucial for iOS)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // 4. Cleanup any stuck recordings
      if (this.recording) {
        try { 
          await this.recording.stopAndUnloadAsync(); 
        } catch (e) { 
          // ignore cleanup errors 
        }
        this.recording = null;
      }

      // 5. Create & Prepare using createAsync (handles both prepare and start)
      // Use optimized recording options for speech recognition
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
      };
      
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      
      this.recording = recording;
      
      // 6. Verification check (The fix for your specific error)
      const statusCheck = await this.recording.getStatusAsync();
      if (!statusCheck.canRecord) {
        throw new Error('Recorder prepared but signal is not ready (canRecord=false)');
      }

      console.log('✅ Recorder started successfully');
      this.isListening = true;
      return true;

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      
      // Cleanup on failure
      this.recording = null;
      this.isListening = false;
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error.message);
      }
      return false;
    } finally {
      this.isPreparing = false; // Always release the lock
    }
  }

  // Process recorded audio - Generic Backend Implementation
  // Uploads audio to backend API for transcription
  async processRecording(uri, onProgress = null) {
    if (!uri) {
      console.warn('⚠️ No audio URI provided for processing');
      return;
    }

    console.log('📤 Uploading audio to backend:', uri);

    try {
      // Import backend API service
      const { backendApiService } = require('./backendApi');
      
      // Use backend API service for transcription with progress tracking
      const result = await backendApiService.transcribeAudio(
        uri,
        this.currentLanguage,
        onProgress
      );

      if (result.success) {
        console.log('✅ Transcription received:', result.text);

        // Send result back to UI
        if (this.onResultCallback) {
          this.onResultCallback({
            transcript: result.text,
            isFinal: true,
            confidence: result.confidence || 1.0,
          });
        }
      } else {
        throw new Error(result.error || 'Transcription failed');
      }

    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      // Retry logic (optional - can be enhanced)
      if (this.onErrorCallback) {
        this.onErrorCallback('Transcription failed: ' + error.message);
      }
    }
  }

  // Process and handle recording completion
  async processRecordingComplete(uri) {
    if (!uri) {
      return;
    }

    try {
      this.recordingUri = uri;
      this.isUploading = true;
      this.uploadProgress = 0;
      console.log('Recording saved to:', uri);

      // Process the recording with progress tracking
      await this.processRecording(uri, (progress) => {
        this.uploadProgress = progress;
        if (this.onProgressCallback) {
          this.onProgressCallback(progress);
        }
      });

      // Notify that recording is complete
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error.message);
      }
    } finally {
      this.isUploading = false;
      this.uploadProgress = 0;
    }
  }

  // Set progress callback
  setOnProgress(callback) {
    this.onProgressCallback = callback;
  }

  // Get upload status
  getUploadStatus() {
    return {
      isUploading: this.isUploading,
      progress: this.uploadProgress,
    };
  }

  // Stop listening for voice input
  async stopListening() {
    try {
      if (!this.isListening && !this.isPreparing) {
        return;
      }

      this.isListening = false;
      this.isPreparing = false; // Reset preparing flag

      // Stop Web Speech API
      if (this.recognition) {
        this.recognition.stop();
        this.recognition = null;
        console.log('🎤 Voice recognition stopped (Web Speech API)');
        return;
      }

      // Stop mobile recording
      if (this.recording) {
        try {
          const recording = this.recording;
          this.recording = null; // Clear reference before stopping
          this.isListening = false;
          
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          
          // Process the recording if it exists
          if (uri) {
            await this.processRecordingComplete(uri);
          }
          
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
          });
          
          console.log('🎤 Recording stopped (mobile)');
        } catch (error) {
          console.error('Error stopping recording:', error);
          this.recording = null;
          this.isListening = false;
          if (this.onErrorCallback) {
            this.onErrorCallback(error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  // Request microphone permissions
  async requestPermissions() {
    try {
      // Web platform: Permissions are handled by the browser
      if (Platform.OS === 'web') {
        // Check if we can access the microphone
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          return true;
        } catch (error) {
          console.error('Microphone permission denied:', error);
          return false;
        }
      }

      // Mobile platforms: Use expo-av permissions
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
      }

      return false;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Check if voice recognition is available
  isAvailable() {
    // Web: Check for Web Speech API
    if (Platform.OS === 'web' && this.isWebSpeechAvailable()) {
      return true;
    }

    // Mobile: expo-av is available, but we need API integration for transcription
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return true; // Recording is available, transcription needs API
    }

    return false;
  }

  // Check if currently listening
  getIsListening() {
    return this.isListening;
  }

  // Set result callback
  setOnResult(callback) {
    this.onResultCallback = callback;
  }

  // Set error callback
  setOnError(callback) {
    this.onErrorCallback = callback;
  }

  // Set end callback
  setOnEnd(callback) {
    this.onEndCallback = callback;
  }

  // Test backend connection
  async testBackendConnection() {
    try {
      const { backendApiService } = require('./backendApi');
      return await backendApiService.testConnection();
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Text-to-speech functionality
  async speakText(text, language = 'en-US') {
    try {
      await Speech.speak(text, {
        language,
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }

  // Stop speaking
  async stopSpeaking() {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  // Get environment status for debugging
  getEnvironmentStatus() {
    const isWebSpeech = Platform.OS === 'web' && this.isWebSpeechAvailable();
    const isMobileRecording = (Platform.OS === 'ios' || Platform.OS === 'android');
    
    return {
      platform: Platform.OS,
      voiceAvailable: this.isAvailable(),
      isListening: this.isListening,
      currentLanguage: this.currentLanguage,
      method: isWebSpeech ? 'Web Speech API' : isMobileRecording ? 'expo-av Recording' : 'Not Available',
      hasRecognition: !!this.recognition,
      hasRecording: !!this.recording,
    };
  }

  // Cleanup
  destroy() {
    this.stopListening();
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
  }
}

// Create singleton instance
const voiceRecognitionService = new VoiceRecognitionService();

// Custom hook for voice recognition
export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsAvailable(voiceRecognitionService.isAvailable());
    
    // Set up callbacks
    voiceRecognitionService.setOnResult((result) => {
      setCurrentTranscript(result.transcript);
      if (result.isFinal) {
        setIsListening(false);
      }
    });

    voiceRecognitionService.setOnError((error) => {
      setError(error);
      setIsListening(false);
    });

    voiceRecognitionService.setOnEnd(() => {
      setIsListening(false);
    });

    return () => {
      voiceRecognitionService.destroy();
    };
  }, []);

  const startListening = async (language = 'en-US') => {
    setError(null);
    setCurrentTranscript('');
    const success = await voiceRecognitionService.startListening(language);
    if (success) {
      setIsListening(true);
    }
    return success;
  };

  const stopListening = async () => {
    await voiceRecognitionService.stopListening();
    setIsListening(false);
  };

  const requestPermissions = async () => {
    return await voiceRecognitionService.requestPermissions();
  };

  const speakText = async (text, language = 'en-US') => {
    await voiceRecognitionService.speakText(text, language);
  };

  const stopSpeaking = async () => {
    await voiceRecognitionService.stopSpeaking();
  };

  const getEnvironmentStatus = () => {
    return voiceRecognitionService.getEnvironmentStatus();
  };

  return {
    isListening,
    isAvailable,
    currentTranscript,
    error,
    startListening,
    stopListening,
    requestPermissions,
    speakText,
    stopSpeaking,
    getEnvironmentStatus,
  };
};

// Export the service class and instance
export { VoiceRecognitionService, voiceRecognitionService };

