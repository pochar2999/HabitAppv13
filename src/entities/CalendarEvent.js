import { generateId, getCurrentDate } from '../utils';

// Mock calendar event data
let mockCalendarEvents = [];

export const CalendarEvent = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockCalendarEvents];
    
    if (filters.user_id) {
      filtered = filtered.filter(event => event.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newEvent = {
      id: generateId(),
      color: 'blue',
      category: 'To-do',
      is_recurring: false,
      reminder_enabled: false,
      reminder_time: 15,
      ...data
    };
    mockCalendarEvents.push(newEvent);
    return newEvent;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockCalendarEvents.findIndex(event => event.id === id);
    if (index !== -1) {
      mockCalendarEvents[index] = { ...mockCalendarEvents[index], ...data };
      return mockCalendarEvents[index];
    }
    throw new Error('CalendarEvent not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockCalendarEvents.findIndex(event => event.id === id);
    if (index !== -1) {
      mockCalendarEvents.splice(index, 1);
      return true;
    }
    throw new Error('CalendarEvent not found');
  }
};