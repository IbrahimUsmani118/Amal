// Voice Recognition Service - Temporarily disabled for core app functionality
// This will be re-enabled once Firebase authentication is working properly

// Voice Recognition Service - Temporarily disabled for core app functionality
// This will be re-enabled once Firebase authentication is working properly

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface QuranMatch {
  surah: number;
  ayah: number;
  surahName: string;
  ayahText: string;
  confidence: number;
}

class VoiceRecognitionService {
  private isListening: boolean = false;

  async requestPermissions(): Promise<boolean> {
    console.log('Voice recognition temporarily disabled');
    return false;
  }

  async startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onError: (error: string) => void
  ): Promise<boolean> {
    console.log('Voice recognition temporarily disabled');
    onError('Voice recognition is temporarily disabled. Please use text search instead.');
    return false;
  }

  async stopListening(): Promise<void> {
    this.isListening = false;
  }

  isActive(): boolean {
    return this.isListening;
  }

  async matchQuranText(transcript: string): Promise<QuranMatch | null> {
    console.log('Voice recognition temporarily disabled');
    return null;
  }

  private cleanArabicText(text: string): string {
    return text.trim();
  }
}

// Export a singleton instance
export const voiceRecognitionService = new VoiceRecognitionService();

// Hook for voice recognition events (disabled)
export const useVoiceRecognition = () => {
  return {
    isListening: false,
    startListening: async () => false,
    stopListening: async () => {},
    requestPermissions: async () => false,
  };
};

// Export the service class for future use
export { VoiceRecognitionService };
