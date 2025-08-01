import { generateId } from '../utils';

// Mock course data
let mockCourses = [];

export const Course = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockCourses];
    
    if (filters.semester_id) {
      filtered = filtered.filter(course => course.semester_id === filters.semester_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newCourse = {
      id: generateId(),
      ...data
    };
    mockCourses.push(newCourse);
    return newCourse;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockCourses.findIndex(course => course.id === id);
    if (index !== -1) {
      mockCourses[index] = { ...mockCourses[index], ...data };
      return mockCourses[index];
    }
    throw new Error('Course not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockCourses.findIndex(course => course.id === id);
    if (index !== -1) {
      mockCourses.splice(index, 1);
      return true;
    }
    throw new Error('Course not found');
  }
};