// User entity - now returns basic user data since backend is removed
export const User = {
  me: async (currentUser) => {
    if (!currentUser) return null;
    
    // Return basic user data without backend calls
    return {
      id: currentUser.uid,
      email: currentUser.email,
      full_name: currentUser.displayName || '',
      profile_picture: currentUser.photoURL || null,
      emailVerified: true,
      xp: 0,
      level: 1,
      finance_onboarding_completed: false,
      created_date: new Date().toISOString(),
      offline: false
    };
  },

  update: async (userId, data) => {
    console.warn('Backend removed - User.update called but no data will be saved');
    return data;
  },

  updateMyUserData: async (userId, data) => {
    console.warn('Backend removed - User.updateMyUserData called but no data will be saved');
    return data;
  }
};