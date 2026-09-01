# Authentication

The app uses Firebase Authentication for user management.

## Features

- **Registration** - Create accounts with email/password
- **Login** - Sign in with existing credentials  
- **Password Reset** - Email-based password recovery
- **Persistent Sessions** - Stay logged in across app restarts
- **Protected Routes** - Automatic redirects based on auth state

## Pages

- `/login` - Sign in form
- `/signup` - Registration form
- `/forgot-password` - Password reset

## Setup

See `FIREBASE_SETUP.md` for Firebase configuration instructions.

## Usage

### For Users

1. Create an account at `/signup`
2. Sign in at `/login`
3. Access the Quran reader
4. Logout via the header button

### For Developers

Authentication state is managed via React Context:

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Redirect to="/login" />;
  
  return <AuthenticatedContent user={user} />;
}
```

Firebase functions are available from `services/firebase.js`:

```javascript
import { signUp, signIn, signOutUser, sendPasswordResetEmail } from '@/services/firebase';

// Register
const result = await signUp(email, password);

// Login  
const result = await signIn(email, password);

// Logout
await signOutUser();

// Password reset
await sendPasswordResetEmail(email);
```

## Security

- Minimum 6 character passwords (enforced by Firebase)
- Email validation
- Secure token storage via expo-secure-store
- Automatic session refresh
