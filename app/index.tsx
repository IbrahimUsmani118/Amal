import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const { user, loading: authLoading } = useAuth();
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  useEffect(() => {
    console.log('=== INDEX SCREEN MOUNTED ===');
    console.log('Color scheme:', colorScheme);
    console.log('Auth loading:', authLoading);
    console.log('User object:', user);
    if (user) {
      console.log('User ID:', user.uid);
      console.log('User email:', user.email);
      console.log('Email verified:', user.emailVerified);
    }
    
    // Skip Firebase loading and go straight to login
    if (user && user.emailVerified) {
      console.log('🎉 User verified, going to main app...');
      router.replace('/(tabs)/quran' as any);
    } else if (user && !user.emailVerified) {
      console.log('⚠️ User not verified, going to verify-email...');
      router.replace('/verify-email');
    } else {
      console.log('🚫 No user, going straight to login...');
      router.replace('/login');
    }
  }, [user, authLoading]);

  // Add a manual retry mechanism
  const handleRetry = () => {
    console.log('🔄 Manual retry triggered');
    setRedirectAttempts(prev => prev + 1);
    console.log('Retry attempt:', redirectAttempts + 1);
    
    // Force a re-render and retry
    setTimeout(() => {
      console.log('Executing retry navigation...');
      if (user) {
        if (user.emailVerified) {
          console.log('Retry: navigating to main app');
          router.replace('/(tabs)/quran' as any);
        } else {
          console.log('Retry: navigating to verify-email');
          router.replace('/verify-email');
        }
      } else {
        console.log('Retry: navigating to login');
        router.replace('/login');
      }
    }, 100);
  };

  // Skip Firebase and go directly to login if user wants
  const handleSkipAuth = () => {
    console.log('⏭️ User chose to skip authentication');
    router.replace('/login' as any);
  };

  // Show a simple loading screen while redirecting
  return (
    <View style={[styles.container, styles[colorScheme || 'dark']]}>
      <ActivityIndicator size="large" color={colorScheme === 'light' ? '#3d3d3d' : '#ffd700'} />
      <Text style={[styles.loadingText, styles[`${colorScheme || 'dark'}LoadingText`]]}>
        Loading...
      </Text>
      <Text style={[styles.subText, styles[`${colorScheme || 'dark'}SubText`]]}>
        Redirecting to login...
      </Text>
      
      <TouchableOpacity 
        style={[styles.retryButton, styles[`${colorScheme || 'dark'}RetryButton`]]}
        onPress={handleSkipAuth}
      >
        <Text style={[styles.retryButtonText, styles[`${colorScheme || 'dark'}RetryButtonText`]]}>
          Go to Login Now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
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
    marginTop: 10,
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
    marginTop: 30,
    width: '80%',
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 15,
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
    borderRadius: 25,
    borderWidth: 2,
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
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
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
