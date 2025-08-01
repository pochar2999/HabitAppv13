import { generateId, getCurrentDate } from '../utils';

// Mock todos data
let mockTodos = [];

export const Todo = {
  list: async (orderBy = '') => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let sorted = [...mockTodos];
    
    if (orderBy === '-created_date') {
      sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    
    return sorted;
  },

  filter: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filtered = [...mockTodos];
    
    if (filters.created_by) {
      filtered = filtered.filter(todo => todo.created_by === filters.created_by);
    }
    
    return filtered;
  },

  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newTodo = {
      id: generateId(),
      created_date: new Date().toISOString(),
      created_by: 'demo@habitapp.com',
      updated_date: new Date().toISOString(),
      completed: false,
      priority: 'medium',
      ...data
    };
    mockTodos.push(newTodo);
    return newTodo;
  },

  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockTodos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      mockTodos[index] = { 
        ...mockTodos[index], 
        ...data,
        updated_date: new Date().toISOString()
      };
      return mockTodos[index];
    }
    throw new Error('Todo not found');
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockTodos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      mockTodos.splice(index, 1);
      return true;
    }
    throw new Error('Todo not found');
  }
};