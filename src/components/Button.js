import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

/**
 * Reusable Button supporting variants and an optional icon.
 * Demonstrates: props with defaults, conditional rendering.
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  style,
  fullWidth = true,
  testID,
}) {
  const isDisabled = disabled;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant]?.container,
        fullWidth && { alignSelf: 'stretch' },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={sizeIconSizes[size]} color={variantStyles[variant]?.label.color} style={styles.icon} /> : null}
      <Text style={[styles.label, sizeStyles[size].label, variantStyles[variant]?.label]} numberOfLines={1}>
        {title}
      </Text>
      {iconRight ? <Ionicons name={iconRight} size={sizeIconSizes[size]} color={variantStyles[variant]?.label.color} style={styles.iconRight} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  label: { fontWeight: '700' },
  icon: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
});

const sizeStyles = {
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    label: { fontSize: 13 },
  },
  md: {
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    label: { fontSize: 15 },
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    label: { fontSize: 17 },
  },
};

const sizeIconSizes = { sm: 15, md: 18, lg: 20 };

const variantStyles = {
  primary: {
    container: { backgroundColor: colors.primary },
    label: { color: colors.textInverse },
  },
  secondary: {
    container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    label: { color: colors.text },
  },
  ghost: {
    container: { backgroundColor: colors.transparent },
    label: { color: colors.primary },
  },
  danger: {
    container: { backgroundColor: colors.expense },
    label: { color: colors.textInverse },
  },
  success: {
    container: { backgroundColor: colors.income },
    label: { color: colors.textInverse },
  },
};

/** Row of mutually exclusive options — used for Income/Expense switching. */
export function SegmentedControl({ options, value, onChange, style }) {
  return (
    <View style={[segmentStyles.container, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              segmentStyles.segment,
              selected && { backgroundColor: option.color || colors.primary },
            ]}
          >
            <Text
              style={[
                segmentStyles.label,
                { color: selected ? colors.textInverse : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const segmentStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: radius.sm,
  },
  label: { fontSize: 15, fontWeight: '700' },
});
