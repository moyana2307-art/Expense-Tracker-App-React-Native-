import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

/**
 * Reusable labelled text input with validation message and optional prefix.
 * Demonstrates: controlled component, forwardRef-like value binding.
 */
export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  prefix,
  icon,
  multiline = false,
  maxLength,
  autoFocus = false,
  style,
  testID,
  returnKeyType,
  onSubmitEditing,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textMuted} style={styles.left} /> : null}
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}

        <TextInput
          testID={testID}
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
        />

        {maxLength && multiline ? (
          <Text style={styles.counter}>
            {value.length}/{maxLength}
          </Text>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.caption, marginBottom: spacing.sm, fontWeight: '600' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: spacing.md, minHeight: 88 },
  fieldFocused: { borderColor: colors.primary, backgroundColor: colors.surface },
  fieldError: { borderColor: colors.expense },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 13,
  },
  inputMultiline: { textAlignVertical: 'top', minHeight: 64, paddingTop: 0 },
  left: { marginRight: spacing.sm },
  prefix: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginRight: 4 },
  counter: { ...typography.small, fontSize: 11 },
  error: { ...typography.small, color: colors.expense, marginTop: 5, fontWeight: '600' },
});
