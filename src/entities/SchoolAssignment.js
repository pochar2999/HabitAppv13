import { generateId } from '../utils';

// Mock school assignment data
let mockAssignments = [];

export const SchoolAssignment = {
  list: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockAssignments];
  },

  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockAssignments];
    
    if (filters.user_id) {
      filtered = filtered.filter(assignment => assignment.user_id === filters.user_id);
    }
    
    if (filters.course_id) {
      filtered = filtered.filter(assignment => assignment.course_id === filters.course_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newAssignment = {
      id: generateId(),
      completed: false,
      ...data
    };
    mockAssignments.push(newAssignment);
    return newAssignment;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockAssignments.findIndex(assignment => assignment.id === id);
    if (index !== -1) {
      mockAssignments[index] = { ...mockAssignments[index], ...data };
      return mockAssignments[index];
    }
    throw new Error('Assignment not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockAssignments.findIndex(assignment => assignment.id === id);
    if (index !== -1) {
      mockAssignments.splice(index, 1);
      return true;
    }
    throw new Error('Assignment not found');
  }
};