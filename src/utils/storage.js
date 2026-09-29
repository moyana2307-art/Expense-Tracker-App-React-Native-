import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  TRANSACTIONS: '@smart_expense/transactions',
  BUDGET: '@smart_expense/budget',
  SETTINGS: '@smart_expense/settings',
  PROFILE: '@smart_expense/profile',
};

export async function readJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (error) {
    console.warn(`[storage] failed to read "${key}"`, error);
    return fallback;
  }
}

export async function writeJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] failed to write "${key}"`, error);
    return false;
  }
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storage] failed to remove "${key}"`, error);
    return false;
  }
}

export async function loadAll() {
  const [transactions, budget, settings, profile] = await Promise.all([
    readJSON(STORAGE_KEYS.TRANSACTIONS, []),
    readJSON(STORAGE_KEYS.BUDGET, { monthlyLimit: 0 }),
    readJSON(STORAGE_KEYS.SETTINGS, {}),
    readJSON(STORAGE_KEYS.PROFILE, null),
  ]);

  return {
    transactions: Array.isArray(transactions) ? transactions : [],
    budget: budget && typeof budget === 'object' ? budget : { monthlyLimit: 0 },
    settings: settings && typeof settings === 'object' ? settings : {},
    profile,
  };
}

export async function clearAll() {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.BUDGET,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.PROFILE,
    ]);
    return true;
  } catch (error) {
    console.warn('[storage] failed to clear data', error);
    return false;
  }
}
