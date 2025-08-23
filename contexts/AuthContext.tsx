import { User, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 AuthContext: Setting up auth state listener');
    console.log('🔥 Auth instance:', auth);
    
    if (!auth) {
      console.log('⚠️ Auth instance not available');
      setLoading(false);
      return;
    }
    
    // Very fast timeout - only wait 500ms for Firebase
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth timeout - proceeding without Firebase');
      setLoading(false);
    }, 500); // 500ms timeout for very fast loading

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 AuthContext: Auth state changed:', user ? `User ${user.uid}` : 'No user');
      clearTimeout(timeoutId);
      setUser(user);
      setLoading(false);
    }, (error) => {
      // Handle Firebase connection errors
      console.error('❌ AuthContext: Firebase auth error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth listener');
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
