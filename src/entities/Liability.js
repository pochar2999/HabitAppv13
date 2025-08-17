// Liability entity - now returns empty data since backend is removed
export const Liability = {
  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - Liability.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (id, data) => {
    console.warn('Backend removed - Liability.update called but no data will be saved');
    return { id, ...data };
  },

  bulkCreate: async (dataArray) => {
    console.warn('Backend removed - Liability.bulkCreate called but no data will be saved');
    return dataArray.map(data => ({ id: 'mock_id', ...data }));
  }
};