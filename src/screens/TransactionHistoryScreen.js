import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import TransactionCard from '../components/TransactionCard';
import EmptyState from '../components/EmptyState';
import { SegmentedControl } from '../components/Button';
import { CATEGORY_FILTERS } from '../constants/filters';
import { formatCurrency, formatDayHeading } from '../utils/format';
import { filterTransactions, searchTransactions, totalExpenses, totalIncome, sortByDateDesc } from '../utils/calculations';
import { colors, spacing, typography } from '../theme';

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { transactions, currency } = useApp();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');

  const filtered = useMemo(() => {
    const base = filterTransactions(transactions, { category, type });
    return searchTransactions(base, query);
  }, [transactions, category, type, query]);

  const groups = useMemo(() => {
    const sorted = sortByDateDesc(filtered);
    const map = new Map();
    for (const t of sorted) {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date).push(t);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const totals = useMemo(
    () => ({
      income: totalIncome(filtered),
      expenses: totalExpenses(filtered),
    }),
    [filtered]
  );


  const renderGroup = ({ item: [date, items] }) => (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupDay}>{formatDayHeading(date)}</Text>
        <Text style={styles.groupTotal}>
          {formatCurrency(
            items.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
            currency
          )}
        </Text>
      </View>
      {items.map((t) => (
        <TransactionCard
          key={t.id}
          transaction={t}
          currency={currency}
          onPress={() => navigation.navigate('TransactionDetails', { id: t.id })}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[typography.h1, { fontSize: 26 }]}>Activity</Text>
        <Text style={styles.subtitle}>
          {filtered.length} transaction{filtered.length === 1 ? '' : 's'}
          {transactions.length !== filtered.length ? ' shown' : ''}
        </Text>
      </View>

      <View style={styles.summaryPill}>
        <View style={styles.pillStat}>
          <Ionicons name="arrow-down" size={14} color={colors.income} />
          <Text style={styles.pillLabel}>Income</Text>
          <Text style={styles.pillValue}>{formatCurrency(totals.income, currency)}</Text>
        </View>
        <View style={styles.pillDivider} />
        <View style={styles.pillStat}>
          <Ionicons name="arrow-up" size={14} color={colors.expense} />
          <Text style={styles.pillLabel}>Spent</Text>
          <Text style={styles.pillValue}>{formatCurrency(totals.expenses, currency)}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title, category, amount..."
          placeholderTextColor={colors.textMuted}
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <SegmentedControl
        value={type}
        onChange={setType}
        options={[
          { value: 'All', label: 'All' },
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
        ]}
        style={styles.typeControl}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={{ flexGrow: 0 }}
      >
        {CATEGORY_FILTERS.map((c) => {
          const selected = category === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCategory(c.key)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              {c.key !== 'All' ? <Ionicons name={c.icon} size={13} color={selected ? '#FFFFFF' : c.color} /> : null}
              <Text style={[styles.chipText, selected && { color: '#FFFFFF' }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={transactions.length === 0 ? 'No transactions yet' : 'No matches found'}
          message={
            transactions.length === 0
              ? 'Tap the + button to add your first transaction.'
              : 'Try a different search term or clear the filters.'
          }
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item[0]}
          renderItem={renderGroup}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <Text style={styles.deleteHint}>Open a transaction to edit or delete it.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.md },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  summaryPill: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  pillStat: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md },
  pillDivider: { width: 1, backgroundColor: colors.divider, marginVertical: 4 },
  pillLabel: { ...typography.small, marginLeft: 4, flex: 1 },
  pillValue: { ...typography.bodyMedium, marginLeft: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 12, marginLeft: spacing.sm },
  typeControl: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 8 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 140 },
  group: { marginBottom: spacing.lg },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  groupDay: { ...typography.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  groupTotal: { ...typography.caption, color: colors.textSecondary },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { ...typography.caption, color: colors.textSecondary },
  deleteHint: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
