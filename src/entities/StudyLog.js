import { generateId } from '../utils';

// Mock study log data
let mockStudyLogs = [];

export const StudyLog = {
  list: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockStudyLogs];
  },

  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockStudyLogs];
    
    if (filters.course_id) {
      filtered = filtered.filter(log => log.course_id === filters.course_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newLog = {
      id: generateId(),
      ...data
    };
    mockStudyLogs.push(newLog);
    return newLog;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockStudyLogs.findIndex(log => log.id === id);
    if (index !== -1) {
      mockStudyLogs[index] = { ...mockStudyLogs[index], ...data };
      return mockStudyLogs[index];
    }
    throw new Error('StudyLog not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockStudyLogs.findIndex(log => log.id === id);
    if (index !== -1) {
      mockStudyLogs.splice(index, 1);
      return true;
    }
    throw new Error('StudyLog not found');
  }
};