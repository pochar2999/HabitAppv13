import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EmailVerification from './EmailVerification';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  // If user is not signed in, this will be handled by App.jsx
  if (!currentUser) {
    return null;
  }


  // User is signed in
  return children;
}