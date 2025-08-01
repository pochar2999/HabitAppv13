import { generateId } from '../utils';

// Mock user badge data
let mockUserBadges = [];

export const UserBadge = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockUserBadges];
    
    if (filters.user_id) {
      filtered = filtered.filter(ub => ub.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newUserBadge = {
      id: generateId(),
      achieved_date: new Date().toISOString().split('T')[0],
      ...data
    };
    mockUserBadges.push(newUserBadge);
    return newUserBadge;
  }
};