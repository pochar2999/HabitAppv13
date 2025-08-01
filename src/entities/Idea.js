import { generateId } from '../utils';

// Mock idea data
let mockIdeas = [];

export const Idea = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockIdeas];
    
    if (filters.user_id) {
      filtered = filtered.filter(idea => idea.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newIdea = {
      id: generateId(),
      status: 'Backlog',
      ...data
    };
    mockIdeas.push(newIdea);
    return newIdea;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockIdeas.findIndex(idea => idea.id === id);
    if (index !== -1) {
      mockIdeas[index] = { ...mockIdeas[index], ...data };
      return mockIdeas[index];
    }
    throw new Error('Idea not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockIdeas.findIndex(idea => idea.id === id);
    if (index !== -1) {
      mockIdeas.splice(index, 1);
      return true;
    }
    throw new Error('Idea not found');
  }
};