import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';

/**
 * App bar shown at the top of every screen.
 * Demonstrates: reusable header with conditional back button.
 */
export default function Header({ title, subtitle, showBack = false, right, onBack }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (onBack) onBack();
    else if (navigation?.canGoBack()) navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        {showBack ? (
          <Ionicons
            name="chevron-back"
            size={26}
            color={colors.text}
            style={styles.back}
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          />
        ) : (
          <View style={styles.back} />
        )}

        <View style={styles.titles}>
          <Text style={typography.h3} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[typography.small, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ? right : <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  titles: { flex: 1, alignItems: 'center' },
  back: { width: 30, alignItems: 'center', justifyContent: 'center' },
  placeholder: { width: 30 },
});