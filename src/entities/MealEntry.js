import { generateId, getCurrentDate, getCurrentTime } from '../utils';

// Mock meal entry data
let mockMealEntries = [];

export const MealEntry = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockMealEntries];
    
    if (filters.user_id) {
      filtered = filtered.filter(entry => entry.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newEntry = {
      id: generateId(),
      date: getCurrentDate(),
      time: getCurrentTime(),
      ...data
    };
    mockMealEntries.push(newEntry);
    return newEntry;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockMealEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      mockMealEntries[index] = { ...mockMealEntries[index], ...data };
      return mockMealEntries[index];
    }
    throw new Error('MealEntry not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockMealEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      mockMealEntries.splice(index, 1);
      return true;
    }
    throw new Error('MealEntry not found');
  }
};