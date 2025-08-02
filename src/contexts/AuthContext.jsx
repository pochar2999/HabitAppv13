import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, fullName) => {
    setAuthError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with full name
      if (fullName) {
        await updateProfile(user, { displayName: fullName });
      }
      
      // Send email verification
      await sendEmailVerification(user);
      
      return user;
    } catch (error) {
      setAuthError(getErrorMessage(error.code));
      throw error;
    }
  };

  const signin = async (email, password) => {
    setAuthError(null);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      setAuthError(getErrorMessage(error.code));
      throw error;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(getErrorMessage(error.code));
      throw error;
    }
  };

  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setAuthError(getErrorMessage(error.code));
      throw error;
    }
  };

  const resendVerification = async () => {
    setAuthError(null);
    try {
      if (currentUser) {
        await sendEmailVerification(currentUser);
      }
    } catch (error) {
      setAuthError(getErrorMessage(error.code));
      throw error;
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const value = {
    currentUser,
    signup,
    signin,
    logout,
    resetPassword,
    resendVerification,
    authError,
    setAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};