// HabitLog entity - now returns empty data since backend is removed
export const HabitLog = {
  list: async (userId, orderByField = 'date', orderDirection = 'desc') => {
    return [];
  },

  filter: async (userId, filters = {}) => {
    return [];
  },

  create: async (userId, data) => {
    console.warn('Backend removed - HabitLog.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (userId, id, data) => {
    console.warn('Backend removed - HabitLog.update called but no data will be saved');
    return { id, ...data };
  },

  delete: async (userId, id) => {
    console.warn('Backend removed - HabitLog.delete called but no data will be saved');
    return true;
  }
};