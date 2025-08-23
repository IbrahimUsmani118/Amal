# Firebase Setup Guide

## 🔥 **Firebase Configuration**

### 1. **Get Your Firebase Config**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → Project Settings
4. Scroll down to "Your apps" section
5. Copy the config values

### 2. **Update Firebase Config**
Replace the placeholder values in `services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
  measurementId: "G-XXXXXXXXXX"
};
```

### 3. **Enable Authentication**
1. In Firebase Console → Authentication
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Add your domain to authorized domains

### 4. **Deploy Firebase Functions** (Optional)
If you want email functionality:

```bash
cd functions
npm install
firebase deploy --only functions
```

### 5. **Set Environment Variables** (For Functions)
```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.pass="your-app-password"
```

## 🚀 **Quick Start**
1. Update the config values above
2. Run `npx expo start`
3. Test signup/login functionality

## 📱 **Features**
- ✅ Firebase Authentication
- ✅ Email/Password signup/login
- ✅ Email verification
- ✅ Password reset
- ✅ Protected routes
- ✅ Theme switching

## 🔒 **Security Notes**
- Never commit real credentials to git
- Use environment variables for sensitive data
- Enable Firebase Security Rules
- Set up proper domain restrictions
