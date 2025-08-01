import { generateId, getCurrentDate } from '../utils';

// Mock daily reflection data
let mockDailyReflections = [];

export const DailyReflection = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockDailyReflections];
    
    if (filters.user_id) {
      filtered = filtered.filter(reflection => reflection.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newReflection = {
      id: generateId(),
      date: getCurrentDate(),
      answers: {},
      ...data
    };
    mockDailyReflections.push(newReflection);
    return newReflection;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockDailyReflections.findIndex(reflection => reflection.id === id);
    if (index !== -1) {
      mockDailyReflections[index] = { ...mockDailyReflections[index], ...data };
      return mockDailyReflections[index];
    }
    throw new Error('DailyReflection not found');
  }
};