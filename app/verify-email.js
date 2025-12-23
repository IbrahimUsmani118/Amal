import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { reload, sendEmailVerification } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function VerifyEmailScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [manualTheme, setManualTheme] = useState(null);

  // Use manual theme if set, otherwise use system theme
  const currentTheme = manualTheme || colorScheme || 'dark';

  const toggleTheme = () => {
    console.log('🔄 Theme toggle clicked. Current theme:', currentTheme);
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log('🔄 Setting new theme to:', newTheme);
    setManualTheme(newTheme);
  };

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

  const handleResendVerification = async () => {
    if (!user) {
      console.log('❌ Cannot resend verification: no user found');
      return;
    }

    console.log('=== RESEND VERIFICATION STARTED ===');
    console.log('User ID:', user.uid);
    console.log('User email:', user.email);
    console.log('Current email verified status:', user.emailVerified);

    setIsResending(true);

    try {
      console.log('Sending email verification...');
      await sendEmailVerification(user);
      console.log('✅ Email verification sent successfully!');

      Alert.alert(
        'Verification Email Sent',
        'Please check your email and click the verification link.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Failed to send verification email!');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      Alert.alert('Error', error.message || 'Failed to send verification email');
    } finally {
      console.log('Resend verification process completed');
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) {
      console.log('❌ Cannot check verification: no user found');
      return;
    }

    console.log('=== CHECK VERIFICATION STARTED ===');
    console.log('User ID:', user.uid);
    console.log('User email:', user.email);
    console.log('Current email verified status:', user.emailVerified);

    setIsChecking(true);

    try {
      console.log('Reloading user to check verification status...');
      await reload(user);
      console.log('✅ User reloaded successfully');
      console.log('New email verified status:', user.emailVerified);

      if (user.emailVerified) {
        console.log('🎉 Email is now verified! Navigating to main app...');
        Alert.alert(
          'Email Verified!',
          'Your email has been verified successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('User clicked OK, navigating to main app...');
                router.replace('/(tabs)/quran');
              },
            },
          ]
        );
      } else {
        console.log('⚠️ Email still not verified');
        Alert.alert(
          'Not Verified Yet',
          'Please check your email and click the verification link, then try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Failed to check verification status!');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      Alert.alert('Error', error.message || 'Failed to check verification status');
    } finally {
      console.log('Check verification process completed');
      setIsChecking(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <View style={[styles.container, styles[currentTheme]]}>
      <StatusBar barStyle={currentTheme === 'light' ? 'dark-content' : 'light-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={currentTheme === 'light' ? '#3d3d3d' : '#ffd700'}
          />
        </TouchableOpacity>
        <Text style={[styles.title, styles[`${currentTheme}Title`]]}>
          Verify Your Email
        </Text>
        
        {/* Theme Toggle Button */}
        <TouchableOpacity
          style={[styles.themeToggle, styles[`${currentTheme}ThemeToggle`]]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={currentTheme === 'light' ? 'moon' : 'sunny'}
            size={24}
            color={currentTheme === 'light' ? '#3d3d3d' : '#ffd700'}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Email Icon */}
        <View style={[styles.iconContainer, styles[`${currentTheme}IconContainer`]]}>
          <Ionicons
            name="mail"
            size={80}
            color={currentTheme === 'light' ? '#3d3d3d' : '#ffd700'}
          />
        </View>

        {/* Instructions */}
        <Text style={[styles.instructionTitle, styles[`${currentTheme}InstructionTitle`]]}>
          Check Your Email
        </Text>
        <Text style={[styles.instructionText, styles[`${currentTheme}InstructionText`]]}>
          We've sent a verification link to:
        </Text>
        <Text style={[styles.emailText, styles[`${currentTheme}EmailText`]]}>
          {user.email}
        </Text>
        <Text style={[styles.instructionText, styles[`${currentTheme}InstructionText`]]}>
          Please click the link in your email to verify your account and continue using the app.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, styles[`${currentTheme}PrimaryButton`]]}
            onPress={handleCheckVerification}
            disabled={isChecking}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color="white" />
            )}
            <Text style={styles.primaryButtonText}>
              {isChecking ? 'Checking...' : "I've Verified My Email"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, styles[`${currentTheme}SecondaryButton`]]}
            onPress={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator
                size="small"
                color={currentTheme === 'light' ? '#3d3d3d' : '#ffd700'}
              />
            ) : (
              <Ionicons
                name="refresh"
                size={20}
                color={currentTheme === 'light' ? '#3d3d3d' : '#ffd700'}
              />
            )}
            <Text style={[styles.secondaryButtonText, styles[`${currentTheme}SecondaryButtonText`]]}>
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={[styles.helpTitle, styles[`${currentTheme}HelpTitle`]]}>
            Didn't receive the email?
          </Text>
          <Text style={[styles.helpText, styles[`${currentTheme}HelpText`]]}>
            • Check your spam folder{'\n'}
            • Make sure the email address is correct{'\n'}
            • Wait a few minutes and try again
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  dark: {
    backgroundColor: '#0a0a0a',
  },
  light: {
    backgroundColor: '#f8f6f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  darkTitle: {
    color: '#ffd700',
  },
  lightTitle: {
    color: '#3d3d3d',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  darkIconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  lightIconContainer: {
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  instructionTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  darkInstructionTitle: {
    color: '#ffd700',
  },
  lightInstructionTitle: {
    color: '#3d3d3d',
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  darkInstructionText: {
    color: '#e8e8e8',
  },
  lightInstructionText: {
    color: '#6a6a6a',
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  darkEmailText: {
    color: '#ffd700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  lightEmailText: {
    color: '#3d3d3d',
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 32,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
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
  helpContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  darkHelpTitle: {
    color: '#ffd700',
  },
  lightHelpTitle: {
    color: '#3d3d3d',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  darkHelpText: {
    color: '#b0b0b0',
  },
  lightHelpText: {
    color: '#6a6a6a',
  },
  themeToggle: {
    padding: 8,
    marginLeft: 12,
    borderRadius: 20,
  },
  darkThemeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightThemeToggle: {
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
});
