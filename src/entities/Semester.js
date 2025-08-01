import { generateId, getCurrentDate } from '../utils';

// Mock semester data
let mockSemesters = [];

export const Semester = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockSemesters];
    
    if (filters.user_id) {
      filtered = filtered.filter(semester => semester.user_id === filters.user_id);
    }
    
    return filtered;
  },

  get: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockSemesters.find(s => s.id === id);
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newSemester = {
      id: generateId(),
      is_active: false,
      ...data
    };
    mockSemesters.push(newSemester);
    return newSemester;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockSemesters.findIndex(semester => semester.id === id);
    if (index !== -1) {
      mockSemesters[index] = { ...mockSemesters[index], ...data };
      return mockSemesters[index];
    }
    throw new Error('Semester not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockSemesters.findIndex(semester => semester.id === id);
    if (index !== -1) {
      mockSemesters.splice(index, 1);
      return true;
    }
    throw new Error('Semester not found');
  }
};