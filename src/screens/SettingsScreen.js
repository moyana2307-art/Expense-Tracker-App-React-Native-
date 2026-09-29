import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Switch, Pressable, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';
import { IconBubble } from '../components/Card';
import { formatCurrency } from '../utils/format';
import { colors, spacing, typography, radius } from '../theme';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

export default function SettingsScreen() {
  const {
    profile,
    settings,
    currency,
    transactions,
    updateSettings,
    updateProfile,
    loadSampleData,
    deleteAllTransactions,
    signOut,
  } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile?.name || '');

  const saveName = () => {
    const trimmed = nameDraft.trim() || profile?.name || 'User';
    updateProfile({ name: trimmed });
    updateSettings({ greetingName: trimmed });
    setEditingName(false);
  };

  const confirmClear = () => {
    Alert.alert(
      'Delete all data',
      `This will permanently delete all ${transactions.length} transactions and your budget. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: deleteAllTransactions },
      ]
    );
  };

  const confirmSample = () => {
    loadSampleData();
    Alert.alert('Sample data loaded', '12 example transactions have been added to your records.');
  };

  return (
    <View style={styles.screen}>
      <Header title="Profile & settings" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <IconBubble name="person" color={colors.primary} size={64} iconSize={30} />
          <View style={{ flex: 1, marginLeft: spacing.lg }}>
            {editingName ? (
              <EditNameRow value={nameDraft} onChange={setNameDraft} onSave={saveName} onCancel={() => setEditingName(false)} />
            ) : (
              <>
                <Text style={typography.h2}>{profile?.name || 'User'}</Text>
                <Text style={[typography.caption, { marginTop: 3 }]}>
                  {transactions.length} transactions tracked
                </Text>
                <Pressable onPress={() => { setNameDraft(profile?.name || ''); setEditingName(true); }}>
                  <Text style={[typography.caption, { color: colors.primary, fontWeight: '600', marginTop: 6 }]}>
                    Change name
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        <Section title="Preferences">
          <View style={styles.currencyBlock}>
            <Text style={sections.label}>Base currency</Text>
            <View style={styles.currencyRow}>
              {CURRENCIES.map((c) => {
                const selected = c === currency;
                return (
                  <Pressable
                    key={c}
                    onPress={() => updateSettings({ currency: c })}
                    style={[styles.currencyChip, selected && styles.currencyChipSelected]}
                  >
                    <Text style={[styles.currencyText, selected && { color: '#FFFFFF' }]}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ToggleRow
            icon="eye-off-outline"
            label="Hide amounts"
            description="Blur balances on the dashboard"
            value={settings.hideAmounts}
            onChange={(v) => updateSettings({ hideAmounts: v })}
          />
        </Section>

        <Section title="Your data">
          <ActionRow
            icon="download-outline"
            label="Load sample data"
            description="Add example transactions to explore the app"
            onPress={confirmSample}
          />
          <ActionRow
            icon="trash-outline"
            label="Delete all transactions"
            description={`Remove all ${transactions.length} recorded transactions`}
            onPress={confirmClear}
            danger
          />
        </Section>

        <Section title="About">
          <InfoRow icon="information-circle-outline" label="App version" value="1.0.0" />
          <InfoRow
            icon="server-outline"
            label="Data storage"
            value="On-device (AsyncStorage)"
          />
          <InfoRow icon="card-outline" label="Currency format" value={formatCurrency(1234.5, currency)} />
        </Section>

        <Button title="Sign out" variant="secondary" icon="log-out-outline" onPress={signOut} style={{ marginTop: spacing.xl }} />
        <Text style={styles.footer}>Smart Expense Tracker · Student project</Text>
      </ScrollView>
    </View>
  );
}

const sections = StyleSheet.create({
  label: { ...typography.caption, fontWeight: '700', marginBottom: spacing.sm },
});

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function ToggleRow({ icon, label, description, value, onChange }) {
  return (
    <View style={styles.row}>
      <IconBubble name={icon} color={colors.primary} size={38} iconSize={17} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={typography.bodyMedium}>{label}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} thumbColor="#FFFFFF" />
    </View>
  );
}

function ActionRow({ icon, label, description, onPress, danger }) {
  const color = danger ? colors.expense : colors.primary;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <IconBubble name={icon} color={color} size={38} iconSize={17} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[typography.bodyMedium, danger && { color: colors.expense }]}>{label}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <IconBubble name={icon} color={colors.textMuted} size={38} iconSize={17} />
      <Text style={[typography.body, { flex: 1, marginLeft: spacing.md }]}>{label}</Text>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

function EditNameRow({ value, onChange, onSave, onCancel }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.editNameBox}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          style={styles.editNameInput}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onSave}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
        <Pressable onPress={onSave}>
          <Text style={[typography.caption, { color: colors.income, fontWeight: '700' }]}>Save</Text>
        </Pressable>
        <Pressable onPress={onCancel}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    ...typography.h3,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginHorizontal: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowDescription: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  currencyBlock: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider, marginBottom: spacing.xs },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  currencyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  currencyText: { ...typography.bodyMedium },
  editNameBox: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  editNameInput: { fontSize: 16, fontWeight: '600', color: colors.text, paddingVertical: spacing.sm },
  footer: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});