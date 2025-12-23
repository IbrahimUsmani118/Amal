import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const { user, loading: authLoading } = useAuth();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Mark component as mounted after a small delay
  useEffect(() => {
    // Small delay to ensure proper mounting
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't navigate until component is mounted
    if (!isMounted) return;

    console.log('=== INDEX SCREEN MOUNTED ===');
    console.log('Color scheme:', colorScheme);
    console.log('Auth loading:', authLoading);
    console.log('User object:', user);

    if (user) {
      console.log('User ID:', user.uid);
      console.log('User email:', user.email);
      console.log('Email verified:', user.emailVerified);
    }

    // Add a small delay to ensure navigation is safe
    const navigationTimer = setTimeout(() => {
      // If user is signed in, go to main app (no email verification required)
      if (user) {
        console.log('🎉 User signed in, going to main app...');
        router.replace('/(tabs)/quran');
      } else {
        console.log('🚫 No user, going straight to login...');
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(navigationTimer);
  }, [user, authLoading, isMounted]);

  // Add a manual retry mechanism
  const handleRetry = () => {
    if (!isMounted) return;

    console.log('🔄 Manual retry triggered');
    setRedirectAttempts(prev => prev + 1);
    console.log('Retry attempt:', redirectAttempts + 1);

    // Force a re-render and retry
    setTimeout(() => {
      if (!isMounted) return;

      console.log('Executing retry navigation...');
      if (user) {
        console.log('Retry: navigating to main app');
        router.replace('/(tabs)/quran');
      } else {
        console.log('Retry: navigating to login');
        router.replace('/login');
      }
    }, 100);
  };

  // Skip Firebase and go directly to login if user wants
  const handleSkipAuth = () => {
    if (!isMounted) return;

    console.log('⏭️ User chose to skip authentication');
    router.replace('/login');
  };

  // Show a simple loading screen while redirecting
  return (
    <View style={[styles.container, styles[colorScheme || 'dark']]}>
      <ActivityIndicator size="large" color={colorScheme === 'light' ? '#3d3d3d' : '#ffd700'} />
      <Text style={[styles.loadingText, styles[`${colorScheme || 'dark'}LoadingText`]]}>
        {isMounted ? 'Loading...' : 'Initializing...'}
      </Text>
      <Text style={[styles.subText, styles[`${colorScheme || 'dark'}SubText`]]}>
        {isMounted ? 'Redirecting to login...' : 'Please wait...'}
      </Text>

      {isMounted && (
        <TouchableOpacity
          style={[styles.retryButton, styles[`${colorScheme || 'dark'}RetryButton`]]}
          onPress={handleSkipAuth}
        >
          <Text style={[styles.retryButtonText, styles[`${colorScheme || 'dark'}RetryButtonText`]]}>
            Go to Login Now
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  dark: {
    backgroundColor: '#0a0a0a',
  },
  light: {
    backgroundColor: '#f8f6f0',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  darkLoadingText: {
    color: '#e8e8e8',
  },
  lightLoadingText: {
    color: '#3d3d3d',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  darkSubText: {
    color: '#b0b0b0',
  },
  lightSubText: {
    color: '#6a6a6a',
  },
  buttonContainer: {
    marginTop: 32,
    width: '80%',
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  darkPrimaryButton: {
    backgroundColor: '#ffd700',
  },
  lightPrimaryButton: {
    backgroundColor: '#ffd700',
  },
  primaryButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
  darkPrimaryButtonText: {
    color: '#1a1a2e',
  },
  lightPrimaryButtonText: {
    color: '#1a1a2e',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  darkSecondaryButton: {
    borderColor: '#ffd700',
    backgroundColor: 'transparent',
  },
  lightSecondaryButton: {
    borderColor: '#3d3d3d',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  darkSecondaryButtonText: {
    color: '#ffd700',
  },
  lightSecondaryButtonText: {
    color: '#3d3d3d',
  },
  retryButton: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  darkRetryButton: {
    borderColor: '#ffd700',
    backgroundColor: 'transparent',
  },
  lightRetryButton: {
    borderColor: '#3d3d3d',
    backgroundColor: 'transparent',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  darkRetryButtonText: {
    color: '#ffd700',
  },
  lightRetryButtonText: {
    color: '#3d3d3d',
  },
});
