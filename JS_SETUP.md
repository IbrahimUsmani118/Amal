# Amal App - JavaScript Setup Guide

## 🎯 Overview
This app has been successfully converted from TypeScript to JavaScript and includes full voice recognition capabilities for Quran recitation and navigation.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
expo start
```

### 3. Run on Device
- **iOS**: Press `i` in terminal or scan QR code with Expo Go
- **Android**: Press `a` in terminal or scan QR code with Expo Go

## 🎤 Voice Recognition Features

### Available Voice Commands
- **Surah Selection**: "Surah 1", "Chapter 2", "Go to surah 3"
- **Search**: "Search for mercy", "Find forgiveness"
- **Ayah Selection**: "Ayah 1:1", "Verse 2:255"
- **Navigation**: "Next", "Previous", "Forward", "Back"

### Voice Recognition Setup
The app uses two voice recognition libraries:
- **iOS**: `@react-native-voice/voice`
- **Android**: `react-native-speech-to-text`

### Permissions Required
- **iOS**: Microphone and Speech Recognition permissions
- **Android**: RECORD_AUDIO permission

## 📱 App Structure

### Main Tabs
1. **Quran** - Voice-enabled Quran reader with recitation tracking
2. **Prayer Times** - Location-based prayer times
3. **Qibla** - Compass pointing to Mecca
4. **Settings** - App preferences and voice settings

### Key Features
- **Voice Recognition**: Speak to navigate and search Quran
- **Text-to-Speech**: Have verses read aloud
- **Prayer Times**: Accurate times based on location
- **Qibla Compass**: Real-time direction to Mecca
- **Offline Support**: Works without internet connection

## 🔧 Technical Details

### File Structure
```
app/
├── (tabs)/
│   ├── quran.js          # Main Quran reader with voice
│   ├── prayer-times.js   # Prayer times display
│   ├── qibla.js          # Qibla compass
│   └── settings.js       # App settings
├── _layout.js            # Root layout
└── index.js              # Landing page

services/
├── voiceRecognition.js   # Voice recognition service
├── quranApi.js          # Quran API calls
├── prayerTimeApi.js     # Prayer times API
├── qiblaApi.js          # Qibla direction API
└── firebase.js          # Authentication

contexts/
├── AuthContext.js        # User authentication
└── ThemeContext.js       # Theme management
```

### Voice Recognition Service
The `VoiceRecognitionService` class provides:
- Cross-platform voice recognition
- Text-to-speech functionality
- Permission handling
- Error management
- Real-time transcription

### Usage Example
```javascript
import { useVoiceRecognition } from '@/services/voiceRecognition.js';

const { 
  isListening, 
  startListening, 
  stopListening, 
  currentTranscript 
} = useVoiceRecognition();

// Start listening
await startListening('en-US');

// Stop listening
await stopListening();
```

## 🐛 Troubleshooting

### Common Issues

1. **Voice Recognition Not Working**
   - Check microphone permissions
   - Ensure device has internet connection
   - Try restarting the app

2. **App Won't Start**
   - Clear cache: `expo start --clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

3. **Import Errors**
   - All imports now use `.js` extensions
   - Check file paths are correct

### Debug Mode
Enable debug logging by setting:
```javascript
console.log('Voice recognition status:', voiceService.getEnvironmentStatus());
```

## 📦 Dependencies

### Core Dependencies
- `expo` - React Native framework
- `expo-router` - File-based routing
- `expo-speech` - Text-to-speech
- `@react-native-voice/voice` - iOS voice recognition
- `react-native-speech-to-text` - Android voice recognition

### API Services
- `firebase` - Authentication
- `expo-location` - GPS location
- `expo-sensors` - Device sensors

## 🎨 Customization

### Voice Recognition Settings
Modify voice recognition behavior in `services/voiceRecognition.js`:
- Language settings
- Confidence thresholds
- Error handling

### UI Themes
Customize colors and themes in `constants/Colors.js` and `contexts/ThemeContext.js`

## 📱 Platform Support

### iOS
- Requires iOS 11.0+
- Uses native Speech Recognition framework
- Supports multiple languages

### Android
- Requires Android 6.0+ (API level 23)
- Uses Google Speech Recognition
- Requires Google Play Services

## 🔒 Privacy & Security

### Data Handling
- Voice data is processed locally on device
- No voice recordings are stored
- Location data is only used for prayer times and qibla

### Permissions
- Microphone: Required for voice recognition
- Location: Required for prayer times and qibla
- Network: Required for API calls

## 🚀 Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build
```bash
eas build --platform all
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the console logs
3. Test voice recognition in a quiet environment
4. Ensure all permissions are granted

---

**Note**: This app has been converted from TypeScript to JavaScript for easier maintenance and development. All voice recognition features are fully functional and ready to use.
