import { generateId } from '../utils';

// Mock quote data
let mockQuotes = [];

export const Quote = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockQuotes];
    
    if (filters.user_id) {
      filtered = filtered.filter(quote => quote.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newQuote = {
      id: generateId(),
      category: 'Motivation',
      ...data
    };
    mockQuotes.push(newQuote);
    return newQuote;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockQuotes.findIndex(quote => quote.id === id);
    if (index !== -1) {
      mockQuotes[index] = { ...mockQuotes[index], ...data };
      return mockQuotes[index];
    }
    throw new Error('Quote not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockQuotes.findIndex(quote => quote.id === id);
    if (index !== -1) {
      mockQuotes.splice(index, 1);
      return true;
    }
    throw new Error('Quote not found');
  }
};