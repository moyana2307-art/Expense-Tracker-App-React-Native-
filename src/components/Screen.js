import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

/**
 * Screen padding wrapper providing a consistent background and safe scrolling.
 */
export function Screen({ children, style, scroll = true }) {
  if (!scroll) {
    return <View style={[styles.screen, style]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, style]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});

/**
 * Small inline stat: label on left, value on right.
 */
export function StatRow({ label, value, valueColor = colors.text, icon, style }) {
  return (
    <View style={[statRowStyles.row, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon ? (
          <Ionicons name={icon} size={15} color={colors.textMuted} style={{ marginRight: 6 }} />
        ) : null}
        <Text style={statRowStyles.label}>{label}</Text>
      </View>
      <Text style={[statRowStyles.value, { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const statRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.bodyMedium },
});