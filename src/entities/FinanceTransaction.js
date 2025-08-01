import { generateId, getCurrentDate } from '../utils';

// Mock finance transaction data
let mockFinanceTransactions = [];

export const FinanceTransaction = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockFinanceTransactions];
    
    if (filters.user_id) {
      filtered = filtered.filter(transaction => transaction.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newTransaction = {
      id: generateId(),
      date: getCurrentDate(),
      ...data
    };
    mockFinanceTransactions.push(newTransaction);
    return newTransaction;
  }
};