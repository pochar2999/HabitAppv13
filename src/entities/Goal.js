import { firestoreService } from '../services/firestore';


export const Goal = {
  filter: async (userId, filters = {}) => {
    return await firestoreService.getAll(userId, 'goals', 'createdAt', 'desc');
  },

  create: async (userId, data) => {
    const newGoal = {
      progress: 0,
      status: 'active',
      milestones: [],
      ...data
    };
    
    return await firestoreService.create(userId, 'goals', newGoal);
  },

  update: async (userId, id, data) => {
    return await firestoreService.update(userId, 'goals', id, data);
  },

  delete: async (userId, id) => {
    return await firestoreService.delete(userId, 'goals', id);
  }
};