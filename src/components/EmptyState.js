import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { colors, spacing, typography } from '../theme';

/**
 * Friendly empty-state placeholder with optional CTA.
 */
export default function EmptyState({
  icon = 'file-tray-outline',
  title = 'Nothing here yet',
  message,
  actionTitle,
  onAction,
  color = colors.primary,
}) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={34} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionTitle ? (
        <Button title={actionTitle} onPress={onAction} icon="add" style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h3, textAlign: 'center', marginBottom: spacing.sm },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  button: { marginTop: spacing.xl, minWidth: 200 },
});