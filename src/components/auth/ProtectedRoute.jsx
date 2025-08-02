import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EmailVerification from './EmailVerification';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  // If user is not signed in, this will be handled by App.jsx
  if (!currentUser) {
    return null;
  }

  // If user is signed in but email is not verified
  if (!currentUser.emailVerified) {
    return <EmailVerification />;
  }

  // User is signed in and email is verified
  return children;
}