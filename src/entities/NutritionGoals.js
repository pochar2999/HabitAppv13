import { generateId } from '../utils';

// Mock nutrition goals data
let mockNutritionGoals = [];

export const NutritionGoals = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockNutritionGoals];
    
    if (filters.user_id) {
      filtered = filtered.filter(goals => goals.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newGoals = {
      id: generateId(),
      daily_calories: 2000,
      daily_protein: 50,
      daily_carbs: 250,
      daily_fat: 65,
      daily_water: 64,
      water_unit: 'oz',
      ...data
    };
    mockNutritionGoals.push(newGoals);
    return newGoals;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockNutritionGoals.findIndex(goals => goals.id === id);
    if (index !== -1) {
      mockNutritionGoals[index] = { ...mockNutritionGoals[index], ...data };
      return mockNutritionGoals[index];
    }
    throw new Error('NutritionGoals not found');
  }
};