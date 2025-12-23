import { AuthProvider } from '@/contexts/AuthContext.js';
import { ThemeProvider } from '@/contexts/ThemeContext.js';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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