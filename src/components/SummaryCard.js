import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadow } from '../theme';

/**
 * Summary statistic card used on the dashboard and summary screen.
 * Demonstrates: props, conditional colors, responsive flexbox.
 */
export default function SummaryCard({ label, value, icon = 'stats-chart', color = colors.primary, trend, accent }) {
  return (
    <View style={[styles.card, accent && { backgroundColor: color, borderColor: color }]}>
      {accent ? (
        <Ionicons name={icon} size={20} color={colors.textInverse} style={{ marginRight: spacing.md }} />
      ) : (
        <View style={[styles.icon, { backgroundColor: `${color}1F` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={[styles.label, accent && { color: 'rgba(255,255,255,0.9)' }]}>{label}</Text>
        <Text style={[styles.value, accent && { color: colors.textInverse }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {trend ? (
          <Text style={[styles.trend, trend.direction === 'down' && { color: colors.warning }]}>
            {trend.icon} {trend.text}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  label: { ...typography.small, letterSpacing: 0.2 },
  value: { ...typography.h3, marginTop: 2 },
  trend: { ...typography.small, marginTop: 2, color: colors.income },
});