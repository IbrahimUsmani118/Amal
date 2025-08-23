# 🔧 Firebase Custom Email Setup Guide

## **Why Emails Come From Default Domain:**

Firebase Authentication automatically sends emails from `noreply@[project-id].firebaseapp.com` and **cannot be changed** without custom implementation.

## **Solution: Firebase Functions + Custom Email Service**

### **Step 1: Install Firebase CLI**
```bash
npm install -g firebase-tools
```

### **Step 2: Login to Firebase**
```bash
firebase login
```

### **Step 3: Initialize Functions in Your Project**
```bash
cd /path/to/your/Amal/project
firebase init functions
```

### **Step 4: Configure Email Service**

#### **Option A: Gmail (Easiest)**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update `functions/src/index.ts`**:
   ```typescript
   const emailConfig = {
     service: 'gmail',
     auth: {
       user: 'your-email@amal.com', // Your actual email
       pass: 'your-16-digit-app-password' // App password from step 2
     }
   };
   ```

#### **Option B: Custom SMTP Server**
1. **Get SMTP credentials** from your email provider
2. **Update `functions/src/index.ts`**:
   ```typescript
   const emailConfig = {
     host: 'smtp.yourdomain.com',
     port: 587,
     secure: false,
     auth: {
       user: 'your-email@amal.com',
       pass: 'your-smtp-password'
     }
   };
   ```

### **Step 5: Deploy Functions**
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### **Step 6: Update Your App to Use Custom Functions**

#### **Update `services/firebase.ts`**:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(app);

// Custom email verification
export const sendCustomVerificationEmail = async (email: string, verificationLink: string, displayName?: string) => {
  const sendEmail = httpsCallable(functions, 'sendCustomVerificationEmail');
  return await sendEmail({ email, verificationLink, displayName });
};

// Custom password reset
export const sendCustomPasswordResetEmail = async (email: string, resetLink: string, displayName?: string) => {
  const sendEmail = httpsCallable(functions, 'sendCustomPasswordResetEmail');
  return await sendEmail({ email, resetLink, displayName });
};
```

#### **Update `app/signup.tsx`**:
```typescript
// Replace Firebase's default email verification
// await sendEmailVerification(userCredential.user);

// With custom function
const verificationLink = `https://yourdomain.com/verify-email?token=${userCredential.user.uid}`;
await sendCustomVerificationEmail(email, verificationLink);
```

## **Alternative Solutions:**

### **Option 1: Email Service Providers**
- **SendGrid**: Professional email service with custom domain support
- **Mailgun**: Developer-friendly email API
- **AWS SES**: Amazon's email service

### **Option 2: Firebase Extensions**
- **Firebase Auth UI**: Customizable authentication UI
- **Firebase Email Templates**: Customize existing Firebase emails

## **Cost Considerations:**

- **Firebase Functions**: Pay per execution (very cheap for low volume)
- **Email Services**: Usually free tier available (SendGrid: 100 emails/day free)
- **Custom Domain**: Annual domain registration cost

## **Security Notes:**

- **Never commit** email passwords to Git
- **Use environment variables** for sensitive data
- **Enable Firebase Functions** authentication
- **Set up proper CORS** if calling from web

## **Testing:**

1. **Deploy functions** to Firebase
2. **Test signup** with valid password
3. **Check email** comes from your domain
4. **Verify email template** looks correct

## **Need Help?**

- **Firebase Functions Docs**: https://firebase.google.com/docs/functions
- **Nodemailer Docs**: https://nodemailer.com/
- **Firebase Console**: Check function logs for errors

---

**Result**: Emails will now come from `your-email@amal.com` instead of `noreply@amal-d7115.firebaseapp.com`! 🎉
