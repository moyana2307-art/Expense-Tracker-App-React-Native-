import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Input from '../components/Input';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography } from '../theme';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');

  const start = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to get started.');
      return;
    }
    completeOnboarding({ name: trimmed, joinedAt: Date.now() });
  };

  return (
    <LinearGradient colors={['#1E3A8A', '#2563EB', '#3B82F6']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaWrap insets={insets}>
          <View style={styles.top}>
            <View style={styles.logo}>
              <Ionicons name="wallet" size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Smart Expense Tracker</Text>
            <Text style={styles.subtitle}>
              Track income, control spending and get instant answers about your money.
            </Text>
          </View>

          <View style={styles.bottom}>
            <Text style={styles.formTitle}>Let&apos;s set you up</Text>

            <Input
              label="Your name"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (error) setError('');
              }}
              placeholder="e.g. Alex Johnson"
              icon="person-outline"
              error={error}
              autoFocus
              returnKeyType="done"
            />

            <Text style={styles.currencyLabel}>Base currency</Text>
            <View style={styles.currencyRow}>
              {CURRENCIES.map((c) => {
                const selected = c === currency;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCurrency(c)}
                    style={[styles.currencyChip, selected && styles.currencyChipSelected]}
                  >
                    <Text style={[styles.currencyText, selected && { color: '#FFFFFF' }]}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Button title="Get Started" icon="arrow-forward" onPress={start} size="lg" style={{ marginTop: spacing.lg }} />
            <Text style={styles.hint}>Your data stays on this device.</Text>
          </View>
        </SafeAreaWrap>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function SafeAreaWrap({ children, insets }) {
  return (
    <View style={[styles.wrap, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  wrap: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.xl },
  top: { alignItems: 'center', paddingTop: spacing.xxl },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1, color: '#FFFFFF', fontSize: 26, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
    maxWidth: 300,
  },
  bottom: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: spacing.xl,
    marginBottom: spacing.sm,
  },
  formTitle: { ...typography.h2, marginBottom: spacing.lg },
  currencyLabel: { ...typography.caption, fontWeight: '600', marginBottom: spacing.sm },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  currencyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  currencyChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  currencyText: { ...typography.bodyMedium },
  hint: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});