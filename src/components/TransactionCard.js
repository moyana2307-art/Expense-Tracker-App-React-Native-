import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getCategory } from '../constants/categories';
import { formatCurrency } from '../utils/format';
import { colors, radius, spacing, typography } from '../theme';
import { IconBubble } from './Card';

/**
 * A single transaction row used in lists across the app.
 * Demonstrates: reusable component, conditional styling by type.
 */
export default function TransactionCard({ transaction, currency = 'USD', onPress, hideAmount = false, testID }) {
  if (!transaction) return null;
  const category = getCategory(transaction.category);
  const isIncome = transaction.type === 'income';
  const color = isIncome ? colors.income : colors.expense;
  const sign = isIncome ? '+' : '−';

  const card = (
    <View style={styles.card}>
      <IconBubble name={category.icon} color={category.color} size={44} iconSize={20} />

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{category.label}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.date}>{transaction.date}</Text>
        </View>
      </View>

      <Text style={[styles.amount, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {hideAmount ? '••••' : `${sign}${formatCurrency(transaction.amount, currency)}`}
      </Text>
    </View>
  );

  if (!onPress) return card;
  return (
    <Pressable onPress={onPress} testID={testID} style={({ pressed }) => pressed && styles.pressed}>
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  details: { flex: 1, marginHorizontal: spacing.md },
  title: { ...typography.bodyMedium, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  category: { ...typography.small },
  dot: { ...typography.small, marginHorizontal: 5 },
  date: { ...typography.small, color: colors.textMuted },
  amount: { ...typography.h3, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});