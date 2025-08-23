import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin
admin.initializeApp();

// Email configuration - Replace with your actual email service details
// You'll need to set these as environment variables in Firebase Functions
const emailConfig = {
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.FIREBASE_FUNCTIONS_EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.FIREBASE_FUNCTIONS_EMAIL_PASS || 'your-app-password'
  }
};

// Create email transporter
const transporter = nodemailer.createTransport(emailConfig);

// Function to send custom verification email
export const sendCustomVerificationEmail = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { email, verificationLink, displayName } = data;
    
    // Verify the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Email template
    const mailOptions = {
      from: `"Amal App" <${emailConfig.auth.user}>`,
      to: email,
      subject: 'Verify Your Email - Amal App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">Amal App</h1>
            <p style="color: #1a1a2e; margin: 10px 0 0 0; font-size: 16px;">Email Verification</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Amal!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${displayName || 'there'},<br><br>
              Thank you for creating an account with Amal. To complete your registration and start using the app, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #ffd700; color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; word-break: break-all; color: #333; font-family: monospace; font-size: 14px;">
              ${verificationLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This email was sent from Amal App. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Custom verification email sent successfully:', result);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error: any) {
    console.error('Error sending custom verification email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send verification email');
  }
});

// Function to send custom password reset email
export const sendCustomPasswordResetEmail = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { email, resetLink, displayName } = data;
    
    // Email template
    const mailOptions = {
      from: `"Amal App" <${emailConfig.auth.user}>`,
      to: email,
      subject: 'Reset Your Password - Amal App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">Amal App</h1>
            <p style="color: #1a1a2e; margin: 10px 0 0 0; font-size: 16px;">Password Reset</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${displayName || 'there'},<br><br>
              We received a request to reset your password for your Amal account. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: #ffd700; color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; word-break: break-all; color: #333; font-family: monospace; font-size: 14px;">
              ${resetLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This email was sent from Amal App. If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Custom password reset email sent successfully:', result);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error: any) {
    console.error('Error sending custom password reset email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send password reset email');
  }
});

// Function to handle custom user registration with email verification
export const createUserWithCustomVerification = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { email, password, displayName } = data;
    
    // Create user with Firebase Admin
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });

    // Generate custom verification link
    const verificationLink = `https://YOUR_DOMAIN.com/verify-email?token=${userRecord.uid}`;
    
    // Send custom verification email
    const mailOptions = {
      from: `"Amal App" <${emailConfig.auth.user}>`,
      to: email,
      subject: 'Welcome to Amal - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">Amal App</h1>
            <p style="color: #1a1a2e; margin: 10px 0 0 0; font-size: 16px;">Welcome!</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Amal!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${displayName || 'there'},<br><br>
              Your account has been created successfully! To start using Amal, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #ffd700; color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; word-break: break-all; color: #333; font-family: monospace; font-size: 14px;">
              ${verificationLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This email was sent from Amal App. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const emailResult = await transporter.sendMail(mailOptions);
    
    console.log('User created and verification email sent:', userRecord.uid);
    
    return { 
      success: true, 
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified
      },
      messageId: emailResult.messageId
    };
    
  } catch (error: any) {
    console.error('Error creating user with custom verification:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new functions.https.HttpsError('already-exists', 'An account with this email already exists');
    }
    
    if (error.code === 'auth/weak-password') {
      throw new functions.https.HttpsError('invalid-argument', 'Password is too weak');
    }
    
    if (error.code === 'auth/invalid-email') {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email address');
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to create user and send verification email');
  }
});

// Function to verify email token and mark user as verified
export const verifyEmailToken = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { token } = data;
    
    // Get user by UID
    const userRecord = await admin.auth().getUser(token);
    
    if (userRecord.emailVerified) {
      return { success: true, message: 'Email already verified' };
    }
    
    // Mark email as verified
    await admin.auth().updateUser(token, {
      emailVerified: true
    });
    
    console.log('Email verified for user:', token);
    
    return { 
      success: true, 
      message: 'Email verified successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: true
      }
    };
    
  } catch (error: any) {
    console.error('Error verifying email token:', error);
    throw new functions.https.HttpsError('internal', 'Failed to verify email token');
  }
});

// Function to resend verification email
export const resendVerificationEmail = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { email, uid } = data;
    
    // Generate new verification link
    const verificationLink = `https://YOUR_DOMAIN.com/verify-email?token=${uid}`;
    
    // Send verification email
    const mailOptions = {
      from: `"Amal App" <${emailConfig.auth.user}>`,
      to: email,
      subject: 'Verify Your Email - Amal App (Resent)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">Amal App</h1>
            <p style="color: #1a1a2e; margin: 10px 0 0 0; font-size: 16px;">Email Verification</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi there,<br><br>
              You requested a new verification email. Please click the button below to verify your email address and complete your account setup.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #ffd700; color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; word-break: break-all; color: #333; font-family: monospace; font-size: 14px;">
              ${verificationLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This email was sent from Amal App. If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Verification email resent successfully:', result);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to resend verification email');
  }
});

// Function to test Firebase connection
export const testFirebaseConnection = functions.https.onCall(async (data: any, context: any) => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Firebase Admin
    console.log('Firebase Admin initialized successfully');
    
    // Test email transporter
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    return { 
      success: true, 
      message: 'Firebase connection test successful',
      timestamp: new Date().toISOString()
    };
    
  } catch (error: any) {
    console.error('Firebase connection test failed:', error);
    throw new functions.https.HttpsError('internal', 'Firebase connection test failed');
  }
});
