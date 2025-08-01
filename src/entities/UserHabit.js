import { generateId, getCurrentDate } from '../utils';

// Mock user habits data
let mockUserHabits = [];

export const UserHabit = {
  list: async (orderBy = '') => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let sorted = [...mockUserHabits];
    
    if (orderBy === '-created_date') {
      sorted.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    }
    
    return sorted;
  },

  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockUserHabits];
    
    if (filters.user_id) {
      filtered = filtered.filter(uh => uh.user_id === filters.user_id);
    }
    
    if (filters.status) {
      filtered = filtered.filter(uh => uh.status === filters.status);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newUserHabit = {
      id: generateId(),
      start_date: getCurrentDate(),
      status: 'active',
      streak_current: 0,
      streak_longest: 0,
      total_completions: 0,
      reminder_enabled: true,
      target_frequency: 'daily',
      ...data
    };
    mockUserHabits.push(newUserHabit);
    return newUserHabit;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockUserHabits.findIndex(uh => uh.id === id);
    if (index !== -1) {
      mockUserHabits[index] = { ...mockUserHabits[index], ...data };
      return mockUserHabits[index];
    }
    throw new Error('UserHabit not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockUserHabits.findIndex(uh => uh.id === id);
    if (index !== -1) {
      mockUserHabits.splice(index, 1);
      return true;
    }
    throw new Error('UserHabit not found');
  },

  bulkCreate: async (dataArray) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const created = dataArray.map(data => ({
      id: generateId(),
      start_date: getCurrentDate(),
      status: 'active',
      streak_current: 0,
      streak_longest: 0,
      total_completions: 0,
      reminder_enabled: true,
      target_frequency: 'daily',
      ...data
    }));
    mockUserHabits.push(...created);
    return created;
  }
};