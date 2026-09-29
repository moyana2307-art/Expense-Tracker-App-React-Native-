import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';

/**
 * Generic card container used across the app.
 * Demonstrates: props, composition, children.
 */
export default function Card({ children, style, padded = true, onPress, testID }) {
  const content = (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? spacing.lg : 0,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {content}
    </Pressable>
  );
}

export function SectionTitle({ title, action, onActionPress, style }) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        },
        style,
      ]}
    >
      <Text style={[typography.h3, { color: colors.text }]}>{title}</Text>
      {action ? (
        <Text
          onPress={onActionPress}
          style={{ ...typography.caption, color: colors.primary, fontWeight: '600' }}
        >
          {action}
        </Text>
      ) : null}
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: colors.divider, marginVertical: spacing.md }, style]} />;
}

export function Badge({ label, color = colors.primary, background }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: background || `${color}1A`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.pill,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '700', color, letterSpacing: 0.3 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

export function IconBubble({ name, color = colors.primary, size = 42, iconSize = 20 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${color}1F`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={iconSize} color={color} />
    </View>
  );
}
