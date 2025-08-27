import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { signIn, testFirebaseStatus } from '../services/firebase';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualTheme, setManualTheme] = useState<'light' | 'dark' | null>(null);

  // Use manual theme if set, otherwise use system theme
  const currentTheme = manualTheme || colorScheme || 'dark';

  const toggleTheme = () => {
    console.log('🔄 Theme toggle clicked. Current theme:', currentTheme);
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log('🔄 Setting new theme to:', newTheme);
    setManualTheme(newTheme);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      console.log('❌ Login validation failed: missing email or password');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('=== LOGIN PROCESS STARTED ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Current theme:', currentTheme);
    
    setLoading(true);
    try {
      console.log('Calling signIn function...');
      
      const result = await signIn(email, password);
      console.log('=== LOGIN RESULT ===');
      console.log('Success:', result.success);
      console.log('User object:', result.user);
      
      if (result.success) {
        console.log('✅ Login successful!');
        console.log('User ID:', result.user?.uid);
        console.log('User email:', result.user?.email);
        console.log('Email verified status:', result.user?.emailVerified);
        
        // Check if email is verified
        if (result.user?.emailVerified) {
          console.log('🎉 Email is verified, navigating to main app...');
          router.replace('/(tabs)/quran' as any);
        } else {
          console.log('⚠️ Email not verified, navigating to verify-email screen...');
          // Redirect to email verification
          router.replace('/verify-email');
        }
      } else {
        console.error('❌ Login failed!');
        console.error('Error message:', result.message);
        Alert.alert('Login Failed', result.message || 'Login was not successful. Please try again.');
      }
    } catch (error) {
      console.error('💥 UNEXPECTED LOGIN ERROR!');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      console.log('Login process completed, setting loading to false');
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.push('/signup');
  };

  const navigateToForgotPassword = () => {
    router.push('/forgot-password');
  };

  const testFirebase = async () => {
    try {
      console.log('🧪 Testing Firebase connection...');
      const result = await testFirebaseStatus();
      console.log('🧪 Test result:', result);
      Alert.alert('Firebase Test', result.message);
    } catch (error) {
      console.error('🧪 Test error:', error);
      Alert.alert('Firebase Test Error', 'Failed to test Firebase connection');
    }
  };

  return (
    <LinearGradient
      colors={currentTheme === 'dark' ? ['#0a0a0a', '#151718'] : ['#f8f6f0', '#e8e8e8']}
      style={styles.container}
    >
      {/* Theme Toggle Button */}
      <TouchableOpacity style={[styles.themeToggle, styles[`${currentTheme}ThemeToggle`]]} onPress={toggleTheme}>
        <Ionicons 
          name={currentTheme === 'light' ? 'moon' : 'sunny'} 
          size={24} 
          color={currentTheme === 'light' ? '#3d3d3d' : '#ffd700'} 
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={[styles.title, styles[`${currentTheme}Title`]]}>Welcome Back</Text>
            <Text style={[styles.subtitle, styles[`${currentTheme}Subtitle`]]}>Sign in to your account</Text>

            <View style={[styles.form, styles[`${currentTheme}Form`]]}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, styles[`${currentTheme}Label`]]}>Email</Text>
                <TextInput
                  style={[styles.input, styles[`${currentTheme}Input`]]}
                  placeholder="Enter your email"
                  placeholderTextColor={currentTheme === 'light' ? '#666' : '#999'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, styles[`${currentTheme}Label`]]}>Password</Text>
                <TextInput
                  style={[styles.input, styles[`${currentTheme}Input`]]}
                  placeholder="Enter your password"
                  placeholderTextColor={currentTheme === 'light' ? '#666' : '#999'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ffd700' }, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: '#3d3d3d' }]}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotPassword} onPress={navigateToForgotPassword}>
                <Text style={[styles.forgotPasswordText, styles[`${currentTheme}ForgotPasswordText`]]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Firebase Test Button - Remove in production */}
              <TouchableOpacity style={styles.testButton} onPress={testFirebase}>
                <Text style={styles.testButtonText}>Test Firebase Connection</Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={[styles.signupText, styles[`${currentTheme}SignupText`]]}>Don't have an account? </Text>
                <TouchableOpacity onPress={navigateToSignup}>
                  <Text style={[styles.signupLink, { color: '#ffd700' }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  darkTitle: {
    color: '#ffd700',
  },
  lightTitle: {
    color: '#3d3d3d',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  darkSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  lightSubtitle: {
    color: '#666',
  },
  form: {
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  darkForm: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
  },
  lightForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  darkLabel: {
    color: '#e8e8e8',
  },
  lightLabel: {
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  darkInput: {
    borderColor: '#444',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#e8e8e8',
  },
  lightInput: {
    borderColor: '#ddd',
    backgroundColor: 'white',
    color: '#333',
  },
  button: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#3d3d3d',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 25,
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: '600',
  },
  darkForgotPasswordText: {
    color: '#ffd700',
  },
  lightForgotPasswordText: {
    color: '#667eea',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
  },
  darkSignupText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  lightSignupText: {
    color: '#666',
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    padding: 10,
    borderRadius: 20,
  },
  darkThemeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightThemeToggle: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  testButton: {
    backgroundColor: '#4CAF50', // A green color for testing
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 25,
  },
  testButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
