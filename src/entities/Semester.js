// Semester entity - now returns empty data since backend is removed
export const Semester = {
  filter: async (filters) => {
    return [];
  },

  get: async (id) => {
    return null;
  },

  create: async (data) => {
    console.warn('Backend removed - Semester.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (id, data) => {
    console.warn('Backend removed - Semester.update called but no data will be saved');
    return { id, ...data };
  },

  delete: async (id) => {
    console.warn('Backend removed - Semester.delete called but no data will be saved');
    return true;
  }
};