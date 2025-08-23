# Firebase Authentication Setup

This app now includes a complete Firebase authentication system with the following features:

## Features

- **User Registration**: Create new accounts with email and password
- **User Login**: Sign in with existing credentials
- **Password Reset**: Forgot password functionality via email
- **Authentication State Management**: Automatic redirects based on auth status
- **Logout**: Secure logout functionality
- **Theme Integration**: Authentication pages use the same color scheme as the main app

> **⚠️ Important**: The Firebase configuration currently uses placeholder values. You must replace these with your actual Firebase credentials before the authentication system will work. See the Firebase Configuration section below for setup instructions.

## Pages

### 1. Login Page (`/login`)
- Email and password input fields
- Form validation
- "Forgot Password" link
- Link to signup page
- Uses app's color scheme (gold accent buttons, theme-aware backgrounds)

### 2. Signup Page (`/signup`)
- Email, password, and confirm password fields
- Password validation (minimum 6 characters)
- Email format validation
- Password confirmation matching
- Link back to login page

### 3. Forgot Password Page (`/forgot-password`)
- Email input for password reset
- Sends reset email via Firebase
- Returns to previous page after success

## Firebase Configuration

The Firebase configuration is set up in `services/firebase.ts` with placeholder values. You need to replace these with your actual Firebase project credentials:

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

### How to Get Your Firebase Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on the web app icon (</>) or create a new web app
7. Copy the configuration object
8. Replace the placeholder values in `services/firebase.ts`

### Required Firebase Services:

Make sure to enable the following services in your Firebase project:
- **Authentication** → Email/Password sign-in method
- **Analytics** (optional, for measurementId)

### Security Best Practices:

For production apps, consider using environment variables instead of hardcoding credentials:

1. Create a `.env` file in your project root:
```bash
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

2. Install `react-native-dotenv`:
```bash
npm install react-native-dotenv
```

3. Update your Firebase config to use environment variables:
```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};
```

**Note**: Remember to add `.env` to your `.gitignore` file to keep credentials secure!

## Authentication Flow

1. **Unauthenticated users** are automatically redirected to `/login`
2. **New users** can create accounts via `/signup`
3. **Existing users** can sign in via `/login`
4. **Authenticated users** can access the main app
5. **Logout** returns users to the login page

## Color Scheme Integration

All authentication pages use the app's consistent color scheme:
- **Light Theme**: `#f8f6f0` background, `#3d3d3d` text, `#ffd700` gold accent
- **Dark Theme**: `#0a0a0a` background, `#e8e8e8` text, `#ffd700` gold accent
- **Form Backgrounds**: Semi-transparent overlays that adapt to theme
- **Buttons**: Gold accent color (`#ffd700`) with dark text for contrast

## Usage

### For Users
1. Navigate to `/login` or `/signup`
2. Create an account or sign in
3. Access the main Quran reader app
4. Use the logout button in the header to sign out

### For Developers
- Authentication state is managed via `AuthContext`
- Use `useAuth()` hook to access user state
- Firebase functions are exported from `services/firebase.ts`
- All routes are protected and redirect unauthenticated users

## Security Features

- Password requirements (minimum 6 characters)
- Email validation
- Secure Firebase authentication
- Automatic session management
- Protected routes

## Dependencies

- `firebase`: Core Firebase SDK
- `expo-linear-gradient`: For gradient backgrounds
- `expo-router`: For navigation and routing
- React Native built-in components for UI

The authentication system is now fully integrated with your Quran reader app and maintains the same visual design language throughout the user experience.
