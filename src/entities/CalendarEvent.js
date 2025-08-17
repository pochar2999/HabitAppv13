// CalendarEvent entity - now returns empty data since backend is removed
export const CalendarEvent = {
  filter: async (filters) => {
    return [];
  },

  create: async (data) => {
    console.warn('Backend removed - CalendarEvent.create called but no data will be saved');
    return { id: 'mock_id', ...data };
  },

  update: async (id, data) => {
    console.warn('Backend removed - CalendarEvent.update called but no data will be saved');
    return { id, ...data };
  },

  delete: async (id) => {
    console.warn('Backend removed - CalendarEvent.delete called but no data will be saved');
    return true;
  }
};