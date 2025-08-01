import { generateId } from '../utils';

// Mock finance profile data
let mockFinanceProfiles = [];

export const FinanceProfile = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockFinanceProfiles];
    
    if (filters.user_id) {
      filtered = filtered.filter(profile => profile.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newProfile = {
      id: generateId(),
      monthly_income: 0,
      tax_rate: 0,
      k401_contribution: 0,
      k401_employer_match: 0,
      roth_ira_contribution: 0,
      savings_goal_type: 'percentage',
      savings_goal_value: 0,
      ...data
    };
    mockFinanceProfiles.push(newProfile);
    return newProfile;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockFinanceProfiles.findIndex(profile => profile.id === id);
    if (index !== -1) {
      mockFinanceProfiles[index] = { ...mockFinanceProfiles[index], ...data };
      return mockFinanceProfiles[index];
    }
    throw new Error('FinanceProfile not found');
  }
};