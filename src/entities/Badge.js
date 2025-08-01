import { generateId } from '../utils';

// Mock badge data
let mockBadges = [];

export const Badge = {
  list: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockBadges];
  },

  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockBadges];
    
    if (filters.user_id) {
      filtered = filtered.filter(badge => badge.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newBadge = {
      id: generateId(),
      ...data
    };
    mockBadges.push(newBadge);
    return newBadge;
  }
};