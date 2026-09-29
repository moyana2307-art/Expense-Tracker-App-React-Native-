import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { StatRow } from '../components/Screen';
import Card from '../components/Card';
import { DonutChart, TopExpenseChart } from '../components/SpendingChart';
import { getCategory } from '../constants/categories';
import { formatCurrency, monthLabel } from '../utils/format';
import { colors, spacing, typography, radius } from '../theme';

export default function FinancialSummaryScreen() {
  const { currency, summary, analytics } = useApp();
  const { income, expenses, balance, count } = summary;
  const { ranked, top, comparison } = analytics;

  const monthShared = useMemo(() => {
    const total = ranked.reduce((sum, c) => sum + c.amount, 0);
    return total > 0 ? total : null;
  }, [ranked]);

  const countStat = [
    { label: 'Transactions', value: String(count), icon: 'receipt-outline', color: colors.primary },
    { label: 'Income', value: formatCurrency(income, currency), icon: 'arrow-down-circle', color: colors.income },
    { label: 'Expenses', value: formatCurrency(expenses, currency), icon: 'arrow-up-circle', color: colors.expense },
    { label: 'Balance', value: formatCurrency(balance, currency), icon: 'wallet', color: balance >= 0 ? colors.primary : colors.expense },
  ];

  return (
    <View style={styles.screen}>
      <Header title="Financial summary" subtitle={monthLabel(analytics.month)} showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {countStat.map((s) => (
            <Card key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]} numberOfLines={1} adjustsFontSizeToFit>
                {s.value}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.blockCard}>
          <Text style={[typography.h3, { marginBottom: spacing.md }]}>Highest spending category</Text>
          {top ? (
            <View style={styles.topRow}>
              <CategoryBadge categoryKey={top.category} size={48} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={typography.h3}>{getCategory(top.category).label}</Text>
                <Text style={[typography.caption, { marginTop: 2 }]}>
                  {formatCurrency(top.amount, currency)} this month
                </Text>
              </View>
              {monthShared ? (
                <Text style={styles.shareText}>{Math.round((top.amount / monthShared) * 100)}%</Text>
              ) : null}
            </View>
          ) : (
            <Text style={[typography.body, { color: colors.textMuted }]}>
              No expenses this month yet.
            </Text>
          )}
        </Card>

        {ranked.length > 0 ? (
          <Card style={styles.blockCard}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>Where your money goes</Text>
            <TopExpenseChart ranked={ranked} currency={currency} limit={6} />
          </Card>
        ) : null}

        {ranked.length > 1 ? (
          <Card style={styles.blockCard}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>Category share</Text>
            <DonutChart ranked={ranked} currency={currency} />
          </Card>
        ) : null}

        <Card style={styles.blockCard}>
          <Text style={[typography.h3, { marginBottom: spacing.sm }]}>This month vs last month</Text>
          <StatRow label="Last month expenses" value={formatCurrency(comparison.previous, currency)} icon="time-outline" />
          <StatRow label="This month expenses" value={formatCurrency(comparison.current, currency)} icon="calendar-outline" />
          <StatRow
            label="Change"
            value={
              comparison.percentChange == null
                ? '—'
                : `${comparison.difference >= 0 ? '+' : ''}${formatCurrency(comparison.difference, currency)} (${Math.round(comparison.percentChange)}%)`
            }
            valueColor={comparison.difference > 0 ? colors.expense : colors.income}
            icon="trending-up"
          />

          {comparison.percentChange != null && comparison.percentChange > 0 ? (
            <View style={styles.tip}>
              <Ionicons name="information-circle" size={16} color={colors.warning} />
              <Text style={styles.tipText}>
                You spent {Math.round(comparison.percentChange)}% more than last month.
              </Text>
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </View>
  );
}

function CategoryBadge({ categoryKey, size = 48 }) {
  const category = getCategory(categoryKey);
  return (
    <View
      style={[
        styles.categoryBadge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: `${category.color}1F` },
      ]}
    >
      <Ionicons name={category.icon} size={size * 0.45} color={category.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    padding: spacing.md,
  },
  statValue: { ...typography.h3, marginTop: spacing.sm },
  statLabel: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  blockCard: { marginBottom: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  categoryBadge: { alignItems: 'center', justifyContent: 'center' },
  shareText: { ...typography.h3, color: colors.primary },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  tipText: { ...typography.small, color: '#92400E', marginLeft: spacing.sm, flex: 1 },
});