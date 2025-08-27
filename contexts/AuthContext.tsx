import { useRouter, useSegments } from 'expo-router';
import { User, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  isFirebaseInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  isFirebaseInitialized: false,
});

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Mark component as mounted
  useEffect(() => {
    // Small delay to ensure proper mounting
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('🔥 AuthContext: Setting up auth state listener');
    console.log('🔥 Auth instance:', auth);
    
    if (!auth) {
      console.log('⚠️ Auth instance not available');
      setLoading(false);
      setIsFirebaseInitialized(false);
      return;
    }
    
    setIsFirebaseInitialized(true);
    
    // Very fast timeout - only wait 500ms for Firebase
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth timeout - proceeding without Firebase');
      setLoading(false);
    }, 500); // 500ms timeout for very fast loading

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 AuthContext: Auth state changed:', user ? `User ${user.uid}` : 'No user');
      clearTimeout(timeoutId);
      setUser(user);
      setLoading(false);
    }, (error) => {
      // Handle Firebase connection errors
      console.error('❌ AuthContext: Firebase auth error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth listener');
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (loading || !isMounted) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const currentRoute = segments[0];

    // Don't navigate if we're on the index screen (no segments) - let it handle its own navigation
    if (!currentRoute) return;

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
  }, [user, segments, loading, router, isMounted]);

  const value = {
    user,
    loading,
    setUser,
    isFirebaseInitialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
