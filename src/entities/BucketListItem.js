import { generateId, getCurrentDate } from '../utils';

// Mock bucket list data
let mockBucketListItems = [];

export const BucketListItem = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockBucketListItems];
    
    if (filters.user_id) {
      filtered = filtered.filter(item => item.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newItem = {
      id: generateId(),
      completed: false,
      ...data
    };
    mockBucketListItems.push(newItem);
    return newItem;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockBucketListItems.findIndex(item => item.id === id);
    if (index !== -1) {
      mockBucketListItems[index] = { ...mockBucketListItems[index], ...data };
      return mockBucketListItems[index];
    }
    throw new Error('BucketListItem not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockBucketListItems.findIndex(item => item.id === id);
    if (index !== -1) {
      mockBucketListItems.splice(index, 1);
      return true;
    }
    throw new Error('BucketListItem not found');
  }
};