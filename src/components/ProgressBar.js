import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

/**
 * Progress bar that changes colour as the user approaches a budget limit.
 */
export default function ProgressBar({ percent, color = colors.primary, trackColor, height = 8, style }) {
  const width = Math.min(Math.max(percent || 0, 0), 100);
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor || colors.surfaceAlt }, style]}>
      <View style={[styles.fill, { width: `${width}%`, backgroundColor: color }]} />
    </View>
  );
}

/**
 * Label + progress bar used by the budget screen.
 */
export function BudgetProgress({ spent, limit, currency, style }) {
  const percent = limit > 0 ? (spent / limit) * 100 : 0;
  const color = percent >= 100 ? colors.expense : percent >= 85 ? colors.warning : colors.income;

  return (
    <View style={style}>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Spent</Text>
        <Text style={[styles.metaValue, { color }]}>
          {Math.round(percent)}% of {currency}
        </Text>
      </View>
      <ProgressBar percent={percent} color={color} height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metaLabel: { ...typography.caption },
  metaValue: { ...typography.bodyMedium },
});

export { styles as progressStyles };