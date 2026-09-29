import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategory } from '../constants/categories';
import { formatCurrency } from '../utils/format';
import { colors, radius, spacing, typography } from '../theme';

/**
 * Category spending card with a progress-style bar.
 */
export default function CategoryCard({ categoryKey, amount, percent = 0, onPress, currency = 'USD' }) {
  const category = getCategory(categoryKey);
  const width = Math.min(Math.max(percent, 0), 100);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: `${category.color}1F` }]}>
        <Ionicons name={category.icon} size={18} color={category.color} />
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{category.label}</Text>
            <Text style={styles.amount}>{formatCurrency(amount, currency)}</Text>
          </View>
          <Text style={styles.percent}>{Math.round(percent)}%</Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${width}%`, backgroundColor: category.color }]} />
        </View>
      </View>
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
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  body: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { ...typography.bodyMedium },
  amount: { ...typography.caption, marginTop: 1 },
  percent: { ...typography.h3, marginLeft: spacing.sm },
  track: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  pressed: { opacity: 0.7 },
});