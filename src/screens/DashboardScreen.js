import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import SummaryCard from '../components/SummaryCard';
import TransactionCard from '../components/TransactionCard';
import { TopExpenseChart } from '../components/SpendingChart';
import { SectionTitle } from '../components/Card';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDayHeading, currencySymbol } from '../utils/format';
import { rankedCategories, sortByDateDesc } from '../utils/calculations';
import { colors, spacing, typography, shadow } from '../theme';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const rootNavigation = useMemo(() => navigation?.getParent(), [navigation]);
  const insets = useSafeAreaInsets();
  const { transactions, currency, profile, summary, analytics, budget, settings } = useApp();

  const recent = useMemo(() => sortByDateDesc(transactions).slice(0, 5), [transactions]);

  const masked = settings?.hideAmounts ? `••••${currencySymbol(currency)}` : null;
  const money = (value, getter = (v) => formatCurrency(v, currency)) => (masked ? masked : getter(value));

  const { balance, income, expenses } = summary;
  const heroLabel = balance >= 0 ? 'Current balance' : 'Overdrawn by';
  const heroColor = balance >= 0 ? '#FFFFFF' : '#FECACA';

  const categories = rankedCategories(transactions);

  const goToAdd = () => rootNavigation?.navigate('AddTransaction');
  const goToAll = () => navigation?.navigate('Activity');
  const goToSummary = () => rootNavigation?.navigate('FinancialSummary');
  const goToSettings = () => rootNavigation?.navigate('Settings');
  const goToDetails = (id) => rootNavigation?.navigate('TransactionDetails', { id });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: 130 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.greetingRow, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.greeting}>
            {profile?.name ? `Hi, ${profile.name.split(' ')[0]}` : 'Welcome back'}
          </Text>
          <Text style={styles.dateLine}>
            {formatDayHeading(new Date().toISOString().slice(0, 10))}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <View onTouchEnd={goToSummary} style={styles.iconButton}>
            <Ionicons name="bar-chart-outline" size={20} color={colors.text} />
          </View>
          <View onTouchEnd={goToSettings} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </View>
        </View>
      </View>

      <View style={[styles.balanceCard, shadow.raised]}>
        <View style={styles.balanceTop}>
          <Text style={styles.balanceLabel}>{heroLabel}</Text>
          <View style={styles.dot} />
        </View>
        <Text style={[styles.balanceValue, { color: heroColor }]} numberOfLines={1} adjustsFontSizeToFit>
          {money(balance, (v) =>
            v < 0 ? `-${formatCurrency(Math.abs(v), currency)}` : formatCurrency(v, currency)
          )}
        </Text>

        <View style={styles.balanceRow}>
          <View style={styles.balanceStat}>
            <Ionicons name="arrow-down" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.balanceStatLabel}>In this month</Text>
            <Text style={styles.balanceStatValue}>{money(summary.monthIncome)}</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceStat}>
            <Ionicons name="arrow-up" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.balanceStatLabel}>Spent this month</Text>
            <Text style={styles.balanceStatValue}>{money(summary.monthExpenses)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label="Total income" value={money(income)} icon="trending-up" color={colors.income} />
        <View style={{ width: spacing.md }} />
        <SummaryCard label="Total expenses" value={money(expenses)} icon="trending-down" color={colors.expense} />
      </View>

      <View style={styles.block}>
        <SectionTitle title="Recent transactions" action="See all" onActionPress={goToAll} />
        {recent.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No transactions yet"
            message="Add your first income or expense to start tracking."
            actionTitle="Add a transaction"
            onAction={goToAdd}
          />
        ) : (
          recent.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={t}
              currency={currency}
              hideAmount={!!masked}
              onPress={() => goToDetails(t.id)}
            />
          ))
        )}
      </View>

      {categories.length > 0 ? (
        <View style={styles.block}>
          <SectionTitle
            title="Spending by category"
            action="Detail"
            onActionPress={goToSummary}
          />
          <View style={styles.chartCard}>
            <TopExpenseChart ranked={categories} currency={currency} limit={4} />
          </View>

          {analytics.top ? (
            <View style={styles.insightRow}>
              <Ionicons name="bulb-outline" size={16} color={colors.warning} />
              <Text style={styles.insightText}>
                {analytics.top.category} is your biggest expense this month.
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {budget?.monthlyLimit > 0 ? (
        <BudgetBanner />
      ) : null}

      <QuickActionBar onAdd={goToAdd} onAssistant={() => navigation?.navigate('Assistant')} />
    </ScrollView>
  );
}

function BudgetBanner() {
  const { analytics, currency } = useApp();
  const navigation = useNavigation();
  const { amountSpent, percentUsed, status, limit } = analytics.budget;
  if (status === 'safe') return null;

  const exceeded = status === 'exceeded';
  const text = exceeded
    ? `You have spent ${formatCurrency(amountSpent - limit, currency)} over your budget.`
    : `You have used ${Math.round(percentUsed)}% of your monthly budget.`;

  return (
    <Pressable
      onPress={() => navigation?.navigate('Budget')}
      style={[styles.banner, { backgroundColor: exceeded ? colors.expenseLight : colors.warningLight }]}
    >
      <Ionicons name={exceeded ? 'warning' : 'alert-circle'} size={20} color={exceeded ? colors.expense : colors.warning} />
      <View style={{ flex: 1, marginHorizontal: spacing.md }}>
        <Text style={[styles.bannerTitle, { color: exceeded ? colors.danger : '#92400E' }]}>
          {exceeded ? 'Budget exceeded' : 'Almost there'}
        </Text>
        <Text style={styles.bannerText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={exceeded ? colors.danger : '#92400E'} />
    </Pressable>
  );
}

function QuickActionBar({ onAdd, onAssistant }) {
  return (
    <View style={styles.quickRow}>
      <Pressable onPress={onAdd} style={[styles.quickAction, { backgroundColor: colors.primary }]}>
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.quickActionText}>Add</Text>
      </Pressable>
      <Pressable onPress={onAssistant} style={[styles.quickAction, { backgroundColor: colors.income }]}>
        <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
        <Text style={styles.quickActionText}>Ask</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  greeting: { ...typography.h1, fontSize: 24 },
  dateLine: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 24,
    padding: spacing.xl,
  },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { ...typography.caption, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  balanceValue: { ...typography.h1, fontSize: 38, color: '#FFFFFF', marginVertical: spacing.sm },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  balanceStat: { flex: 1, flexDirection: 'column' },
  balanceDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: spacing.md },
  balanceStatLabel: { ...typography.small, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  balanceStatValue: { ...typography.h3, color: '#FFFFFF', marginTop: 2 },
  summaryRow: { flexDirection: 'row', marginTop: spacing.lg },
  block: { marginTop: spacing.xl },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.lg,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: 14,
  },
  insightText: { ...typography.caption, color: '#92400E', marginLeft: spacing.sm, flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: 16,
  },
  bannerTitle: { ...typography.bodyMedium },
  bannerText: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  quickRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 14,
    gap: 6,
  },
  quickActionText: { ...typography.bodyMedium, color: '#FFFFFF' },
});