import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { toISODate } from '../utils/format';
import { colors, spacing, typography } from '../theme';

/**
 * Cross-platform date picker.
 * - iOS: inline spinner inside a bottom sheet modal.
 * - Android: native dialog (imperative).
 */
export default function DateTimePickerModal({ initialDate, onConfirm, onCancel }) {
  const [value, setValue] = React.useState(() => {
    const iso = initialDate || toISODate(new Date());
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  });

  const isoValue = toISODate(value);

  const onChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        onCancel();
        return;
      }
      setValue(selectedDate || value);
      onConfirm(toISODate(selectedDate || value));
      return;
    }
    if (selectedDate) setValue(selectedDate);
  };

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        onChange={onChange}
        maximumDate={new Date(new Date().getFullYear() + 5, 11, 31)}
      />
    );
  }

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.toolbar}>
          <Pressable onPress={onCancel} style={styles.toolbarButton}>
            <Text style={[styles.toolbarText, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Text style={styles.toolbarTitle}>Select date</Text>
          <Pressable
            onPress={() => onConfirm(isoValue)}
            style={[styles.toolbarButton, styles.toolbarButtonRight]}
          >
            <Text style={[styles.toolbarText, { color: colors.primary, fontWeight: '700' }]}>Done</Text>
          </Pressable>
        </View>
        <DateTimePicker
          value={value}
          mode="date"
          display="spinner"
          onChange={onChange}
          maximumDate={new Date(new Date().getFullYear() + 5, 11, 31)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  toolbarTitle: { ...typography.h3 },
  toolbarButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  toolbarButtonRight: { alignItems: 'flex-end' },
  toolbarText: { ...typography.bodyMedium },
});