import { firestoreService } from '../services/firestore';
import { getCurrentDate } from '../utils';


export const HabitLog = {
  list: async (userId, orderByField = 'date', orderDirection = 'desc') => {
    return await firestoreService.getAll(userId, 'habitLogs', orderByField, orderDirection);
  },

  filter: async (userId, filters = {}) => {
    const firestoreFilters = [];
    
    if (filters.user_habit_id) {
      firestoreFilters.push({ field: 'user_habit_id', operator: '==', value: filters.user_habit_id });
    }
    
    if (filters.date) {
      firestoreFilters.push({ field: 'date', operator: '==', value: filters.date });
    }
    
    return await firestoreService.getFiltered(userId, 'habitLogs', firestoreFilters, 'date', 'desc');
  },

  create: async (userId, data) => {
    const newLog = {
      date: getCurrentDate(),
      completed: true,
      ...data
    };
    
    return await firestoreService.create(userId, 'habitLogs', newLog);
  },

  update: async (userId, id, data) => {
    return await firestoreService.update(userId, 'habitLogs', id, data);
  },

  delete: async (userId, id) => {
    return await firestoreService.delete(userId, 'habitLogs', id);
  }
};