import { generateId, getCurrentDate } from '../utils';

// Mock habit logs data
let mockHabitLogs = [];

export const HabitLog = {
  list: async (orderBy = '') => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let sorted = [...mockHabitLogs];
    
    if (orderBy === '-date') {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    return sorted;
  },

  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockHabitLogs];
    
    if (filters.user_habit_id) {
      filtered = filtered.filter(log => log.user_habit_id === filters.user_habit_id);
    }
    
    if (filters.date) {
      filtered = filtered.filter(log => log.date === filters.date);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newLog = {
      id: generateId(),
      date: getCurrentDate(),
      completed: true,
      ...data
    };
    mockHabitLogs.push(newLog);
    return newLog;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockHabitLogs.findIndex(log => log.id === id);
    if (index !== -1) {
      mockHabitLogs[index] = { ...mockHabitLogs[index], ...data };
      return mockHabitLogs[index];
    }
    throw new Error('HabitLog not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockHabitLogs.findIndex(log => log.id === id);
    if (index !== -1) {
      mockHabitLogs.splice(index, 1);
      return true;
    }
    throw new Error('HabitLog not found');
  }
};