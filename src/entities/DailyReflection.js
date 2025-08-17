// DailyReflection entity - now returns empty data since backend is removed
export const DailyReflection = {
  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - DailyReflection.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (id, data) => {
    console.warn('Backend removed - DailyReflection.update called but no data will be saved');
    return { id, ...data };
  }
};