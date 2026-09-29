import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategory } from '../constants/categories';
import { formatCurrency } from '../utils/format';
import { colors, spacing, typography } from '../theme';

export { TopExpenseChart, DonutChart };

/**
 * Horizontal bar breakdown of spending by category.
 * Pure RN views — shared by Dashboard, Summary and Budget.
 */
function TopExpenseChart({ ranked, currency = 'USD', limit = 5 }) {
  if (!ranked || !ranked.length) return null;
  const top = ranked.slice(0, limit);
  const max = Math.max(...top.map((c) => c.amount), 1);

  return (
    <View style={{ marginTop: spacing.sm }}>
      {top.map(({ category, amount }) => {
        const meta = getCategory(category);
        const percent = (amount / max) * 100;
        return (
          <View key={category} style={styles.row}>
            <View style={styles.labelCol}>
              <Text style={styles.name} numberOfLines={1}>
                {meta.label}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${percent}%`, backgroundColor: meta.color }]} />
            </View>
            <Text style={styles.amount}>{formatCurrency(amount, currency)}</Text>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Category breakdown rendered as segments of a horizontal stacked bar.
 */
function DonutChart({ ranked, currency = 'USD' }) {
  if (!ranked || !ranked.length) return null;
  const total = ranked.reduce((sum, c) => sum + c.amount, 0);
  if (total <= 0) return null;

  const items = ranked.map((c) => ({ ...c, percent: (c.amount / total) * 100, meta: getCategory(c.category) }));
  const segments = items.map((item) => `${item.percent}%`);

  return (
    <View>
      <View style={styles.bar}>
        {items.map((item) => (
          <View
            key={item.category}
            style={{ width: segments[items.indexOf(item)], backgroundColor: item.meta.color, height: 14 }}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {items.slice(0, 6).map((item) => (
          <View key={item.category} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.meta.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.meta.label}
            </Text>
            <Text style={styles.legendValue}>{formatCurrency(item.amount, currency)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  labelCol: { width: 92, marginRight: spacing.sm },
  name: { ...typography.caption, marginBottom: 4 },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  fill: { height: '100%', borderRadius: 4 },
  amount: { ...typography.small, color: colors.textSecondary, minWidth: 64, textAlign: 'right' },
  bar: {
    flexDirection: 'row',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  legend: { gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { ...typography.caption, flex: 1 },
  legendValue: { ...typography.bodyMedium, color: colors.textSecondary },
});