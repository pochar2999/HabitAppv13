// UserFinancialTipProgress entity - now returns empty data since backend is removed
export const UserFinancialTipProgress = {
  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - UserFinancialTipProgress.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  }
};