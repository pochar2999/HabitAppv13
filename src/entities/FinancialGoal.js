import { generateId } from '../utils';

// Mock financial goal data
let mockFinancialGoals = [];

export const FinancialGoal = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockFinancialGoals];
    
    if (filters.user_id) {
      filtered = filtered.filter(goal => goal.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newGoal = {
      id: generateId(),
      current_amount: 0,
      milestones: [],
      ...data
    };
    mockFinancialGoals.push(newGoal);
    return newGoal;
  }
};