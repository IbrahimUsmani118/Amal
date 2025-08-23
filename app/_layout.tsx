import { AuthContext } from '@/contexts/AuthContext';
import { auth } from '@/services/firebase';
import { Slot, useRouter, useSegments } from 'expo-router';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const currentRoute = segments[0];

    // If user is not signed in, redirect to login (unless already there)
    if (!user) {
      if (currentRoute !== 'login' && currentRoute !== 'signup' && currentRoute !== 'forgot-password') {
        router.replace('/login');
      }
      return;
    }

    // If user is signed in but email is not verified
    if (user && !user.emailVerified) {
      // Only redirect to verify-email if they're not already there
      if (currentRoute !== 'verify-email') {
        router.replace('/verify-email');
      }
      return;
    }

    // If user is signed in and email is verified, redirect to main app
    if (user && user.emailVerified) {
      if (!inAuthGroup) {
        router.replace('/(tabs)/quran');
      }
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f6f0' }}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={{ marginTop: 16, color: '#3d3d3d' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading: isLoading }}>
      <Slot />
    </AuthContext.Provider>
  );
}
