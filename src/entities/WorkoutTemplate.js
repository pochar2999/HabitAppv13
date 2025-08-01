import { generateId } from '../utils';

// Mock workout template data
let mockWorkoutTemplates = [];

export const WorkoutTemplate = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockWorkoutTemplates];
    
    if (filters.user_id) {
      filtered = filtered.filter(template => template.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newTemplate = {
      id: generateId(),
      exercises: [],
      ...data
    };
    mockWorkoutTemplates.push(newTemplate);
    return newTemplate;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockWorkoutTemplates.findIndex(template => template.id === id);
    if (index !== -1) {
      mockWorkoutTemplates[index] = { ...mockWorkoutTemplates[index], ...data };
      return mockWorkoutTemplates[index];
    }
    throw new Error('WorkoutTemplate not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockWorkoutTemplates.findIndex(template => template.id === id);
    if (index !== -1) {
      mockWorkoutTemplates.splice(index, 1);
      return true;
    }
    throw new Error('WorkoutTemplate not found');
  }
};