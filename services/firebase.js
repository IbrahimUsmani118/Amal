// Import the functions you need from the SDKs you need
import { getApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { getFunctions, httpsCallable } from 'firebase/functions';

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
let app;
let auth;
let functions;

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
let sendCustomVerificationEmail;
let sendCustomPasswordResetEmail;
let createUserWithCustomVerification;
let verifyEmailToken;
let resendVerificationEmail;
let testFirebaseConnection;

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
export const signUp = async (email, password) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Email verification disabled - users can access app immediately
    
    // Store authentication data for persistence
    try {
      const { default: secureStorageService } = await import('@/services/secureStorage.js');
      const token = await user.getIdToken();
      if (token) {
        await secureStorageService.storeToken(token);
      }
      await secureStorageService.storeUserData({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
      console.log('✅ Auth data stored for persistence');
    } catch (storageError) {
      console.warn('⚠️ Error storing auth data:', storageError);
      // Continue even if storage fails
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code || error.message 
    };
  }
};

// Sign in function
export const signIn = async (email, password) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store authentication data for persistence
    try {
      const { default: secureStorageService } = await import('@/services/secureStorage.js');
      const token = await user.getIdToken();
      if (token) {
        await secureStorageService.storeToken(token);
      }
      await secureStorageService.storeUserData({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
      console.log('✅ Auth data stored for persistence');
    } catch (storageError) {
      console.warn('⚠️ Error storing auth data:', storageError);
      // Continue even if storage fails
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code || error.message 
    };
  }
};

// Login or create user (single method that handles both)
export const loginOrCreate = async (email, password) => {
  let trimmedEmail = '';
  
  try {
    // Enhanced validation
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return {
        success: false,
        error: 'Email and password are required',
        errorCode: 'auth/missing-credentials'
      };
    }
    
    trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email address',
        errorCode: 'auth/invalid-email'
      };
    }
    
    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long',
        errorCode: 'auth/weak-password'
      };
    }
    
    // Try to sign in first
    let userCredential;
    let isNewUser = false;
    
    try {
      userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (signInError) {
      // Only create new account if user is definitely not found
      if (signInError.code === 'auth/user-not-found') {
        // User definitely doesn't exist, create account
        try {
          userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          isNewUser = true;
          
          const user = userCredential?.user;
          if (!user || !user.uid) {
            throw new Error('Invalid user credential received after creation');
          }
          
          // Email verification disabled - users can access app immediately
          
          // Store authentication data for persistence
          try {
            const { default: secureStorageService } = await import('@/services/secureStorage.js');
            const token = await user.getIdToken();
            if (token) {
              await secureStorageService.storeToken(token);
            }
            await secureStorageService.storeUserData({
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              displayName: user.displayName,
              photoURL: user.photoURL,
            });
            console.log('✅ Auth data stored for persistence');
          } catch (storageError) {
            console.warn('⚠️ Error storing auth data:', storageError);
          }
          
          return {
            success: true,
            user: user,
            isNewUser: true
          };
        } catch (createError) {
          throw createError;
        }
      } else if (signInError.code === 'auth/invalid-credential') {
        // Invalid credential - could be wrong password OR user doesn't exist
        // Try to create account to determine which case
        try {
          userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          isNewUser = true;
          
          const user = userCredential?.user;
          if (!user || !user.uid) {
            throw new Error('Invalid user credential received after creation');
          }
          
          // Email verification disabled - users can access app immediately
          
          // Store authentication data for persistence
          try {
            const { default: secureStorageService } = await import('@/services/secureStorage.js');
            const token = await user.getIdToken();
            if (token) {
              await secureStorageService.storeToken(token);
            }
            await secureStorageService.storeUserData({
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              displayName: user.displayName,
              photoURL: user.photoURL,
            });
            console.log('✅ Auth data stored for persistence');
          } catch (storageError) {
            console.warn('⚠️ Error storing auth data:', storageError);
          }
          
          return {
            success: true,
            user: user,
            isNewUser: true
          };
        } catch (createError) {
          // If email already in use, user exists but sign-in failed
          if (createError.code === 'auth/email-already-in-use') {
            // User exists - the password was likely wrong, but let's be helpful
            return {
              success: false,
              error: 'Unable to sign in. Please check your password or use "Forgot Password" to reset it.',
              errorCode: 'auth/invalid-credential'
            };
          }
          // Other create errors
          throw createError;
        }
      } else {
        // Other errors (network, etc.)
        throw signInError;
      }
    }
    
    const user = userCredential?.user;
    if (!user || !user.uid) {
      throw new Error('Invalid user credential received');
    }
    
    // Store authentication data for persistence (for both new and existing users)
    try {
      const { default: secureStorageService } = await import('@/services/secureStorage.js');
      const token = await user.getIdToken();
      if (token) {
        await secureStorageService.storeToken(token);
      }
      await secureStorageService.storeUserData({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
      console.log('✅ Auth data stored for persistence');
    } catch (storageError) {
      console.warn('⚠️ Error storing auth data:', storageError);
      // Continue even if storage fails
    }
    
    return {
      success: true,
      user: user,
      isNewUser: isNewUser
    };
  } catch (error) {
    // Provide user-friendly error messages
    let errorMessage = error.message || 'Authentication failed';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      errorMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code || 'auth/unknown-error'
    };
  }
};

// Sign out function
export const signOutUser = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    // Clear secure storage before signing out
    try {
      const { default: secureStorageService } = await import('@/services/secureStorage.js');
      await secureStorageService.clearAuthData();
      console.log('✅ Cleared stored auth data');
    } catch (storageError) {
      console.warn('⚠️ Error clearing storage:', storageError);
      // Continue with sign out even if storage clear fails
    }

    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    // Try custom function first, fallback to direct method
    if (sendCustomPasswordResetEmail) {
      const result = await sendCustomPasswordResetEmail({ email });
      return { success: true, data: result.data };
    } else {
      // Fallback to direct Firebase method
      const { sendPasswordResetEmail: firebaseSendPasswordResetEmail } = await import('firebase/auth');
      await firebaseSendPasswordResetEmail(auth, email);
      return { success: true };
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message };
  }
};

// Resend verification email
export const resendVerification = async (user) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    // Try custom function first, fallback to direct method
    if (resendVerificationEmail) {
      const result = await resendVerificationEmail({ uid: user.uid });
      return { success: true, data: result.data };
    } else {
      // Fallback to direct Firebase method
      await sendEmailVerification(user);
      return { success: true };
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, error: error.message };
  }
};

// Test Firebase connection
export const testConnection = async () => {
  try {
    if (testFirebaseConnection) {
      const result = await testFirebaseConnection();
      return { success: true, data: result.data };
    } else {
      // Simple test - just check if auth is available
      return { success: !!auth, data: { message: 'Auth available' } };
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return { success: false, error: error.message };
  }
};

// Export Firebase instances
export { auth, functions };
