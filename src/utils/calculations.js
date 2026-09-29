import { currentMonthKey, monthKey } from './format';

export function totalIncome(transactions) {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
}

export function totalExpenses(transactions) {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
}

export function totalBalance(transactions) {
  return totalIncome(transactions) - totalExpenses(transactions);
}

export function toNumber(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function spentByCategory(transactions, key = currentMonthKey()) {
  return transactions
    .filter((t) => t.type === 'expense' && monthKey(t.date) === key)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + toNumber(t.amount);
      return acc;
    }, {});
}

export function rankedCategories(transactions, key = currentMonthKey()) {
  const totals = spentByCategory(transactions, key);
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function highestSpendingCategory(transactions, key = currentMonthKey()) {
  return rankedCategories(transactions, key)[0] || null;
}

export function budgetStatus(transactions, limit, key = currentMonthKey()) {
  const spent = spentByCategory(transactions, key);
  const amountSpent = Object.values(spent).reduce((sum, v) => sum + v, 0);
  const safeLimit = toNumber(limit);
  const remaining = safeLimit - amountSpent;
  const percentUsed = safeLimit > 0 ? (amountSpent / safeLimit) * 100 : 0;

  let status = 'safe';
  if (safeLimit > 0) {
    if (amountSpent > safeLimit) status = 'exceeded';
    else if (percentUsed >= 85) status = 'warning';
  }

  return { amountSpent, remaining, percentUsed, status, limit: safeLimit, hasBudget: safeLimit > 0 };
}

export function topCategoryShare(transactions, key = currentMonthKey()) {
  const ranked = rankedCategories(transactions, key);
  const total = ranked.reduce((sum, c) => sum + c.amount, 0);
  if (!total || !ranked.length) return null;
  return { ...ranked[0], share: (ranked[0].amount / total) * 100, total };
}

export function previousMonthKey(key = currentMonthKey()) {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  return monthKey(`${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-01`);
}

export function compareMonths(transactions, key = currentMonthKey()) {
  const prev = previousMonthKey(key);
  const current = totalExpenses(transactions.filter((t) => monthKey(t.date) === key));
  const previous = totalExpenses(transactions.filter((t) => monthKey(t.date) === prev));
  const difference = current - previous;
  const percentChange = previous > 0 ? (difference / previous) * 100 : null;
  return { current, previous, difference, percentChange, previousKey: prev };
}

export function averageDailySpend(transactions, key = currentMonthKey()) {
  const now = new Date();
  const [year, month] = key.split('-').map(Number);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const days = isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate();
  const spent = spentByCategory(transactions, key);
  const total = Object.values(spent).reduce((sum, v) => sum + v, 0);
  return days > 0 ? total / days : 0;
}

export function dailyAverageForCategory(transactions, category, key = currentMonthKey()) {
  const now = new Date();
  const [year, month] = key.split('-').map(Number);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const days = isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate();
  const total = transactions
    .filter((t) => t.type === 'expense' && t.category === category && monthKey(t.date) === key)
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
  return days > 0 ? total / days : 0;
}

export function sortByDateDesc(transactions) {
  return [...transactions].sort((a, b) => {
    if (a.date === b.date) return (b.createdAt || 0) - (a.createdAt || 0);
    return a.date < b.date ? 1 : -1;
  });
}

export function searchTransactions(transactions, query) {
  const q = query.trim().toLowerCase();
  if (!q) return transactions;
  return transactions.filter((t) =>
    [t.title, t.note, t.category, t.amount, t.type].some(
      (field) => field && String(field).toLowerCase().includes(q)
    )
  );
}

export function filterTransactions(transactions, { category = 'All', type = 'All' } = {}) {
  return transactions.filter((t) => {
    const matchesCategory = category === 'All' || t.category === category;
    const matchesType = type === 'All' || t.type === type;
    return matchesCategory && matchesType;
  });
}
