// Badge entity - now returns empty data since backend is removed
export const Badge = {
  list: async () => {
    return [];
  },

  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - Badge.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  }
};