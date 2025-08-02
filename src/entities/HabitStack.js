import { firestoreService } from '../services/firestore';


export const HabitStack = {
  filter: async (userId, filters = {}) => {
    const firestoreFilters = [];
    
    if (filters.is_active !== undefined) {
      firestoreFilters.push({ field: 'is_active', operator: '==', value: filters.is_active });
    }
    
    return await firestoreService.getFiltered(userId, 'habitStacks', firestoreFilters);
  },

  create: async (userId, data) => {
    const newStack = {
      is_active: true,
      user_habit_ids: [],
      order: 0,
      ...data
    };
    
    return await firestoreService.create(userId, 'habitStacks', newStack);
  },

  update: async (userId, id, data) => {
    return await firestoreService.update(userId, 'habitStacks', id, data);
  },

  delete: async (userId, id) => {
    return await firestoreService.delete(userId, 'habitStacks', id);
  }
};