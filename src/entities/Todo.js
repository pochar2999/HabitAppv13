// Todo entity - now returns empty data since backend is removed
export const Todo = {
  list: async (userId, orderByField = 'createdAt', orderDirection = 'desc') => {
    return [];
  },

  filter: async (userId, filters = {}) => {
    return [];
  },

  create: async (userId, data) => {
    console.warn('Backend removed - Todo.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (userId, id, data) => {
    console.warn('Backend removed - Todo.update called but no data will be saved');
    return { id, ...data };
  },

  delete: async (userId, id) => {
    console.warn('Backend removed - Todo.delete called but no data will be saved');
    return true;
  }
};