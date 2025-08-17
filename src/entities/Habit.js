// Habit entity - now returns empty data since backend is removed
export const Habit = {
  list: async () => {
    return [];
  },

  get: async (id) => {
    return null;
  },

  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - Habit.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (id, data) => {
    console.warn('Backend removed - Habit.update called but no data will be saved');
    return { id, ...data };
  },

  delete: async (id) => {
    console.warn('Backend removed - Habit.delete called but no data will be saved');
    return true;
  }
};