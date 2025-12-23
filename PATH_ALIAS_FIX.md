# Path Alias Fix (@/ imports)

## Issue
Error: `Unable to resolve "@/components/ThemedText" from "app/+not-found.js"`

## Root Cause
The `@` path alias was not configured in Babel, so Metro bundler couldn't resolve imports like `@/components/ThemedText`.

## Solution Applied
✅ Installed `babel-plugin-module-resolver`
✅ Configured path alias in `babel.config.js`
✅ Cleared all caches

## Configuration

### babel.config.js
Added `babel-plugin-module-resolver` to handle `@` path aliases:

```javascript
plugins: [
  // Module resolver for path aliases (@/ imports)
  [
    'module-resolver',
    {
      root: ['./'],
      alias: {
        '@': './',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
  ],
  // react-native-worklets plugin must be listed last
  'react-native-worklets/plugin',
],
```

## How It Works

1. **babel-plugin-module-resolver** transforms `@/components/ThemedText` to `./components/ThemedText`
2. Metro bundler resolves the transformed path relative to project root
3. Files are found and imported correctly

## Verification

✅ `babel-plugin-module-resolver` installed
✅ Path alias configured: `@` → `./`
✅ Components exist: `components/ThemedText.js`, `components/ThemedView.js`
✅ Babel config verified
✅ All caches cleared

## Supported Imports

With this configuration, you can use:
- `@/components/ThemedText` → `./components/ThemedText`
- `@/contexts/AuthContext` → `./contexts/AuthContext`
- `@/hooks/useColorScheme` → `./hooks/useColorScheme`
- `@/services/voiceRecognition` → `./services/voiceRecognition`

## Next Steps

1. **Restart Expo** with cleared cache:
   ```bash
   expo start --clear
   ```

2. **Verify the fix** - The import error should be resolved

## Notes

- The `@` alias maps to the project root (`./`)
- File extensions are automatically resolved (`.js`, `.jsx`, `.ts`, `.tsx`, `.json`)
- The module-resolver plugin must come before the worklets plugin in the plugins array
- Metro bundler uses Babel for transformation, so this configuration applies to Metro as well

## If Issues Persist

1. Verify babel config:
   ```bash
   cat babel.config.js
   ```

2. Check if files exist:
   ```bash
   ls -la components/ThemedText.js
   ```

3. Clear all caches and restart:
   ```bash
   rm -rf .expo node_modules/.cache
   expo start --clear
   ```

4. Verify plugin is installed:
   ```bash
   npm list babel-plugin-module-resolver
   ```

