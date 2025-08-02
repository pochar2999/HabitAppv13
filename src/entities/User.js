import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';


export const User = {
  me: async (currentUser) => {
    if (!currentUser) return null;
    
    try {
      // Ensure network is enabled
      await enableNetwork(db);
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return {
          id: currentUser.uid,
          email: currentUser.email,
          full_name: currentUser.displayName || '',
          profile_picture: currentUser.photoURL || null,
          emailVerified: true, // Set to true since we're not requiring email verification
          ...userDoc.data()
        };
      } else {
        // Create user document if it doesn't exist
        const userData = {
          email: currentUser.email,
          full_name: currentUser.displayName || '',
          profile_picture: currentUser.photoURL || null,
          created_date: new Date().toISOString(),
          xp: 0,
          level: 1,
          finance_onboarding_completed: false
        };
        
        await setDoc(userDocRef, userData);
        
        return {
          id: currentUser.uid,
          email: currentUser.email,
          full_name: currentUser.displayName || '',
          profile_picture: currentUser.photoURL || null,
          emailVerified: true, // Set to true since we're not requiring email verification
          ...userData
        };
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      
      // If offline, return basic user data from auth
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        return {
          id: currentUser.uid,
          email: currentUser.email,
          full_name: currentUser.displayName || '',
          profile_picture: currentUser.photoURL || null,
          emailVerified: true,
          xp: 0,
          level: 1,
          finance_onboarding_completed: false,
          offline: true
        };
      }
      
      throw error;
    }
  },

  update: async (userId, data) => {
    try {
      await enableNetwork(db);
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
      await enableNetwork(db);
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