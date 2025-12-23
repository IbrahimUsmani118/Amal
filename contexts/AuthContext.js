import { auth } from '@/services/firebase.js';
import secureStorageService from '@/services/secureStorage.js';
import { useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext({
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useRef({ isNavigating: false, lastRoute: null });
  const authStateChecked = useRef(false);

  // Check for stored authentication on mount (prevents login screen flickering)
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        console.log('🔐 Checking for stored authentication...');
        
        // Check if user has a stored token
        const hasToken = await secureStorageService.isLoggedIn();
        const storedUserData = await secureStorageService.getUserData();
        
        if (hasToken && storedUserData) {
          console.log('✅ Found stored authentication, restoring user state');
          // Set user data immediately to prevent login screen flash
          // Firebase will verify this when onAuthStateChanged fires
          setUser(storedUserData);
          setLoading(false);
        } else {
          console.log('ℹ️ No stored authentication found');
        }
        
        setHasCheckedStorage(true);
      } catch (error) {
        console.error('❌ Error checking stored auth:', error);
        setHasCheckedStorage(true);
      }
    };

    checkStoredAuth();
  }, []);

  // Mark component as mounted
  useEffect(() => {
    // Small delay to ensure proper mounting
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Set up Firebase auth state listener with persistent storage
  useEffect(() => {
    // Wait for storage check to complete before setting up Firebase listener
    if (!hasCheckedStorage) {
      return;
    }

    // Prevent multiple listeners
    if (authStateChecked.current) {
      return;
    }

    console.log('🔥 AuthContext: Setting up auth state listener');
    console.log('🔥 Auth instance:', auth);

    if (!auth) {
      console.log('⚠️ Auth instance not available');
      setLoading(false);
      setIsFirebaseInitialized(false);
      return;
    }

    setIsFirebaseInitialized(true);
    authStateChecked.current = true;

    // Set timeout for Firebase initialization
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth timeout - proceeding without Firebase');
      if (loading) {
        setLoading(false);
      }
    }, 1000); // Increased timeout to allow Firebase to initialize

    // Set up Firebase auth state listener
    // This keeps the user logged in across app restarts
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log('🔥 AuthContext: Auth state changed:', firebaseUser ? `User ${firebaseUser.uid}` : 'No user');
        clearTimeout(timeoutId);
        
        if (firebaseUser) {
          // User is authenticated - store their data
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          
          // Store user data in secure storage
          await secureStorageService.storeUserData(userData);
          
          // Get and store the ID token if available
          try {
            const token = await firebaseUser.getIdToken();
            if (token) {
              await secureStorageService.storeToken(token);
            }
          } catch (tokenError) {
            console.warn('⚠️ Could not get ID token:', tokenError);
          }
          
          setUser(firebaseUser);
        } else {
          // User is not authenticated - clear stored data
          console.log('🧹 User signed out, clearing stored auth data');
          await secureStorageService.clearAuthData();
          setUser(null);
        }
        
        setLoading(false);
      },
      (error) => {
        // Handle Firebase connection errors
        console.error('❌ AuthContext: Firebase auth error:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth listener');
      clearTimeout(timeoutId);
      unsubscribe();
      authStateChecked.current = false;
    };
  }, [hasCheckedStorage, loading]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (loading || !isMounted) return;
    
    // Prevent infinite loops
    if (navigationRef.current.isNavigating) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const currentRoute = segments[0];
    const routeKey = `${currentRoute}-${user ? 'user' : 'no-user'}`;

    // Don't navigate if we're on the index screen (no segments) - let it handle its own navigation
    if (!currentRoute) return;

    // Prevent duplicate navigations to the same route
    if (navigationRef.current.lastRoute === routeKey) return;

    // If we're on +not-found, redirect to login immediately (only once)
    if (currentRoute === '+not-found') {
      navigationRef.current.isNavigating = true;
      navigationRef.current.lastRoute = routeKey;
      setTimeout(() => {
        router.replace('/login');
        setTimeout(() => {
          navigationRef.current.isNavigating = false;
        }, 500);
      }, 100);
      return;
    }

    // If user is not signed in, redirect to login (unless already there or on auth screens)
    if (!user) {
      if (currentRoute !== 'login' && 
          currentRoute !== 'signup' && 
          currentRoute !== 'forgot-password' &&
          currentRoute !== 'index') {
        navigationRef.current.isNavigating = true;
        navigationRef.current.lastRoute = routeKey;
        setTimeout(() => {
          router.replace('/login');
          setTimeout(() => {
            navigationRef.current.isNavigating = false;
          }, 500);
        }, 100);
      }
      return;
    }

    // If user is signed in, redirect to main app (no email verification required)
    if (user) {
      if (!inAuthGroup && currentRoute !== 'quran' && currentRoute !== 'prayer-times' && currentRoute !== 'qibla' && currentRoute !== 'settings') {
        navigationRef.current.isNavigating = true;
        navigationRef.current.lastRoute = routeKey;
        setTimeout(() => {
          router.replace('/(tabs)/quran');
          setTimeout(() => {
            navigationRef.current.isNavigating = false;
          }, 500);
        }, 100);
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