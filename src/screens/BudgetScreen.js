import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import { BudgetProgress } from '../components/ProgressBar';
import CategoryCard from '../components/CategoryCard';
import { formatCurrency, monthLabel } from '../utils/format';
import { rankedCategories } from '../utils/calculations';
import { colors, spacing, typography, radius, shadow } from '../theme';

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const { budget, setMonthlyBudget, transactions, currency, analytics } = useApp();

  const [draft, setDraft] = useState(budget?.monthlyLimit ? String(budget.monthlyLimit) : '');
  const [error, setError] = useState('');

  const hasBudget = budget?.monthlyLimit > 0;
  const status = analytics?.budget;
  const categories = rankedCategories(transactions);

  const saveBudget = () => {
    const value = parseFloat(draft);
    if (!draft.trim() || isNaN(value) || value <= 0) {
      setError('Enter a budget amount greater than zero.');
      return;
    }
    setMonthlyBudget(value);
    setError('');
  };

  const clearBudget = () => {
    setMonthlyBudget(0);
    setDraft('');
  };

  const statusColor =
    status?.status === 'exceeded' ? colors.expense : status?.status === 'warning' ? colors.warning : colors.income;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[typography.h1, { fontSize: 26 }]}>Budget</Text>
      <Text style={[typography.small, { color: colors.textMuted, marginTop: 2, marginBottom: spacing.lg }]}>
        {monthLabel(analytics.month)}
      </Text>

      <View style={[styles.setCard, shadow.card]}>
        <View style={styles.setHeader}>
          <View style={styles.setIcon}>
            <Ionicons name="flag" size={20} color={hasBudget ? colors.primary : colors.textMuted} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={typography.h3}>{hasBudget ? 'Monthly spending limit' : 'Set a monthly budget'}</Text>
            <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>
              {hasBudget
                ? `Current limit: ${formatCurrency(budget.monthlyLimit, currency)}`
                : 'You have not set a budget yet.'}
            </Text>
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputPrefix}>{currencySymbol(currency)}</Text>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={(v) => {
              setDraft(v);
              if (error) setError('');
            }}
            keyboardType="decimal-pad"
            placeholder={hasBudget ? String(budget.monthlyLimit) : 'e.g. 500'}
            placeholderTextColor={colors.textMuted}
          />
          <Button title={hasBudget ? 'Update' : 'Set'} onPress={saveBudget} style={{ alignSelf: 'center' }} disabled={!draft.trim()} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {hasBudget ? (
          <Pressable onPress={clearBudget} style={styles.clearLink}>
            <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
            <Text style={styles.clearText}>Remove budget</Text>
          </Pressable>
        ) : null}
      </View>

      {hasBudget && status ? (
        <View style={[styles.statusCard, { borderColor: statusColor }]}>
          <View style={styles.statusTop}>
            <Ionicons
              name={status.status === 'exceeded' ? 'alert-circle' : status.status === 'warning' ? 'warning' : 'checkmark-circle'}
              size={22}
              color={statusColor}
            />
            <Text style={[styles.statusTitle, { color: statusColor }]}>
              {status.status === 'exceeded'
                ? 'Budget exceeded'
                : status.status === 'warning'
                ? 'Approaching your limit'
                : 'On track'}
            </Text>
          </View>

          <BudgetProgress spent={status.amountSpent} limit={status.limit} currency={formatCurrency(1, currency)} style={{ marginTop: spacing.md }} />

          <View style={styles.statsRow}>
            <Stat label="Budget" value={formatCurrency(status.limit, currency)} />
            <Stat label="Spent" value={formatCurrency(status.amountSpent, currency)} />
            <Stat
              label="Remaining"
              value={
                status.remaining < 0
                  ? `-${formatCurrency(Math.abs(status.remaining), currency)}`
                  : formatCurrency(status.remaining, currency)
              }
              valueColor={status.remaining < 0 ? colors.expense : colors.income}
            />
          </View>
        </View>
      ) : null}

      {hasBudget && categories.length > 0 ? (
        <View style={styles.categoriesBlock}>
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>Spending vs budget</Text>
          {categories.map((c) => (
            <CategoryCard
              key={c.category}
              categoryKey={c.category}
              amount={c.amount}
              percent={status?.limit ? (c.amount / status.limit) * 100 : 0}
              currency={currency}
            />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function Stat({ label, value, valueColor }) {
  return (
    <View style={styles.stat}>
      <Text style={[typography.small, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[typography.h3, { marginTop: 3, color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function currencySymbol(currency) {
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
  return symbols[currency] || '$';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 130 },
  setCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  setHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  setIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputPrefix: { fontSize: 18, fontWeight: '700', color: colors.textSecondary },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 12,
  },
  error: { ...typography.small, color: colors.expense, fontWeight: '600', marginTop: spacing.sm },
  clearLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  clearText: { ...typography.small, color: colors.textMuted },
  statusCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusTitle: { ...typography.h3 },
  statsRow: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.sm },
  stat: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md },
  categoriesBlock: { marginTop: spacing.xl },
});