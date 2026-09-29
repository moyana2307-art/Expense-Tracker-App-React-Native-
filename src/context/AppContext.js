import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { STORAGE_KEYS, clearAll, loadAll, writeJSON } from '../utils/storage';
import { createSampleTransactions } from '../utils/sampleData';
import { currentMonthKey, toISODate } from '../utils/format';

import {
  averageDailySpend,
  budgetStatus,
  compareMonths,
  highestSpendingCategory,
  rankedCategories,
  totalBalance,
  totalExpenses,
  totalIncome,
} from '../utils/calculations';
const AppContext = createContext(null);

const DEFAULT_SETTINGS = {
  currency: 'USD',
  greetingName: '',
  hasOnboarded: false,
  hideAmounts: false,
};

function makeId() {
  return `txn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState({ monthlyLimit: 0 });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadAll();
      if (cancelled) return;
      setTransactions(data.transactions);
      setBudget(data.budget);
      setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      setProfile(data.profile);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    writeJSON(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    writeJSON(STORAGE_KEYS.BUDGET, budget);
  }, [budget, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    writeJSON(STORAGE_KEYS.SETTINGS, settings);
  }, [settings, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (profile) writeJSON(STORAGE_KEYS.PROFILE, profile);
  }, [profile, isLoading]);

  const addTransaction = useCallback((data) => {
    const record = {
      id: makeId(),
      title: String(data.title || '').trim(),
      amount: Math.abs(Number(data.amount) || 0),
      type: data.type === 'income' ? 'income' : 'expense',
      category: data.category || 'Other',
      date: data.date || toISODate(new Date()),
      note: String(data.note || '').trim(),
      createdAt: Date.now(),
    };
    setTransactions((prev) => [record, ...prev]);
    return record;
  }, []);

  const updateTransaction = useCallback((id, data) => {
    let updated = null;
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        updated = {
          ...t,
          title: String(data.title ?? t.title).trim(),
          amount: Math.abs(Number(data.amount ?? t.amount) || 0),
          type: data.type === 'income' || data.type === 'expense' ? data.type : t.type,
          category: data.category ?? t.category,
          date: data.date ?? t.date,
          note: String(data.note ?? t.note).trim(),
        };
        return updated;
      })
    );
    return updated;
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const deleteAllTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  const loadSampleData = useCallback(() => {
    setTransactions(createSampleTransactions());
  }, []);

  const setMonthlyBudget = useCallback((limit) => {
    const value = Math.max(0, Number(limit) || 0);
    setBudget({ monthlyLimit: value, updatedAt: Date.now() });
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const completeOnboarding = useCallback((profileData) => {
    setProfile(profileData);
    setSettings((prev) => ({ ...prev, hasOnboarded: true }));
  }, []);

  const updateProfile = useCallback((patch) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : { ...patch, joinedAt: Date.now() }));
  }, []);

  const signOut = useCallback(() => {
    setProfile(null);
    setSettings((prev) => ({ ...prev, hasOnboarded: false }));
  }, []);

  const resetEverything = useCallback(async () => {
    await clearAll();
    setTransactions([]);
    setBudget({ monthlyLimit: 0 });
    setSettings(DEFAULT_SETTINGS);
    setProfile(null);
  }, []);

  const currency = settings.currency || 'USD';
  const month = currentMonthKey();

  const summary = useMemo(() => {
    const income = totalIncome(transactions);
    const expenses = totalExpenses(transactions);
    return {
      income,
      expenses,
      balance: totalBalance(transactions),
      count: transactions.length,
      monthIncome: totalIncome(transactions.filter((t) => t.date?.startsWith(month))),
      monthExpenses: totalExpenses(transactions.filter((t) => t.date?.startsWith(month))),
    };
  }, [transactions, month]);

  const analytics = useMemo(
    () => ({
      month,
      ranked: rankedCategories(transactions, month),
      top: highestSpendingCategory(transactions, month),
      budget: budgetStatus(transactions, budget.monthlyLimit, month),
      comparison: compareMonths(transactions, month),
      dailyAverage: averageDailySpend(transactions, month),
    }),
    [transactions, budget.monthlyLimit, month]
  );

  const value = useMemo(
    () => ({
      transactions,
      budget,
      settings,
      profile,
      currency,
      isLoading,
      summary,
      analytics,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      deleteAllTransactions,
      loadSampleData,
      setMonthlyBudget,
      updateSettings,
      completeOnboarding,
      updateProfile,
      signOut,
      resetEverything,
    }),
    [
      transactions,
      budget,
      settings,
      profile,
      currency,
      isLoading,
      summary,
      analytics,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      deleteAllTransactions,
      loadSampleData,
      setMonthlyBudget,
      updateSettings,
      completeOnboarding,
      updateProfile,
      signOut,
      resetEverything,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an <AppProvider>');
  }
  return context;
}

export default AppContext;
