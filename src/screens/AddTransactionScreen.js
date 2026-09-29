import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Button, { SegmentedControl } from '../components/Button';
import Input from '../components/Input';
import { useApp } from '../context/AppContext';
import { categoriesForType, getCategory } from '../constants/categories';
import { colors, spacing, typography, radius } from '../theme';
import { toISODate, formatDate } from '../utils/format';
import DateTimePickerModal from '../components/DateTimePickerModal';

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { addTransaction, updateTransaction, transactions, currency } = useApp();

  const editingId = route.params?.id;
  const editing = editingId
    ? transactions.find((t) => t.id === editingId) || null
    : null;

  const [title, setTitle] = useState(editing?.title || '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [type, setType] = useState(editing?.type || 'expense');
  const [category, setCategory] = useState(editing?.category || 'Food');
  const [date, setDate] = useState(editing?.date || toISODate(new Date()));
  const [note, setNote] = useState(editing?.note || '');
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = categoriesForType(type);

  const pickType = (next) => {
    setType(next);
    if (!categories.find((c) => c.key === category)) {
      setCategory(categoriesForType(next)[0].key);
    }
    setErrors({});
  };

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = 'Please enter a title.';
    const value = parseFloat(amount);
    if (!amount.trim() || isNaN(value)) next.amount = 'Please enter a valid amount.';
    else if (value <= 0) next.amount = 'Amount must be greater than zero.';
    const parsedDate = toISODate(new Date(`${date}T00:00:00`));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) next.date = 'Invalid date.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;

    const payload = { title, amount: parseFloat(amount), type, category, date, note };

    if (editing) {
      updateTransaction(editing.id, payload);
      Alert.alert('Saved', 'Transaction updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } else {
      addTransaction(payload);
      Alert.alert('Added', 'Transaction saved to your records.', [
        { text: 'Add another', style: 'cancel' },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
      setTitle('');
      setAmount('');
      setNote('');
      setErrors({});
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title={editing ? 'Edit transaction' : 'Add transaction'}
        subtitle={editing ? getCategory(editing.category).label : `in ${currency}`}
        showBack
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControl
          value={type}
          onChange={pickType}
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={[styles.amountBox, !!errors.amount && styles.errorBox]}>
            <Text style={styles.prefix}>{currency === 'USD' ? '$' : '¤'}</Text>
            <TextInputAmount value={amount} onChangeText={(v) => { setAmount(v); if (errors.amount) setErrors({ ...errors, amount: '' }); }} />
          </View>
          {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
        </View>

        <Input
          label="Title"
          value={title}
          onChangeText={(v) => { setTitle(v); if (errors.title) setErrors({ ...errors, title: '' }); }}
          placeholder={type === 'income' ? 'e.g. Monthly salary' : 'e.g. Grocery shopping'}
          icon="pricetag-outline"
          error={errors.title}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {categories.map((c) => {
            const selected = category === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setCategory(c.key)}
                style={[styles.chip, selected && { backgroundColor: c.color, borderColor: c.color }]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Ionicons name={c.icon} size={15} color={selected ? '#FFFFFF' : c.color} />
                <Text style={[styles.chipText, selected && { color: '#FFFFFF' }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.dateRow} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.labelInline}>Date</Text>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Input
          label="Notes (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Add any extra details..."
          icon="create-outline"
          multiline
          maxLength={180}
        />

        <Button
          title={editing ? 'Save changes' : 'Add transaction'}
          icon={editing ? 'checkmark' : 'add'}
          onPress={save}
          size="lg"
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>

      {showPicker ? (
        <DateTimePickerModal
          initialDate={date}
          onConfirm={(iso) => { setDate(iso); setShowPicker(false); }}
          onCancel={() => setShowPicker(false)}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

function TextInputAmount({ value, onChangeText }) {
  return (
    <TextInput
      style={styles.amountInput}
      value={value}
      onChangeText={onChangeText}
      keyboardType="decimal-pad"
      placeholder="0.00"
      placeholderTextColor={colors.textMuted}
      accessibilityLabel="Amount"
      returnKeyType="done"
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  fieldGroup: { marginTop: spacing.xl },
  label: { ...typography.caption, fontWeight: '600', marginBottom: spacing.sm },
  labelInline: { ...typography.small, color: colors.textMuted },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBox: { borderColor: colors.expense },
  prefix: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginRight: 6 },
  amountInput: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.text, paddingVertical: 14 },
  errorText: { ...typography.small, color: colors.expense, marginTop: -12, marginBottom: spacing.md, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { ...typography.caption, color: colors.text },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  dateText: { ...typography.bodyMedium, marginTop: 2 },
});