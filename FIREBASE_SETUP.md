# Firebase Setup Guide

## Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Click the gear icon ⚙️ → Project Settings
4. Scroll to "Your apps" and add a Web app
5. Copy the config values

### 2. Update Firebase Config

Replace the values in `services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
  measurementId: "G-XXXXXXXXXX"
};
```

### 3. Enable Authentication

1. In Firebase Console → Authentication
2. Click "Get started"
3. Enable "Email/Password" sign-in method

## Quick Start

1. Update the config in `services/firebase.js`
2. Run `npx expo start`
3. Test signup/login

## Features

- Email/Password authentication
- Password reset via email
- Persistent login sessions
- Protected routes

## Security Notes

- The Firebase web config is designed to be public (it's restricted by Firebase security rules)
- Enable proper Firestore security rules if using Firestore
- Set up authorized domains in Firebase Console
