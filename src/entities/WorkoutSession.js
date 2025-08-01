import { generateId, getCurrentDate } from '../utils';

// Mock workout session data
let mockWorkoutSessions = [];

export const WorkoutSession = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockWorkoutSessions];
    
    if (filters.user_id) {
      filtered = filtered.filter(session => session.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newSession = {
      id: generateId(),
      date: getCurrentDate(),
      exercises: [],
      duration_minutes: 0,
      ...data
    };
    mockWorkoutSessions.push(newSession);
    return newSession;
  }
};