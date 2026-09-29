import { colors } from '../theme';

export const INCOME = 'income';
export const EXPENSE = 'expense';

export const CATEGORIES = [
  { key: 'Food', label: 'Food', icon: 'fast-food', color: '#F97316' },
  { key: 'Transport', label: 'Transport', icon: 'car', color: '#0EA5E9' },
  { key: 'Shopping', label: 'Shopping', icon: 'bag-handle', color: '#EC4899' },
  { key: 'Rent', label: 'Rent', icon: 'home', color: '#8B5CF6' },
  { key: 'Entertainment', label: 'Entertainment', icon: 'game-controller', color: '#14B8A6' },
  { key: 'Education', label: 'Education', icon: 'school', color: '#6366F1' },
  { key: 'Bills', label: 'Bills', icon: 'receipt', color: '#64748B' },
  { key: 'Health', label: 'Health', icon: 'medkit', color: '#EF4444' },
  { key: 'Salary', label: 'Salary', icon: 'wallet', color: '#10B981' },
  { key: 'Other', label: 'Other', icon: 'ellipsis-horizontal', color: '#94A3B8' },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== 'Salary');
export const INCOME_CATEGORIES = CATEGORIES.filter(
  (c) => c.key === 'Salary' || c.key === 'Other'
);

const FALLBACK = { key: 'Other', label: 'Other', icon: 'ellipsis-horizontal', color: '#94A3B8' };

export function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key) || FALLBACK;
}

export function categoriesForType(type) {
  return type === INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export const CATEGORY_COLORS = CATEGORIES.reduce((acc, c) => {
  acc[c.key] = c.color;
  return acc;
}, {});

export const TYPE_COLORS = {
  [INCOME]: colors.income,
  [EXPENSE]: colors.expense,
};
