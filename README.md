# Amal - Quran Reader

A Quran reader app built with React Native and Expo. Features Arabic text with translations, search, voice navigation, prayer times, and Qibla compass.

## Features

- **Quran Reader** - All 114 surahs with Arabic text (Uthmani script) and English translations
- **Search** - Search across surahs and translations via Al-Quran Cloud API
- **Voice Navigation** - Navigate by speaking surah names or reciting verses
- **Prayer Times** - Location-based prayer times with countdown
- **Qibla Compass** - Find the direction to the Kaaba
- **Dark/Light Theme** - System-aware with manual toggle

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your device (for testing)

### Installation

```bash
git clone <repository-url>
cd Amal
npm install
npm start
```

Scan the QR code with Expo Go (Android) or Camera app (iOS) to run.

### Firebase Setup

The app uses Firebase for authentication. To set up your own Firebase project:

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication
3. Copy your web app config to `services/firebase.js`

See `FIREBASE_SETUP.md` for detailed instructions.

## Project Structure

```
app/
├── (tabs)/
│   ├── quran.js          # Quran reader with voice search
│   ├── prayer-times.js   # Prayer times display
│   ├── qibla.js          # Qibla compass
│   └── settings.js       # App settings
├── login.js              # Authentication
├── signup.js             # Registration
└── _layout.js            # Root navigation

services/
├── quranApi.js           # Al-Quran Cloud API integration
├── firebase.js           # Firebase auth
├── voiceRecognition.js   # Voice input handling
├── prayerTimeApi.js      # Prayer times API
└── qiblaApi.js           # Qibla direction API

components/
├── UniversalHeader.js    # App header with theme toggle
├── LocationSelector.js   # City/location picker
└── CustomQiblaCompass.js # Compass visualization
```

## API Integration

The app uses the [Al-Quran Cloud API](https://alquran.cloud/api) for:

- Complete Quran text (Uthmani script)
- English translations (Muhammad Asad, Pickthall, Yusuf Ali)
- Keyword search across all surahs

No API key required - the Al-Quran Cloud API is free and open.

## Voice Commands

Speak naturally to navigate:

- "Surah Al-Fatiha" or "Chapter 1" → Opens the surah
- "Go to verse 2:255" → Navigates to Ayat Al-Kursi
- "Search mercy" → Searches for the term
- "Next" / "Previous" → Navigate between surahs

## Backend (Optional)

For voice transcription, an optional backend server can be configured:

```bash
cd backend
npm install
# Set OPENAI_API_KEY in .env
npm start
```

Without the backend, voice recognition uses the device's built-in speech recognition (Web Speech API on web, device recording on mobile).

## Contributing

See `CONTRIBUTING.md` for guidelines.

## License

MIT License - see `LICENSE` for details.

## Acknowledgments

- [Al-Quran Cloud API](https://alquran.cloud/) for free Quran data
- [Expo](https://expo.dev/) for the development platform
