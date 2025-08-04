import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';


export const User = {
  me: async (currentUser) => {
    if (!currentUser) return null;
    
    // Return cached user data immediately for better performance
    const cachedUser = {
      id: currentUser.uid,
      email: currentUser.email,
      full_name: currentUser.displayName || '',
      profile_picture: currentUser.photoURL || null,
      emailVerified: true,
      xp: 0,
      level: 1,
      finance_onboarding_completed: false
    };
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return {
          ...cachedUser,
          ...userDoc.data()
        };
      } else {
        // Create user document if it doesn't exist
        const userData = {
          ...cachedUser,
          created_date: new Date().toISOString(),
        };
        
        // Don't wait for this to complete
        setDoc(userDocRef, userData).catch(console.error);
        
        return userData;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      
      // Always return cached user data on error to prevent app crashes
      console.warn('Returning cached user data due to error');
      return {
        ...cachedUser,
        offline: true
      };
    }
  },

  update: async (userId, data) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date()
      });
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  updateMyUserData: async (userId, data) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date()
      });
      return data;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }
};