import { generateId } from '../utils';

// Mock user data
const mockUser = {
  id: 'user_1',
  email: 'demo@habitapp.com',
  full_name: 'Demo User',
  profile_picture: null,
  created_date: '2024-01-01T00:00:00Z',
  xp: 1250,
  level: 5,
  finance_onboarding_completed: false
};

export const User = {
  me: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockUser;
  },

  login: async () => {
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUser;
  },

  logout: async () => {
    // Simulate logout
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    Object.assign(mockUser, data);
    return mockUser;
  },

  updateMyUserData: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    Object.assign(mockUser, data);
    return mockUser;
  }
};