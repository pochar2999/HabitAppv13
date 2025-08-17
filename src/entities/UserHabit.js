// UserHabit entity - now returns empty data since backend is removed
export const UserHabit = {
  list: async (userId, orderByField = 'createdAt', orderDirection = 'desc') => {
    return [];
  },

  filter: async (userId, filters = {}) => {
    return [];
  },

  create: async (userId, data) => {
    console.warn('Backend removed - UserHabit.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (userId, id, data) => {
    console.warn('Backend removed - UserHabit.update called but no data will be saved');
    return { id, ...data };
  },

  delete: async (userId, id) => {
    console.warn('Backend removed - UserHabit.delete called but no data will be saved');
    return true;
  },

  bulkCreate: async (userId, dataArray) => {
    console.warn('Backend removed - UserHabit.bulkCreate called but no data will be saved');
    return dataArray.map(data => ({ id: 'mock_id', ...data }));
  }
};