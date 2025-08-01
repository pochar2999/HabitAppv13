import { generateId } from '../utils';

// Mock liability data
let mockLiabilities = [];

export const Liability = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockLiabilities];
    
    if (filters.user_id) {
      filtered = filtered.filter(liability => liability.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newLiability = {
      id: generateId(),
      interest_rate: 0,
      ...data
    };
    mockLiabilities.push(newLiability);
    return newLiability;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockLiabilities.findIndex(liability => liability.id === id);
    if (index !== -1) {
      mockLiabilities[index] = { ...mockLiabilities[index], ...data };
      return mockLiabilities[index];
    }
    throw new Error('Liability not found');
  },

  bulkCreate: async (dataArray) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const created = dataArray.map(data => ({
      id: generateId(),
      interest_rate: 0,
      ...data
    }));
    mockLiabilities.push(...created);
    return created;
  }
};