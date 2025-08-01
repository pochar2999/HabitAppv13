import { generateId } from '../utils';

// Mock habit stacks data
let mockHabitStacks = [];

export const HabitStack = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockHabitStacks];
    
    if (filters.user_id) {
      filtered = filtered.filter(stack => stack.user_id === filters.user_id);
    }
    
    if (filters.is_active !== undefined) {
      filtered = filtered.filter(stack => stack.is_active === filters.is_active);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newStack = {
      id: generateId(),
      is_active: true,
      user_habit_ids: [],
      order: 0,
      ...data
    };
    mockHabitStacks.push(newStack);
    return newStack;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockHabitStacks.findIndex(stack => stack.id === id);
    if (index !== -1) {
      mockHabitStacks[index] = { ...mockHabitStacks[index], ...data };
      return mockHabitStacks[index];
    }
    throw new Error('HabitStack not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockHabitStacks.findIndex(stack => stack.id === id);
    if (index !== -1) {
      mockHabitStacks.splice(index, 1);
      return true;
    }
    throw new Error('HabitStack not found');
  }
};