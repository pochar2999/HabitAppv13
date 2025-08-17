// WaterEntry entity - now returns empty data since backend is removed
export const WaterEntry = {
  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - WaterEntry.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  delete: async (id) => {
    console.warn('Backend removed - WaterEntry.delete called but no data will be saved');
    return true;
  }
};