// FinancialGoal entity - now returns empty data since backend is removed
export const FinancialGoal = {
  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - FinancialGoal.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  }
};