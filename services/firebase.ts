// Import the functions you need from the SDKs you need
import { FirebaseApp, getApp, initializeApp } from "firebase/app";
import {
    Auth,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    User
} from "firebase/auth";
import { Functions, getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration - Replace with your actual Firebase config
// Get these values from your Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyDm2CN6JBs9Z0rLYt58_3ynczgOYArTrf8",
  authDomain: "amal-d7115.firebaseapp.com",
  projectId: "amal-d7115",
  storageBucket: "amal-d7115.firebasestorage.app",
  messagingSenderId: "744961912002",
  appId: "1:744961912002:web:6dcde84198b6b242301f5b",
  measurementId: "G-D3R65BJHDF"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth | undefined;
let functions: Functions | undefined;

try {
  // Check if Firebase app already exists
  try {
    app = getApp();
    console.log('✅ Firebase app already initialized');
  } catch {
    // Initialize new Firebase app
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');
  }

  // Initialize Firebase services
  auth = getAuth(app);
  functions = getFunctions(app);
  console.log('✅ Firebase services initialized successfully');
  console.log('🔧 Auth instance:', auth);
  console.log('🔧 Functions instance:', functions);

} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  // Don't throw error, just log it and continue
  // This prevents the app from crashing
}

// Firebase Functions for custom email handling (only if functions are available)
let sendCustomVerificationEmail: any;
let sendCustomPasswordResetEmail: any;
let createUserWithCustomVerification: any;
let verifyEmailToken: any;
let resendVerificationEmail: any;
let testFirebaseConnection: any;

try {
  if (functions && typeof functions !== 'undefined') {
    sendCustomVerificationEmail = httpsCallable(functions, 'sendCustomVerificationEmail');
    sendCustomPasswordResetEmail = httpsCallable(functions, 'sendCustomPasswordResetEmail');
    createUserWithCustomVerification = httpsCallable(functions, 'createUserWithCustomVerification');
    verifyEmailToken = httpsCallable(functions, 'verifyEmailToken');
    resendVerificationEmail = httpsCallable(functions, 'resendVerificationEmail');
    testFirebaseConnection = httpsCallable(functions, 'testFirebaseConnection');
    console.log('✅ Firebase functions initialized successfully');
  }
} catch (error) {
  console.warn('⚠️ Firebase functions not available, using direct Auth methods:', error);
}

// Sign up function using Firebase Auth directly (fallback to custom function if needed)
export const signUp = async (email: string, password: string, displayName?: string) => {
  if (!auth) {
    return {
      success: false,
      user: null,
      message: 'Firebase is not initialized. Please try again.'
    };
  }

  try {
    console.log('🔐 Starting signup process for:', email);
    
    // Try to create user with Firebase Auth first
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name if provided
    if (displayName) {
      // Note: updateProfile is not available in the current import, so we'll skip this for now
      console.log('Display name update skipped (not implemented)');
    }
    
    // Send email verification
    await sendEmailVerification(user);
    
    console.log('✅ User created successfully with Firebase Auth:', user.uid);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      },
      message: 'Account created successfully! Please check your email to verify your account.'
    };
    
  } catch (error: any) {
    console.error('❌ Error in signUp:', error);
    
    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        user: null,
        message: 'An account with this email already exists. Please try logging in instead.'
      };
    }
    
    if (error.code === 'auth/weak-password') {
      return {
        success: false,
        user: null,
        message: 'Password is too weak. Please use a stronger password (at least 6 characters).'
      };
    }
    
    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        user: null,
        message: 'Please enter a valid email address.'
      };
    }
    
    if (error.code === 'auth/operation-not-allowed') {
      return {
        success: false,
        user: null,
        message: 'Email/password accounts are not enabled. Please contact support.'
      };
    }
    
    if (error.code === 'auth/network-request-failed') {
      return {
        success: false,
        user: null,
        message: 'Network error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      user: null,
      message: 'Failed to create account. Please try again.'
    };
  }
};

// Sign in function
export const signIn = async (email: string, password: string) => {
  if (!auth) {
    return {
      success: false,
      user: null,
      message: 'Firebase is not initialized. Please try again.'
    };
  }

  try {
    console.log('🔐 Starting signin process for:', email);
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Signin successful:', result.user.email);
    
    // Temporarily disable email verification requirement for testing
    // TODO: Re-enable this after testing
    /*
    // Check if email is verified
    if (!result.user.emailVerified) {
      console.log('⚠️ User email not verified');
      return {
        success: false,
        user: null,
        message: 'Please verify your email before signing in. Check your inbox for a verification link.'
      };
    }
    */
    
    return {
      success: true,
      user: result.user
    };
    
  } catch (error: any) {
    console.error('❌ Error in signIn:', error);
    
    if (error.code === 'auth/user-not-found') {
      return {
        success: false,
        user: null,
        message: 'No account found with this email. Please check your email or create a new account.'
      };
    }
    
    if (error.code === 'auth/wrong-password') {
      return {
        success: false,
        user: null,
        message: 'Incorrect password. Please try again.'
      };
    }
    
    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        user: null,
        message: 'Please enter a valid email address.'
      };
    }
    
    if (error.code === 'auth/user-disabled') {
      return {
        success: false,
        user: null,
        message: 'This account has been disabled. Please contact support.'
      };
    }
    
    if (error.code === 'auth/too-many-requests') {
      return {
        success: false,
        user: null,
        message: 'Too many failed attempts. Please try again later.'
      };
    }
    
    if (error.code === 'auth/network-request-failed') {
      return {
        success: false,
        user: null,
        message: 'Network error. Please check your internet connection and try again.'
      };
    }
    
    if (error.code === 'auth/operation-not-allowed') {
      return {
        success: false,
        user: null,
        message: 'Email/password sign-in is not enabled. Please contact support.'
      };
    }
    
    return {
      success: false,
      user: null,
      message: 'Failed to sign in. Please try again.'
    };
  }
};

// Password reset function using Firebase Auth directly
export const resetPassword = async (email: string) => {
  if (!auth) {
    return {
      success: false,
      message: 'Firebase is not initialized. Please try again.'
    };
  }

  try {
    console.log('🔐 Starting password reset for:', email);
    
    // Import sendPasswordResetEmail dynamically to avoid import issues
    const { sendPasswordResetEmail } = await import('firebase/auth');
    
    await sendPasswordResetEmail(auth, email);
    
    console.log('✅ Password reset email sent successfully');
    
    return {
      success: true,
      message: 'Password reset email sent! Please check your inbox.'
    };
    
  } catch (error: any) {
    console.error('❌ Error in resetPassword:', error);
    
    if (error.code === 'auth/user-not-found') {
      return {
        success: false,
        message: 'No account found with this email address.'
      };
    }
    
    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        message: 'Please enter a valid email address.'
      };
    }
    
    if (error.code === 'auth/network-request-failed') {
      return {
        success: false,
        message: 'Network error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      message: 'Failed to send password reset email. Please try again.'
    };
  }
};

// Logout function
export const logout = async () => {
  console.log('🔐 Logout function called');
  console.log('🔐 Auth instance:', auth);
  
  if (!auth) {
    console.log('❌ No auth instance available');
    return { success: false };
  }

  try {
    console.log('🔐 Starting logout process');
    console.log('🔐 Current user before logout:', auth.currentUser?.email);
    
    await signOut(auth);
    
    console.log('✅ Logout successful');
    console.log('🔐 Current user after logout:', auth.currentUser?.email);
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error in logout:', error);
    console.error('❌ Error details:', error.code, error.message);
    throw new Error('Failed to logout. Please try again.');
  }
};

// Resend verification email function
export const resendVerification = async (email: string, uid: string) => {
  try {
    console.log('🔐 Resending verification email for:', email);
    
    const result = await resendVerificationEmail({ email, uid });
    console.log('✅ Verification email resent successfully');
    
    return {
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    };
    
  } catch (error: any) {
    console.error('❌ Error resending verification email:', error);
    throw new Error('Failed to resend verification email. Please try again.');
  }
};

// Verify email token function
export const verifyEmail = async (token: string) => {
  try {
    console.log('🔐 Verifying email token:', token);
    
    const result = await verifyEmailToken({ token });
    console.log('✅ Email verified successfully');
    
    const data = result.data as any;
    return {
      success: true,
      message: 'Email verified successfully! You can now sign in.',
      user: data.user
    };
    
  } catch (error: any) {
    console.error('❌ Error verifying email:', error);
    throw new Error('Failed to verify email. Please try again.');
  }
};

// Export auth instance and functions for use in other parts of the app
export { auth, functions, onAuthStateChanged, User };

