import { useColorScheme } from '@/hooks/useColorScheme';
import { QuranApiService } from '@/services/quranApi';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Model URL and local path
const MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin';
const MODEL_NAME = 'ggml-tiny.en.bin';
const MODEL_DIR = `${FileSystem.documentDirectory}whisper/`;

let WhisperRN = null;

// Dynamically import whisper.rn (only on native platforms)
if (Platform.OS !== 'web') {
  try {
    WhisperRN = require('whisper.rn');
  } catch (error) {
    console.warn('whisper.rn not available:', error);
  }
}

export default function WhisperRecorder({ onTranscript }) {
  const colorScheme = useColorScheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const whisperRef = useRef(null);
  const recordingRef = useRef(null);
  const quranApiRef = useRef(new QuranApiService());

  // Parse Quran voice commands
  const parseQuranCommand = React.useCallback((text) => {
    try {
      // Parse voice command for Quran navigation
      const command = quranApiRef.current.parseVoiceCommand(text);
      
      if (command.action === 'selectSurah') {
        console.log('🎤 Voice command recognized: Navigate to Surah', command.params.surahNumber);
        // You can emit an event or call a navigation callback here
      } else if (command.action === 'search') {
        console.log('🎤 Voice command recognized: Search for', command.params.keyword);
      } else if (command.action === 'selectAyah') {
        console.log('🎤 Voice command recognized: Navigate to Ayah', command.params.surahNumber, ':', command.params.ayahNumber);
      } else if (command.action !== 'unknown') {
        console.log('🎤 Voice command recognized:', command.action, command.params);
      }
    } catch (error) {
      console.error('Error parsing Quran command:', error);
    }
  }, []);

  // Initialize whisper.rn with the model
  const initializeWhisper = async (modelPath) => {
    if (!WhisperRN || Platform.OS === 'web') {
      setError('whisper.rn is only available on native platforms');
      return false;
    }

    try {
      // Initialize whisper with the model path
      whisperRef.current = new WhisperRN.WhisperContext(modelPath);
      setIsInitialized(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Failed to initialize whisper:', err);
      setError(`Failed to initialize: ${err.message}`);
      return false;
    }
  };

  // Check if model exists locally
  const checkModelExists = async () => {
    try {
      const modelPath = `${MODEL_DIR}${MODEL_NAME}`;
      const fileInfo = await FileSystem.getInfoAsync(modelPath);
      return fileInfo.exists;
    } catch (err) {
      console.error('Error checking model:', err);
      return false;
    }
  };

  // Download the model file
  const downloadModel = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setError(null);

    try {
      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
      }

      const modelPath = `${MODEL_DIR}${MODEL_NAME}`;

      // Download the model
      const downloadResumable = FileSystem.createDownloadResumable(
        MODEL_URL,
        modelPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${(progress * 100).toFixed(1)}%`);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.uri) {
        // Initialize whisper with the downloaded model
        await initializeWhisper(result.uri);
      } else {
        throw new Error('Download failed - no file URI returned');
      }
    } catch (err) {
      console.error('Error downloading model:', err);
      setError(`Download failed: ${err.message}`);
      Alert.alert('Download Error', `Failed to download model: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    const setup = async () => {
      if (Platform.OS === 'web') {
        setError('whisper.rn is only available on native platforms');
        return;
      }

      const exists = await checkModelExists();
      if (exists) {
        const modelPath = `${MODEL_DIR}${MODEL_NAME}`;
        await initializeWhisper(modelPath);
      }
    };

    setup();
  }, []);

  // Start recording and transcribing
  const startRecording = async () => {
    if (!isInitialized || !whisperRef.current) {
      Alert.alert('Not Ready', 'Whisper is not initialized. Please download the model first.');
      return;
    }

    try {
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone permission is required for speech-to-text.');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setIsRecording(true);
      setTranscript('');
      setError(null);

      // Start real-time transcription if available
      // Note: The exact API may vary based on whisper.rn version
      if (whisperRef.current.startRealtimeTranscription) {
        whisperRef.current.startRealtimeTranscription((text) => {
          setTranscript(text);
          if (onTranscript) {
            onTranscript(text);
          }
          // Parse voice command for Quran navigation
          parseQuranCommand(text);
        });
      } else {
        // Fallback: Record audio and transcribe
        await recordAudio();
      }
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(`Recording error: ${err.message}`);
      setIsRecording(false);
    }
  };

  // Record audio using expo-av
  const recordAudio = async () => {
    try {
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
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recordingRef.current = recording;
    } catch (err) {
      console.error('Error creating recording:', err);
      throw err;
    }
  };

  // Stop recording and transcribe
  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;

        if (uri && whisperRef.current) {
          // Transcribe the recorded audio
          // Note: The exact API may vary based on whisper.rn version
          if (whisperRef.current.transcribe) {
            const result = await whisperRef.current.transcribe(uri);
        if (result && result.text) {
          setTranscript(result.text);
          if (onTranscript) {
            onTranscript(result.text);
          }
          // Parse Quran command from transcribed text
          parseQuranCommand(result.text);
        }
          } else if (whisperRef.current.transcribeFile) {
            const result = await whisperRef.current.transcribeFile(uri);
        if (result && result.text) {
          setTranscript(result.text);
          if (onTranscript) {
            onTranscript(result.text);
          }
          // Parse Quran command from transcribed text
          parseQuranCommand(result.text);
        }
          }
        }
      }

      if (whisperRef.current && whisperRef.current.stopRealtimeTranscription) {
        whisperRef.current.stopRealtimeTranscription();
      }

      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError(`Stop error: ${err.message}`);
      setIsRecording(false);
    }
  };

  const handlePress = async () => {
    if (!isInitialized) {
      await downloadModel();
    } else if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const isDark = colorScheme === 'dark';
  const buttonStyle = [
    styles.button,
    isDark ? styles.darkButton : styles.lightButton,
    (!isInitialized && isDownloading) && styles.buttonDisabled,
  ];
  const buttonTextStyle = [
    styles.buttonText,
    isDark ? styles.darkButtonText : styles.lightButtonText,
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Whisper Speech-to-Text
      </ThemedText>

      {error && (
        <ThemedText style={[styles.errorText, isDark ? styles.darkErrorText : styles.lightErrorText]}>
          {error}
        </ThemedText>
      )}

      {!isInitialized && !isDownloading && (
        <ThemedText style={[styles.infoText, isDark ? styles.darkInfoText : styles.lightInfoText]}>
          Model not found. Tap the button to download.
        </ThemedText>
      )}

      {isDownloading && (
        <ThemedView style={styles.downloadContainer}>
          <ActivityIndicator size="small" color={isDark ? '#ffd700' : '#0a7ea4'} />
          <ThemedText style={[styles.downloadText, isDark ? styles.darkDownloadText : styles.lightDownloadText]}>
            Downloading model...
          </ThemedText>
        </ThemedView>
      )}

      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        disabled={isDownloading}
        activeOpacity={0.7}
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color={isDark ? '#1a1a2e' : '#1a1a2e'} />
        ) : (
          <ThemedText style={buttonTextStyle}>
            {!isInitialized
              ? 'Download Model'
              : isRecording
              ? 'Stop Recording'
              : 'Start Recording'}
          </ThemedText>
        )}
      </TouchableOpacity>

      {isRecording && (
        <ThemedView style={styles.recordingIndicator}>
          <ActivityIndicator size="small" color="#ff6b6b" />
          <ThemedText style={[styles.recordingText, isDark ? styles.darkRecordingText : styles.lightRecordingText]}>
            Recording...
          </ThemedText>
        </ThemedView>
      )}

      {transcript && (
        <ThemedView style={styles.transcriptContainer}>
          <ThemedText type="subtitle" style={styles.transcriptTitle}>
            Transcript:
          </ThemedText>
          <ThemedText style={[styles.transcriptText, isDark ? styles.darkTranscriptText : styles.lightTranscriptText]}>
            {transcript}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    padding: 8,
    borderRadius: 6,
  },
  darkErrorText: {
    color: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  lightErrorText: {
    color: '#d32f2f',
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  darkInfoText: {
    color: '#b0b0b0',
  },
  lightInfoText: {
    color: '#6a6a6a',
  },
  downloadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  downloadText: {
    fontSize: 14,
  },
  darkDownloadText: {
    color: '#b0b0b0',
  },
  lightDownloadText: {
    color: '#6a6a6a',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  darkButton: {
    backgroundColor: '#ffd700',
  },
  lightButton: {
    backgroundColor: '#ffd700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  darkButtonText: {
    color: '#1a1a2e',
  },
  lightButtonText: {
    color: '#1a1a2e',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  darkRecordingText: {
    color: '#ff6b6b',
  },
  lightRecordingText: {
    color: '#d32f2f',
  },
  transcriptContainer: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  transcriptTitle: {
    marginBottom: 8,
    fontSize: 16,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
  },
  darkTranscriptText: {
    color: '#e8e8e8',
  },
  lightTranscriptText: {
    color: '#333',
  },
});

