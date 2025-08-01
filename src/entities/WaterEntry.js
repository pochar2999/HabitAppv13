import { generateId, getCurrentDate, getCurrentTime } from '../utils';

// Mock water entry data
let mockWaterEntries = [];

export const WaterEntry = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockWaterEntries];
    
    if (filters.user_id) {
      filtered = filtered.filter(entry => entry.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newEntry = {
      id: generateId(),
      unit: 'oz',
      date: getCurrentDate(),
      time: getCurrentTime(),
      ...data
    };
    mockWaterEntries.push(newEntry);
    return newEntry;
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockWaterEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      mockWaterEntries.splice(index, 1);
      return true;
    }
    throw new Error('WaterEntry not found');
  }
};