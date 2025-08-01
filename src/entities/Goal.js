import { generateId, getCurrentDate } from '../utils';

// Mock goals data
let mockGoals = [];

export const Goal = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockGoals];
    
    if (filters.user_id) {
      filtered = filtered.filter(goal => goal.user_id === filters.user_id);
    }
    
    if (filters.created_by) {
      filtered = filtered.filter(goal => goal.created_by === filters.created_by);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newGoal = {
      id: generateId(),
      created_by: 'demo@habitapp.com',
      progress: 0,
      status: 'active',
      milestones: [],
      ...data
    };
    mockGoals.push(newGoal);
    return newGoal;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockGoals.findIndex(goal => goal.id === id);
    if (index !== -1) {
      mockGoals[index] = { ...mockGoals[index], ...data };
      return mockGoals[index];
    }
    throw new Error('Goal not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockGoals.findIndex(goal => goal.id === id);
    if (index !== -1) {
      mockGoals.splice(index, 1);
      return true;
    }
    throw new Error('Goal not found');
  }
};