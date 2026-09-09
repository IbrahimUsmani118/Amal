# Amal Quran App - Setup Guide

## Overview

Amal is a Quran reader app with voice recognition, prayer times, and Qibla compass features.

## Features

- **Quran Reading** - Browse all 114 surahs with Arabic text and translations
- **Voice Navigation** - Navigate by speaking surah names or reciting verses
- **Prayer Times** - Location-based daily prayer schedule
- **Qibla Direction** - Compass pointing to the Kaaba
- **User Authentication** - Firebase-based login/signup

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (for testing on device)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Amal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Copy your Firebase config to `services/firebase.js`

See `FIREBASE_SETUP.md` for detailed instructions.

### 4. Start Development

```bash
npm start
```

Scan the QR code with Expo Go (Android) or Camera app (iOS).

## Project Structure

```
app/
├── (tabs)/               # Main app tabs
│   ├── quran.js          # Quran reader with voice search
│   ├── prayer-times.js   # Prayer times display
│   ├── qibla.js          # Qibla compass
│   └── settings.js       # App settings
├── _layout.js            # Root layout
├── login.js              # Login screen
├── signup.js             # Signup screen
└── forgot-password.js    # Password reset

services/
├── quranApi.js           # Al-Quran Cloud API
├── firebase.js           # Firebase auth
├── voiceRecognition.js   # Voice input
├── prayerTimeApi.js      # Prayer times
└── qiblaApi.js           # Qibla direction
```

## Running the App

```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## Voice Recognition

Voice recognition works differently by platform:

- **Web** - Uses Web Speech API (works in Expo web)
- **Mobile** - Uses device recording + optional backend transcription

For full voice transcription on mobile, set up the backend server:

```bash
cd backend
npm install
# Add OPENAI_API_KEY to .env
npm start
```

## Troubleshooting

### Firebase Authentication Errors

- Verify Firebase config in `services/firebase.js`
- Check that Email/Password auth is enabled in Firebase Console

### Voice Recognition Not Working

- Grant microphone permissions when prompted
- On mobile, ensure the backend server is running for transcription

### Arabic Text Issues

- Arabic text should render right-to-left automatically
- If text appears garbled, check device font support

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for platforms
eas build --platform ios
eas build --platform android
```

## License

MIT License - see `LICENSE` for details.
