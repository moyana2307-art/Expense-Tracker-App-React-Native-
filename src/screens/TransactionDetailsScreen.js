import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import Button from '../components/Button';
import { IconBubble } from '../components/Card';
import { getCategory } from '../constants/categories';
import { formatCurrency, formatDate } from '../utils/format';
import { colors, spacing, typography, shadow, radius } from '../theme';

export default function TransactionDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactions, currency, deleteTransaction } = useApp();

  const transaction = useMemo(
    () => transactions.find((t) => t.id === route.params?.id) || null,
    [transactions, route.params?.id]
  );

  if (!transaction) {
    return (
      <View style={styles.screen}>
        <Header title="Transaction" showBack />
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
            This transaction no longer exists.
          </Text>
        </View>
      </View>
    );
  }

  const isIncome = transaction.type === 'income';
  const color = isIncome ? colors.income : colors.expense;
  const category = getCategory(transaction.category);

  const headerBackground = isIncome ? colors.income : colors.expense;

  const onEdit = () =>
    navigation.navigate('AddTransaction', { id: transaction.id, edit: true });

  const onDelete = () => {
    Alert.alert(
      'Delete transaction',
      `Permanently delete "${transaction.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTransaction(transaction.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <Header title="Transaction details" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.amountCard, { backgroundColor: headerBackground }]}>
          <View style={styles.amountCardTop}>
            <Ionicons
              name={isIncome ? 'arrow-down' : 'arrow-up'}
              size={14}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.amountCardLabel}>
              {isIncome ? 'INCOME' : 'EXPENSE'} {'\u00B7'} {category.label.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.amountText} numberOfLines={1} adjustsFontSizeToFit>
            {isIncome ? '+' : '−'}
            {formatCurrency(transaction.amount, currency)}
          </Text>
        </View>

        <View style={[styles.detailsCard, shadow.card]}>
          <View style={styles.detailHeader}>
            <IconBubble name={category.icon} color={category.color} size={52} iconSize={24} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={typography.h3}>{transaction.title}</Text>
              <Text style={[typography.caption, { marginTop: 2 }]}>{category.label}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <DetailLine label="Date" value={formatDate(transaction.date)} icon="calendar-outline" />
            <DetailLine label="Type" value={isIncome ? 'Income' : 'Expense'} icon={isIncome ? 'arrow-down' : 'arrow-up'} valueColor={color} />
            <DetailLine label="Category" value={category.label} icon={category.icon} />
            <DetailLine label="Amount" value={formatCurrency(transaction.amount, currency)} icon="cash-outline" />
            {transaction.note ? (
              <DetailLine label="Notes" value={transaction.note} icon="create-outline" />
            ) : null}
          </View>
        </View>

        <Button title="Edit transaction" icon="create-outline" onPress={onEdit} variant="secondary" />
        <Button title="Delete transaction" icon="trash-outline" onPress={onDelete} variant="danger" style={{ marginTop: spacing.md }} />
      </ScrollView>
    </View>
  );
}

function DetailLine({ label, value, icon, valueColor }) {
  return (
    <View style={styles.detailLine}>
      <View style={styles.detailLabelRow}>
        {icon ? <Ionicons name={icon} size={15} color={colors.textMuted} style={{ marginRight: 6 }} /> : null}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color: valueColor || colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  amountCard: {
    borderRadius: 22,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadow.raised,
  },
  amountCardTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amountCardLabel: { ...typography.small, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
  amountText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: spacing.md,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailRow: { paddingTop: spacing.md },
  detailLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center' },
  detailLabel: { ...typography.body, color: colors.textSecondary },
  detailValue: { ...typography.bodyMedium, flexShrink: 1, textAlign: 'right', marginLeft: spacing.md },
});