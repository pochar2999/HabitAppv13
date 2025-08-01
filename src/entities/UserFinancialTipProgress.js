import { generateId, getCurrentDate } from '../utils';

// Mock user financial tip progress data
let mockUserFinancialTipProgress = [];

export const UserFinancialTipProgress = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockUserFinancialTipProgress];
    
    if (filters.user_id) {
      filtered = filtered.filter(progress => progress.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newProgress = {
      id: generateId(),
      completed_date: getCurrentDate(),
      ...data
    };
    mockUserFinancialTipProgress.push(newProgress);
    return newProgress;
  }
};