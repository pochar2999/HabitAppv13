import { generateId, getCurrentDate } from '../utils';

// Mock journal entries data
let mockJournalEntries = [];

export const JournalEntry = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockJournalEntries];
    
    if (filters.created_by) {
      filtered = filtered.filter(entry => entry.created_by === filters.created_by);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newEntry = {
      id: generateId(),
      created_by: 'demo@habitapp.com',
      date: getCurrentDate(),
      mood: 'neutral',
      tags: [],
      ...data
    };
    mockJournalEntries.push(newEntry);
    return newEntry;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockJournalEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      mockJournalEntries[index] = { ...mockJournalEntries[index], ...data };
      return mockJournalEntries[index];
    }
    throw new Error('JournalEntry not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockJournalEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      mockJournalEntries.splice(index, 1);
      return true;
    }
    throw new Error('JournalEntry not found');
  }
};