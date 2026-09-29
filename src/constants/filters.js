import { CATEGORIES } from './categories';

export const CATEGORY_FILTERS = [
  { key: 'All', label: 'All', icon: 'apps', color: '#475569' },
  ...CATEGORIES.map((c) => ({ key: c.key, label: c.label, icon: c.icon, color: c.color })),
];

export default CATEGORY_FILTERS;