import { AuthProvider } from '@/contexts/AuthContext.js';
import { ThemeProvider } from '@/contexts/ThemeContext.js';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/**
 * Root Layout Component
 * 
 * This component sets up the app's root providers:
 * - AuthProvider: Handles authentication and session persistence
 *   - Checks for stored token on app boot (prevents login screen flickering)
 *   - Uses expo-secure-store for secure token storage
 *   - Automatically restores user session on app restart
 * - ThemeProvider: Handles app theming
 * 
 * The AuthProvider includes a "boot check" that:
 * 1. Checks expo-secure-store for stored authentication token on mount
 * 2. Restores user state immediately if token exists
 * 3. Prevents login screen from flashing before Firebase auth state is determined
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <Slot />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}