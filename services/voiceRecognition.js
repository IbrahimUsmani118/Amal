// Voice Recognition Service - Managed Workflow
// Uses Web Speech API for web and expo-av for mobile platforms
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Import interruption modes - try direct import first, fallback to numeric values
let InterruptionModeIOS, InterruptionModeAndroid;
try {
  // Try importing from expo-av (SDK 48+)
  const avModule = require('expo-av');
  InterruptionModeIOS = avModule.InterruptionModeIOS;
  InterruptionModeAndroid = avModule.InterruptionModeAndroid;
} catch (e) {
  // Fallback: Use numeric values if enums aren't available
  // DoNotMix = 1, DuckOthers = 2
  InterruptionModeIOS = { DoNotMix: 1, DuckOthers: 2 };
  InterruptionModeAndroid = { DoNotMix: 1, DuckOthers: 2 };
}

class VoiceRecognitionService {
  constructor() {
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
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
  async startMobileRecording(language = 'en-US') {
    try {
      // Check if recording is already in progress to prevent collisions
      if (this.isListening || this.recording) {
        console.warn('⚠️ Recording already in progress, stopping existing recording first');
        try {
          await this.stopListening();
          // Small delay to ensure cleanup completes
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (stopError) {
          console.warn('Error stopping existing recording:', stopError);
        }
      }

      // Step 1: Request and await permissions FIRST
      console.log('🔐 Requesting audio recording permissions...');
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        const errorMsg = 'Audio recording permission denied';
        console.error('❌', errorMsg);
        if (this.onErrorCallback) {
          this.onErrorCallback(errorMsg);
        }
        return false;
      }
      console.log('✅ Audio permissions granted');

      // Step 2: Configure audio mode with PlayAndRecord category BEFORE any recording operations
      // This sets the audio session to 'Active' and category to 'PlayAndRecord' for iOS
      console.log('🎵 Configuring audio session...');
      try {
        // Build minimal audio mode config (avoid interruption modes that might cause issues)
        const audioModeConfig = {
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        };

        // Only add interruption modes if they're properly available
        try {
          const iosMode = InterruptionModeIOS?.DoNotMix ?? 1;
          const androidMode = InterruptionModeAndroid?.DoNotMix ?? 1;
          audioModeConfig.interruptionModeIOS = iosMode;
          audioModeConfig.interruptionModeAndroid = androidMode;
        } catch (modeError) {
          console.warn('⚠️ Could not set interruption modes, continuing without them:', modeError);
        }

        await Audio.setAudioModeAsync(audioModeConfig);
        console.log('✅ Audio session configured successfully');
        
        // CRITICAL: Wait for audio session to fully activate before proceeding
        // This is essential for iOS - the session needs time to become active
        console.log('⏳ Waiting for audio session to activate...');
        await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
        
        console.log('✅ Audio session should now be active');
      } catch (audioModeError) {
        console.error('❌ Failed to configure audio mode:', audioModeError);
        // Try minimal configuration as fallback
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
          console.log('✅ Audio session configured (minimal config)');
          // Still wait for session activation
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (fallbackError) {
          console.error('❌ Fallback audio configuration also failed:', fallbackError);
          if (this.onErrorCallback) {
            this.onErrorCallback(`Audio configuration failed: ${fallbackError.message}`);
          }
          return false;
        }
      }

      // Step 3: Create recording options optimized for speech recognition
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
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      // Step 4: Create recording with proper initialization flow
      // Recommended flow: Request Permissions → Set Mode → Wait → Initialize Recording
      let recording = null;
      
      // Log recorder status before attempting to create
      console.log('📝 Pre-recording status check:');
      console.log('  - isListening:', this.isListening);
      console.log('  - existing recording:', !!this.recording);
      console.log('  - Platform:', Platform.OS);
      
      // Try the simplest approach first: createAsync with minimal options
      // This is the most reliable method according to expo-av docs
      try {
        console.log('🎤 Attempting to create recording with createAsync...');
        
        // Use createAsync - it handles preparation internally
        // Pass null for onRecordingStatusUpdate to reduce overhead
        const result = await Audio.Recording.createAsync(
          recordingOptions,
          null, // No status callback to reduce overhead
          0 // No update interval
        );
        
        recording = result.recording;
        
        // Verify recording object exists
        if (!recording) {
          throw new Error('Recording object is null after createAsync');
        }
        
        // Verify recording has required methods
        if (typeof recording.startAsync !== 'function') {
          throw new Error('Recording object missing startAsync method');
        }
        
        // Wait a bit to ensure recording is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✅ Recording created successfully with createAsync');
        console.log('📊 Recorder verified:', {
          exists: !!recording,
          hasStartMethod: typeof recording.startAsync === 'function',
          hasStopMethod: typeof recording.stopAndUnloadAsync === 'function'
        });
        
      } catch (createError) {
        console.error('❌ createAsync failed:', createError.message);
        console.error('📝 Error code:', createError.code);
        
        // If createAsync fails, the audio session might not be ready
        // Try resetting audio mode and retrying once
        if (createError.code === 'E_AUDIO_RECORDERNOTCREATED' || 
            createError.message.includes('not prepared')) {
          console.log('🔄 Audio session issue detected, resetting and retrying...');
          
          try {
            // Reset audio mode
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Reconfigure for recording
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
              staysActiveInBackground: false,
              shouldDuckAndroid: true,
              playThroughEarpieceAndroid: false,
            });
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Retry createAsync
            console.log('🔄 Retrying createAsync after audio reset...');
            const retryResult = await Audio.Recording.createAsync(
              recordingOptions,
              null,
              0
            );
            
            recording = retryResult.recording;
            if (recording) {
              console.log('✅ Recording created successfully after retry');
              await new Promise(resolve => setTimeout(resolve, 100));
            } else {
              throw new Error('Recording is null after retry');
            }
            
          } catch (retryError) {
            console.error('❌ Retry also failed:', retryError.message);
            // Fall through to manual preparation
            recording = null;
          }
        }
        
        // If still no recording, try manual preparation as last resort
        if (!recording) {
          console.log('🔄 Attempting manual prepareAsync as last resort...');
          try {
            recording = new Audio.Recording();
            
            if (!recording) {
              throw new Error('Failed to create Recording instance');
            }
            
            // Prepare with explicit await
            console.log('🎤 Preparing recorder...');
            await recording.prepareToRecordAsync(recordingOptions);
            console.log('✅ Recorder prepared');
            
            // Wait for preparation to complete
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Start recording
            console.log('🎤 Starting recording...');
            await recording.startAsync();
            console.log('✅ Recording started with manual preparation');
            
          } catch (prepareError) {
            console.error('❌ All recording methods failed');
            console.error('📝 Final error:', {
              message: prepareError.message,
              code: prepareError.code
            });
            
            // Clean up
            if (recording) {
              try {
                // Don't try to unload if not prepared
                if (prepareError.message && !prepareError.message.includes('not prepared')) {
                  await recording.stopAndUnloadAsync();
                }
              } catch (cleanupError) {
                // Ignore cleanup errors
              }
              recording = null;
            }
            
            if (this.onErrorCallback) {
              this.onErrorCallback(`Recording failed: ${prepareError.message}`);
            }
            return false;
          }
        }
      }

      // Step 5: Verify recording was created and is ready
      if (!recording) {
        const errorMsg = 'Recording object is null after creation';
        console.error('❌', errorMsg);
        if (this.onErrorCallback) {
          this.onErrorCallback(errorMsg);
        }
        return false;
      }

      // Final verification: Check if recording has the necessary methods
      if (typeof recording.startAsync !== 'function' || 
          typeof recording.stopAndUnloadAsync !== 'function') {
        const errorMsg = 'Recording object is missing required methods';
        console.error('❌', errorMsg);
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) {
          // Ignore cleanup errors
        }
        if (this.onErrorCallback) {
          this.onErrorCallback(errorMsg);
        }
        return false;
      }

      // Store recording reference and update state
      this.recording = recording;
      this.isListening = true;
      console.log('🎤 Recording started successfully (mobile)');
      console.log('📊 Final recorder status:', {
        isListening: this.isListening,
        hasRecording: !!this.recording,
        hasStartMethod: typeof this.recording?.startAsync === 'function',
        hasStopMethod: typeof this.recording?.stopAndUnloadAsync === 'function'
      });
      
      // Note: Mobile recording works, but transcription requires a speech recognition API
      // For web, Web Speech API provides real-time transcription
      // For mobile, you can integrate with:
      // - Google Cloud Speech-to-Text API
      // - AWS Transcribe
      // - Azure Speech Services
      // - Or use whisper.rn for offline speech-to-text

      return true;
    } catch (error) {
      console.error('❌ Error starting mobile recording:', error);
      console.error('📝 Error stack:', error.stack);
      this.isListening = false;
      this.recording = null;
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error.message || 'Failed to start recording');
      }
      return false;
    }
  }

  // Process recorded audio (placeholder for API integration)
  async processRecording(uri) {
    // This is where you would integrate with a speech recognition API
    // Example integration points:
    // 1. Google Cloud Speech-to-Text
    // 2. AWS Transcribe
    // 3. Azure Speech Services
    // 4. Or use development build with native modules
    
    console.log('Audio recorded at:', uri);
    console.log('To enable transcription, integrate with a speech recognition API');
    
    // For now, return empty transcript
    // In production, you would:
    // 1. Read the audio file
    // 2. Send it to your speech recognition API
    // 3. Get the transcript
    // 4. Call this.onResultCallback with the result
    
    return null;
  }

  // Process and handle recording completion
  async processRecordingComplete(uri) {
    if (!uri) {
      return;
    }

    try {
      this.recordingUri = uri;
      console.log('Recording saved to:', uri);

      // Process the recording (integrate with API here)
      await this.processRecording(uri);

      // Notify that recording is complete
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error.message);
      }
    }
  }

  // Stop listening for voice input
  async stopListening() {
    try {
      if (!this.isListening) {
        return;
      }

      this.isListening = false;

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

