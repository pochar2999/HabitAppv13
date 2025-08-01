import { generateId } from '../utils';

// Mock vault entry data
let mockVaultEntries = [];

export const VaultEntry = {
  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockVaultEntries];
    
    if (filters.user_id) {
      filtered = filtered.filter(entry => entry.user_id === filters.user_id);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newEntry = {
      id: generateId(),
      ...data
    };
    mockVaultEntries.push(newEntry);
    return newEntry;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockVaultEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      mockVaultEntries[index] = { ...mockVaultEntries[index], ...data };
      return mockVaultEntries[index];
    }
    throw new Error('VaultEntry not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockVaultEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      mockVaultEntries.splice(index, 1);
      return true;
    }
    throw new Error('VaultEntry not found');
  }
};