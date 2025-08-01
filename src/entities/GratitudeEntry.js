import { generateId, getCurrentDate } from '../utils';

// Mock gratitude entry data
let mockGratitudeEntries = [];

export const GratitudeEntry = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockGratitudeEntries];
    
    if (filters.user_id) {
      filtered = filtered.filter(entry => entry.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newEntry = {
      id: generateId(),
      color: 'yellow',
      date: getCurrentDate(),
      ...data
    };
    mockGratitudeEntries.push(newEntry);
    return newEntry;
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockGratitudeEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      mockGratitudeEntries.splice(index, 1);
      return true;
    }
    throw new Error('GratitudeEntry not found');
  }
};