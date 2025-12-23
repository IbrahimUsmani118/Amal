# Fix Worklets Version Mismatch

## Issue
Worklets version mismatch: JavaScript 0.7.1 vs Native 0.5.1

## Root Cause
The JavaScript worklets-core is at version 0.7.1, but Expo Go's native worklets is at 0.5.1. This happens because Expo Go bundles native modules and can't be updated without updating the Expo Go app itself.

## Solutions

### Option 1: Clear Caches and Restart (Try This First)

```bash
# Stop Expo dev server (Ctrl+C)

# Clear all caches
rm -rf .expo node_modules/.cache .metro

# Restart with cleared cache
npx expo start --clear
```

### Option 2: Use Development Build (If Option 1 Doesn't Work)

If you're using Expo Go and the version mismatch persists, you need to create a development build which allows custom native modules:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Create a development build
eas build --profile development --platform ios
# or for Android:
eas build --profile development --platform android
```

### Option 3: Downgrade Worklets (Temporary Fix)

If you need to use Expo Go immediately, you can temporarily pin worklets to match Expo Go's version:

```bash
npm install react-native-worklets-core@1.5.0
```

Then restart:
```bash
npx expo start --clear
```

## Current Package Versions (Expo SDK 54)
- `react`: 19.1.0
- `react-dom`: 19.1.0
- `react-native`: 0.81.4
- `react-native-reanimated`: ~4.1.1
- `react-native-worklets-core`: 1.6.2

## Recommended Action
1. Try Option 1 first (clear caches)
2. If that doesn't work and you need Expo Go, use Option 3 (downgrade)
3. For long-term solution, use Option 2 (development build)

