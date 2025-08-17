// SchoolAssignment entity - now returns empty data since backend is removed
export const SchoolAssignment = {
  list: async () => {
    return [];
  },

  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - SchoolAssignment.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (id, data) => {
    console.warn('Backend removed - SchoolAssignment.update called but no data will be saved');
    return { id, ...data };
  },

  delete: async (id) => {
    console.warn('Backend removed - SchoolAssignment.delete called but no data will be saved');
    return true;
  }
};