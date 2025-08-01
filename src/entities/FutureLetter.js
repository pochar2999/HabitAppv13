import { generateId, getCurrentDate } from '../utils';

// Mock future letter data
let mockFutureLetters = [];

export const FutureLetter = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockFutureLetters];
    
    if (filters.user_id) {
      filtered = filtered.filter(letter => letter.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newLetter = {
      id: generateId(),
      is_unlocked: false,
      ...data
    };
    mockFutureLetters.push(newLetter);
    return newLetter;
  }
};