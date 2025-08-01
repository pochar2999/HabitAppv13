import { generateId } from '../utils';

// Mock habit data
const mockHabits = [
  {
    id: 'habit_1',
    title: 'Morning Meditation',
    description: 'Start your day with mindfulness and clarity through meditation',
    category: 'mindfulness',
    type: 'build',
    icon: '🧘',
    color: 'purple',
    techniques: [
      {
        name: 'Breath Awareness',
        description: 'Focus on your breathing to anchor your attention',
        scientific_backing: 'Studies show breath awareness reduces stress and improves focus'
      }
    ],
    benefits: [
      'Reduced stress and anxiety',
      'Improved focus and concentration',
      'Better emotional regulation'
    ],
    questions: [
      {
        question: 'How many minutes would you like to meditate?',
        type: 'number',
        required: true
      },
      {
        question: 'What time of day works best for you?',
        type: 'time',
        required: true
      }
    ]
  },
  {
    id: 'habit_2',
    title: 'Daily Exercise',
    description: 'Build physical strength and endurance through regular exercise',
    category: 'fitness',
    type: 'build',
    icon: '💪',
    color: 'red',
    techniques: [
      {
        name: 'Progressive Overload',
        description: 'Gradually increase intensity to build strength',
        scientific_backing: 'Research shows progressive overload is key to muscle development'
      }
    ],
    benefits: [
      'Improved cardiovascular health',
      'Increased strength and endurance',
      'Better mood and energy levels'
    ],
    questions: [
      {
        question: 'What type of exercise do you prefer?',
        type: 'select',
        options: ['Cardio', 'Strength Training', 'Yoga', 'Mixed'],
        required: true
      }
    ]
  },
  {
    id: 'habit_3',
    title: 'Read Daily',
    description: 'Expand your knowledge and vocabulary through daily reading',
    category: 'learning',
    type: 'build',
    icon: '📚',
    color: 'blue',
    techniques: [
      {
        name: 'Active Reading',
        description: 'Take notes and ask questions while reading',
        scientific_backing: 'Active reading improves comprehension and retention'
      }
    ],
    benefits: [
      'Expanded vocabulary',
      'Improved cognitive function',
      'Reduced stress'
    ],
    questions: [
      {
        question: 'How many pages would you like to read daily?',
        type: 'number',
        required: true
      }
    ]
  },
  {
    id: 'habit_4',
    title: 'Quit Social Media Scrolling',
    description: 'Break the habit of mindless social media consumption',
    category: 'breaking',
    type: 'break',
    icon: '📱',
    color: 'orange',
    techniques: [
      {
        name: 'App Blocking',
        description: 'Use apps to block social media during certain hours',
        scientific_backing: 'Digital detox studies show improved focus and well-being'
      }
    ],
    benefits: [
      'Improved focus and productivity',
      'Better sleep quality',
      'Reduced anxiety and comparison'
    ],
    questions: [
      {
        question: 'Which social media platforms do you want to limit?',
        type: 'text',
        required: true
      }
    ]
  }
];

export const Habit = {
  list: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockHabits];
  },

  get: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockHabits.find(h => h.id === id);
  },

  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockHabits];
    
    if (filters.type) {
      filtered = filtered.filter(h => h.type === filters.type);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newHabit = {
      id: generateId(),
      ...data
    };
    mockHabits.push(newHabit);
    return newHabit;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockHabits.findIndex(h => h.id === id);
    if (index !== -1) {
      mockHabits[index] = { ...mockHabits[index], ...data };
      return mockHabits[index];
    }
    throw new Error('Habit not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockHabits.findIndex(h => h.id === id);
    if (index !== -1) {
      mockHabits.splice(index, 1);
      return true;
    }
    throw new Error('Habit not found');
  }
};