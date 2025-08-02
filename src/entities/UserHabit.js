import { firestoreService } from '../services/firestore';
import { getCurrentDate } from '../utils';


export const UserHabit = {
  list: async (userId, orderByField = 'createdAt', orderDirection = 'desc') => {
    return await firestoreService.getAll(userId, 'userHabits', orderByField, orderDirection);
  },

  filter: async (userId, filters = {}) => {
    const firestoreFilters = [];
    
    if (filters.status) {
      firestoreFilters.push({ field: 'status', operator: '==', value: filters.status });
    }
    
    return await firestoreService.getFiltered(userId, 'userHabits', firestoreFilters);
  },

  create: async (userId, data) => {
    const newUserHabit = {
      start_date: getCurrentDate(),
      status: 'active',
      streak_current: 0,
      streak_longest: 0,
      total_completions: 0,
      reminder_enabled: true,
      target_frequency: 'daily',
      ...data
    };
    
    return await firestoreService.create(userId, 'userHabits', newUserHabit);
  },

  update: async (userId, id, data) => {
    return await firestoreService.update(userId, 'userHabits', id, data);
  },

  delete: async (userId, id) => {
    return await firestoreService.delete(userId, 'userHabits', id);
  },

  bulkCreate: async (userId, dataArray) => {
    const created = [];
    for (const data of dataArray) {
      const newUserHabit = {
      start_date: getCurrentDate(),
      status: 'active',
      streak_current: 0,
      streak_longest: 0,
      total_completions: 0,
      reminder_enabled: true,
      target_frequency: 'daily',
      ...data
      };
      const result = await firestoreService.create(userId, 'userHabits', newUserHabit);
      created.push(result);
    }
    return created;
  }
};