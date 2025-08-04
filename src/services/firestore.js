import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Generic Firestore service functions
export const firestoreService = {
  // Create a document
  create: async (userId, collectionName, data) => {
    try {
      const userCollectionRef = collection(db, 'users', userId, collectionName);
      const docRef = await addDoc(userCollectionRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating ${collectionName}:`, error);
      throw error;
    }
  },

  // Get all documents from a collection
  getAll: async (userId, collectionName, orderByField = 'createdAt', orderDirection = 'desc') => {
    try {
      const userCollectionRef = collection(db, 'users', userId, collectionName);
      const q = query(userCollectionRef, orderBy(orderByField, orderDirection));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      
      // Return empty array if offline
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.warn(`${collectionName} data unavailable offline, returning empty array`);
        return [];
      }
      
      throw error;
    }
  },

  // Get documents with filter
  getFiltered: async (userId, collectionName, filters = [], orderByField = 'createdAt', orderDirection = 'desc') => {
    try {
      const userCollectionRef = collection(db, 'users', userId, collectionName);
      let q = query(userCollectionRef);
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting filtered ${collectionName}:`, error);
      
      // Return empty array if offline
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.warn(`${collectionName} data unavailable offline, returning empty array`);
        return [];
      }
      
      throw error;
    }
  },

  // Get a single document
  getById: async (userId, collectionName, docId) => {
    try {
      const docRef = doc(db, 'users', userId, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting ${collectionName} by ID:`, error);
      
      // Return null if offline
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.warn(`${collectionName} document unavailable offline, returning null`);
        return null;
      }
      
      throw error;
    }
  },

  // Update a document
  update: async (userId, collectionName, docId, data) => {
    try {
      const docRef = doc(db, 'users', userId, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      return { id: docId, ...data };
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete a document
  delete: async (userId, collectionName, docId) => {
    try {
      const docRef = doc(db, 'users', userId, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error);
      throw error;
    }
  },

  // Listen to real-time updates
  listen: (userId, collectionName, callback, filters = [], orderByField = 'createdAt', orderDirection = 'desc') => {
    try {
      const userCollectionRef = collection(db, 'users', userId, collectionName);
      let q = query(userCollectionRef);
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      return onSnapshot(q, (querySnapshot) => {
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(docs);
      });
    } catch (error) {
      console.error(`Error listening to ${collectionName}:`, error);
      throw error;
    }
  }
};