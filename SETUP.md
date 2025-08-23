# Amal Quran App - Setup Guide

## Overview
Amal is an enhanced Quran reader app with voice recognition capabilities, designed to help users follow along with Quran recitation in real-time.

## Features
- **Quran Reading**: Browse and read Quran with Arabic text and translations
- **Voice Recognition**: Real-time Quran recitation detection using speech recognition
- **Prayer Times**: Daily prayer schedule with location-based calculations
- **Qibla Direction**: Compass pointing towards the Kaaba
- **User Authentication**: Firebase-based login/signup with email verification
- **Settings**: Customizable app preferences and user profile management

## Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- Firebase project
- iOS Simulator or Android Emulator (for testing)

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
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Enable Email verification
4. Copy your Firebase config to `services/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 4. Speech Recognition Setup
The app uses `expo-speech-recognition` for voice recognition. This requires:

#### For Development:
```bash
npx expo run:ios     # iOS
npx expo run:android # Android
```

#### For Production:
```bash
eas build --platform ios
eas build --platform android
```

**Note**: Speech recognition won't work in Expo Go due to native dependencies.

## Project Structure

```
app/
├── (tabs)/           # Main app tabs
│   ├── index.tsx     # Quran reader
│   ├── prayer-times.tsx
│   ├── qibla.tsx
│   └── settings.tsx
├── _layout.tsx       # Root layout
├── index.tsx         # Entry point with routing
├── login.tsx         # Login screen
├── signup.tsx        # Signup screen
├── verify-email.tsx  # Email verification
└── forgot-password.tsx
```

## Key Components

### Authentication Flow
1. User signs up → Email verification sent
2. User verifies email → Redirected to main app
3. User logs in → Check email verification → Access granted

### Voice Recognition
- Uses Arabic language model (ar-SA)
- Detects Quran recitation patterns
- Matches recognized text with Quran verses
- Real-time feedback during prayer

### Navigation
- Tab-based navigation for main features
- Stack navigation for authentication
- Proper routing with authentication guards

## Development

### Running the App
```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Building for Production
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Build for platforms
eas build --platform all
```

## Configuration

### Environment Variables
Create a `.env` file for sensitive configuration:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
```

### App Configuration
- Update `app.json` for app metadata
- Configure permissions in `app.json` plugins section
- Set up deep linking if needed

## Testing

### Voice Recognition Testing
1. Use real device (not simulator)
2. Test with clear Arabic recitation
3. Check microphone permissions
4. Verify language model support

### Authentication Testing
1. Test signup flow
2. Verify email verification
3. Test login with verified/unverified accounts
4. Test password reset

## Troubleshooting

### Common Issues

#### Speech Recognition Not Working
- Ensure using development build, not Expo Go
- Check microphone permissions
- Verify device supports Arabic speech recognition

#### Firebase Authentication Errors
- Verify Firebase config
- Check Firebase console for errors
- Ensure email verification is enabled

#### Navigation Issues
- Clear app cache
- Check route definitions
- Verify authentication state

### Performance Optimization
- Implement lazy loading for Quran text
- Cache frequently accessed data
- Optimize voice recognition processing
- Use proper image optimization

## Deployment

### App Store / Play Store
1. Build production version
2. Test thoroughly on real devices
3. Submit for review
4. Monitor crash reports and analytics

### Web Deployment
1. Build web version
2. Deploy to hosting service
3. Configure custom domain
4. Set up analytics

## Contributing
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License
This project is licensed under the MIT License.

## Support
For support and questions:
- Create an issue in the repository
- Check the documentation
- Review troubleshooting section

## Future Enhancements
- Offline Quran text storage
- Multiple translation languages
- Advanced voice recognition algorithms
- Prayer time notifications
- Community features
- Analytics and insights
