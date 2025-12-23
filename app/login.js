import { useColorScheme } from '@/hooks/useColorScheme';
import { loginOrCreate } from '@/services/firebase';
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

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualTheme, setManualTheme] = useState(null);

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

    // Validate password length
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    console.log('=== LOGIN/SIGNUP PROCESS STARTED ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    setLoading(true);

    try {
      // Use loginOrCreate which handles both login and signup automatically
      console.log('🔐 Attempting to authenticate...');
      const result = await loginOrCreate(email, password);

      if (result.success) {
        console.log(result.isNewUser ? '✅ Account created and signed in!' : '✅ Login successful!');
        console.log('User ID:', result.user?.uid);
        console.log('User email:', result.user?.email);
        
        // Wait for auth state to update, then let AuthContext handle navigation
        // This prevents "navigate before mounting" errors
        setTimeout(() => {
          try {
            router.replace('/(tabs)/quran');
          } catch (error) {
            console.log('Navigation error (will retry via AuthContext):', error);
            // AuthContext will handle navigation when user state updates
          }
        }, 300);
      } else {
        // Authentication failed - stay on login screen
        console.error('❌ Authentication failed:', result.error);
        const errorMessage = result.error || 'Please check your credentials and try again.';
        Alert.alert('Authentication Failed', errorMessage, [
          { text: 'OK', style: 'default' },
          ...(result.errorCode === 'auth/invalid-credential' || result.errorCode === 'auth/wrong-password' 
            ? [{ text: 'Forgot Password?', onPress: () => router.push('/forgot-password') }]
            : [])
        ]);
      }
    } catch (error) {
      console.error('💥 UNEXPECTED ERROR!');
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      console.log('Login process completed, setting loading to false');
      setLoading(false);
    }
  };


  return (
    <LinearGradient
      colors={currentTheme === 'dark' ? ['#0a0a0a', '#151718'] : ['#f8f6f0', '#e8e8e8']}
      style={styles.container}
    >
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={[styles.title, styles[`${currentTheme}Title`]]}>
              Welcome
            </Text>
            <Text style={[styles.subtitle, styles[`${currentTheme}Subtitle`]]}>
              Enter your email and password to continue
            </Text>

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
                  {loading ? 'Signing In...' : 'Continue'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.forgotPassword} 
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={[styles.forgotPasswordText, styles[`${currentTheme}ForgotPasswordText`]]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
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
    marginBottom: 32,
  },
  darkSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  lightSubtitle: {
    color: '#666',
  },
  form: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    borderRadius: 8,
    padding: 12,
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
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#3d3d3d',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
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
    fontSize: 14,
  },
  darkSignupText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  lightSignupText: {
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
    borderRadius: 20,
  },
  darkThemeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightThemeToggle: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

