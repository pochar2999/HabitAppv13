// JournalEntry entity - now returns empty data since backend is removed
export const JournalEntry = {
  filter: async (userId, filters = {}) => {
    return [];
  },

  create: async (userId, data) => {
    console.warn('Backend removed - JournalEntry.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (userId, id, data) => {
    console.warn('Backend removed - JournalEntry.update called but no data will be saved');
    return { id, ...data };
  },

  delete: async (userId, id) => {
    console.warn('Backend removed - JournalEntry.delete called but no data will be saved');
    return true;
  }
};