import { firestoreService } from '../services/firestore';
import { getCurrentDate } from '../utils';


export const JournalEntry = {
  filter: async (userId, filters = {}) => {
    return await firestoreService.getAll(userId, 'journalEntries', 'date', 'desc');
  },

  create: async (userId, data) => {
    const newEntry = {
      date: getCurrentDate(),
      mood: 'neutral',
      tags: [],
      ...data
    };
    
    return await firestoreService.create(userId, 'journalEntries', newEntry);
  },

  update: async (userId, id, data) => {
    return await firestoreService.update(userId, 'journalEntries', id, data);
  },

  delete: async (userId, id) => {
    return await firestoreService.delete(userId, 'journalEntries', id);
  }
};