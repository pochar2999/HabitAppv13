// Utility function to create page URLs
export const createPageUrl = (pageName) => {
  const pageMap = {
    'Home': '/',
    'Habits': '/habits',
    'HabitSelect': '/habit-select',
    'HabitDetail': '/habit-detail',
    'HabitForm': '/habit-form',
    'Progress': '/progress',
    'Features': '/features',
    'TodoList': '/todo-list',
    'Calendar': '/calendar',
    'Journal': '/journal',
    'FoodTracker': '/food-tracker',
    'Finance': '/finance',
    'School': '/school',
    'LifeStats': '/life-stats',
    'Goals': '/goals',
    'FutureSelf': '/future-self',
    'UnpackDay': '/unpack-day',
    'BucketList': '/bucket-list',
    'PasswordVault': '/password-vault',
    'WorkoutTracker': '/workout-tracker',
    'GratitudeWall': '/gratitude-wall',
    'QuoteVault': '/quote-vault',
    'IdeaVault': '/idea-vault',
    'ResetHabits': '/reset-habits'
  };
  
  // Handle query parameters
  if (pageName.includes('?')) {
    const [page, query] = pageName.split('?');
    return `${pageMap[page] || '/'}?${query}`;
  }
  
  return pageMap[pageName] || '/';
};

// Generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

// Get current date in YYYY-MM-DD format
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Get current time in HH:MM format
export const getCurrentTime = () => {
  return new Date().toTimeString().slice(0, 5);
};