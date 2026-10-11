import { CategoryId, CategoryMeta } from '../types/finance';

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  food: {
    id: 'food',
    name: 'Food & Groceries',
    icon: 'Utensils',
    color: '#C7FF4A', // Electric Lime
    defaultAllocation: 3500,
  },
  transport: {
    id: 'transport',
    name: 'Transport',
    icon: 'Car',
    color: '#38BDF8', // Sky
    defaultAllocation: 1200,
  },
  bills: {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'Receipt',
    color: '#F472B6', // Pink
    defaultAllocation: 1800,
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#A78BFA', // Purple
    defaultAllocation: 1000,
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#FB923C', // Orange
    defaultAllocation: 800,
  },
  personal_care: {
    id: 'personal_care',
    name: 'Personal Care',
    icon: 'Sparkles',
    color: '#34D399', // Emerald
    defaultAllocation: 700,
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Reserve',
    icon: 'ShieldAlert',
    color: '#FBBF24', // Amber
    defaultAllocation: 600,
  },
  other: {
    id: 'other',
    name: 'Other',
    icon: 'MoreHorizontal',
    color: '#94A3B8', // Slate
    defaultAllocation: 400,
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
