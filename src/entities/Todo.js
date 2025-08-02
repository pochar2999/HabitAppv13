import { firestoreService } from '../services/firestore';


export const Todo = {
  list: async (userId, orderByField = 'createdAt', orderDirection = 'desc') => {
    return await firestoreService.getAll(userId, 'todos', orderByField, orderDirection);
  },

  filter: async (userId, filters = {}) => {
    return await firestoreService.getAll(userId, 'todos', 'createdAt', 'desc');
  },

  create: async (userId, data) => {
    const newTodo = {
      completed: false,
      priority: 'medium',
      ...data
    };
    
    return await firestoreService.create(userId, 'todos', newTodo);
  },

  update: async (userId, id, data) => {
    return await firestoreService.update(userId, 'todos', id, data);
  },

  delete: async (userId, id) => {
    return await firestoreService.delete(userId, 'todos', id);
  }
};