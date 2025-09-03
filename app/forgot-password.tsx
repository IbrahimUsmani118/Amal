import { useColorScheme } from '@/hooks/useColorScheme';
import { resetPassword } from '@/services/firebase';
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

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
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

  const validateEmail = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        Alert.alert(
          'Success',
          result.message || 'Password reset email sent! Please check your inbox.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () => {
    router.back();
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
            <Text style={[styles.title, styles[`${currentTheme}Title`]]}>Reset Password</Text>
            <Text style={[styles.subtitle, styles[`${currentTheme}Subtitle`]]}>
              Enter your email address and we'll send you a link to reset your password
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

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ffd700' }, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: '#3d3d3d' }]}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={navigateBack}
              >
                <Text style={[styles.backButtonText, styles[`${currentTheme}BackButtonText`]]}>Back to Sign In</Text>
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
    lineHeight: 22,
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
    marginBottom: 30,
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
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 15,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  darkBackButtonText: {
    color: '#ffd700',
  },
  lightBackButtonText: {
    color: '#667eea',
  },
});
