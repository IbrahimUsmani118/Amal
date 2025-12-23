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

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualTheme, setManualTheme] = useState(null);

  // Use manual theme if set, otherwise use system theme
  const currentTheme = manualTheme || colorScheme || 'dark';

  const toggleTheme = () => {
    setManualTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    // Firebase Password Policy Requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    let missingRequirements = [];
    if (!hasUpperCase) missingRequirements.push('Uppercase letter (A-Z)');
    if (!hasLowerCase) missingRequirements.push('Lowercase letter (a-z)');
    if (!hasNumbers) missingRequirements.push('Number (0-9)');
    if (!hasSpecialChar) missingRequirements.push('Special character (!@#$%^&*)');
    if (!isLongEnough) missingRequirements.push('At least 8 characters');

    if (missingRequirements.length > 0) {
      Alert.alert(
        'Password Requirements',
        `Your password must contain:\n\n${missingRequirements.join('\n')}\n\nPlease update your password to meet these security requirements.`,
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    console.log('=== SIGNUP PROCESS STARTED ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Current theme:', currentTheme);

    setLoading(true);

    try {
      console.log('Calling signUp function...');
      // Import the signUp function dynamically to ensure it's available
      const { signUp } = await import('../services/firebase');
      console.log('signUp function imported successfully');

      const result = await signUp(email, password);

      console.log('=== SIGNUP RESULT ===');
      console.log('Success:', result.success);
      console.log('User object:', result.user);
      console.log('Message:', result.message);

      if (result.success) {
        console.log('✅ Signup successful!');
        console.log('User ID:', result.user?.uid);
        console.log('User email:', result.user?.email);
        console.log('Email verified:', result.user?.emailVerified);

        Alert.alert(
          'Success',
          result.message || 'Account created successfully! Please check your email to verify your account before signing in.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('User clicked OK, navigating to verify-email screen...');
                router.replace('/verify-email');
              },
            },
          ]
        );
      } else {
        console.error('❌ Signup failed!');
        console.error('Error message:', result.message);
        Alert.alert('Signup Failed', result.message || 'Signup was not successful. Please try again.');
      }
    } catch (error) {
      console.error('💥 UNEXPECTED SIGNUP ERROR!');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);

      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      console.log('Signup process completed, setting loading to false');
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <LinearGradient
      colors={currentTheme === 'dark' ? ['#0a0a0a', '#151718'] : ['#f8f6f0', '#e8e8e8']}
      style={styles.container}
    >
      {/* Theme Toggle Button */}
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
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
              Create Account
            </Text>
            <Text style={[styles.subtitle, styles[`${currentTheme}Subtitle`]]}>
              Sign up to get started
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
                <Text style={[styles.hint, styles[`${currentTheme}Hint`]]}>
                  Must contain, min 8 chars
                </Text>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={[styles.passwordStrength, styles[`${currentTheme}PasswordStrength`]]}>
                    <Text style={[styles.strengthTitle, styles[`${currentTheme}StrengthTitle`]]}>
                      Password Strength:
                    </Text>
                    <View style={styles.requirementList}>
                      <Text
                        style={[
                          styles.requirement,
                          styles[`${currentTheme}Requirement`],
                          /[A-Z]/.test(password) ? styles.requirementMet : styles.requirementMissing,
                        ]}
                      >
                        {/[A-Z]/.test(password) ? '✅' : '❌'} Uppercase
                      </Text>
                      <Text
                        style={[
                          styles.requirement,
                          styles[`${currentTheme}Requirement`],
                          /[a-z]/.test(password) ? styles.requirementMet : styles.requirementMissing,
                        ]}
                      >
                        {/[a-z]/.test(password) ? '✅' : '❌'} Lowercase
                      </Text>
                      <Text
                        style={[
                          styles.requirement,
                          styles[`${currentTheme}Requirement`],
                          /\d/.test(password) ? styles.requirementMet : styles.requirementMissing,
                        ]}
                      >
                        {/\d/.test(password) ? '✅' : '❌'} Number
                      </Text>
                      <Text
                        style={[
                          styles.requirement,
                          styles[`${currentTheme}Requirement`],
                          /[!@#$%^&*(),.?":{}|<>]/.test(password)
                            ? styles.requirementMet
                            : styles.requirementMissing,
                        ]}
                      >
                        {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✅' : '❌'} Special
                      </Text>
                      <Text
                        style={[
                          styles.requirement,
                          styles[`${currentTheme}Requirement`],
                          password.length >= 8 ? styles.requirementMet : styles.requirementMissing,
                        ]}
                      >
                        {password.length >= 8 ? '✅' : '❌'} Length (8+)
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, styles[`${currentTheme}Label`]]}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, styles[`${currentTheme}Input`]]}
                  placeholder="Confirm your password"
                  placeholderTextColor={currentTheme === 'light' ? '#666' : '#999'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ffd700' }, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: '#3d3d3d' }]}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, styles[`${currentTheme}LoginText`]]}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={[styles.loginLink, { color: '#ffd700' }]}>Sign In</Text>
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
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  hint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  darkHint: {
    color: '#999',
  },
  lightHint: {
    color: '#666',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  darkLoginText: {
    color: '#b0b0b0',
  },
  lightLoginText: {
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  passwordStrength: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  darkPasswordStrength: {
    backgroundColor: 'rgba(30, 30, 30, 0.2)',
  },
  lightPasswordStrength: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  strengthTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  darkStrengthTitle: {
    color: '#e8e8e8',
  },
  lightStrengthTitle: {
    color: '#333',
  },
  requirementList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  requirement: {
    fontSize: 12,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  darkRequirement: {
    color: '#999',
  },
  lightRequirement: {
    color: '#666',
  },
  requirementMet: {
    color: '#4CAF50', // Green for met requirements
  },
  requirementMissing: {
    color: '#F44336', // Red for missing requirements
  },
});
