import { generateId } from '../utils';

// Mock financial tip data
const mockFinancialTips = [
  {
    id: 'tip_1',
    title: 'Start an Emergency Fund',
    category: 'Savings',
    content: 'Begin building an emergency fund with just $500. This small buffer can prevent you from going into debt for minor emergencies.',
    estimated_time: 3
  },
  {
    id: 'tip_2',
    title: 'Automate Your Savings',
    category: 'Automation',
    content: 'Set up automatic transfers to your savings account. Even $25 per week adds up to $1,300 per year.',
    estimated_time: 2
  }
];

export const FinancialTip = {
  list: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockFinancialTips];
  }
};