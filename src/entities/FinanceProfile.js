// FinanceProfile entity - now returns empty data since backend is removed
export const FinanceProfile = {
  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - FinanceProfile.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (id, data) => {
    console.warn('Backend removed - FinanceProfile.update called but no data will be saved');
    return { id, ...data };
  }
};