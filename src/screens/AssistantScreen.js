import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { answerQuestion, SUGGESTED_QUESTIONS } from '../utils/assistant';
import { IconBubble } from '../components/Card';
import { colors, spacing, typography, radius } from '../theme';

const GREETING = {
  role: 'assistant',
  text: "Hi, I'm your Smart Assistant. Ask me anything about your income, spending or budget — I'll compute the answer from your transactions.",
  suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
};

const COMPOSER_OFFSET = 92;

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, currency, budget, analytics } = useApp();
  const listRef = useRef(null);

  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const context = useMemo(
    () => ({ transactions, currency, budget, analytics }),
    [transactions, budget, currency, analytics]
  );

  const send = (text) => {
    const question = String(text || '').trim();
    if (!question || thinking) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }, { role: 'assistant', text: '…', thinking: true }]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const answer = answerQuestion(question, context);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', text: answer.message, suggestions: answer.suggestions, intent: answer.intent };
        return copy;
      });
      setThinking(false);
    }, 450);
  };

  const canSend = input.trim().length > 0 && !thinking;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <View style={styles.assistantIdentity}>
          <IconBubble name="sparkles" color={colors.primary} size={42} iconSize={20} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={typography.h3}>Smart Assistant</Text>
            <Text style={[typography.small, { color: colors.income, marginTop: 1 }]}>
              ● Online · answers from your data
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => <MessageBubble message={item} />}
        ListEmptyComponent={null}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.composerWrap}>
        {messages.length > 0 && (messages[messages.length - 1].suggestions?.length > 0 || messages[messages.length - 1].thinking) ? (
          <View style={styles.suggestRow}>
            {messages[messages.length - 1].suggestions?.slice(0, 2).map((s) => (
              <Pressable key={s} onPress={() => send(s)} disabled={thinking} style={styles.suggestionChip}>
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your spending..."
            placeholderTextColor={colors.textMuted}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            multiline
          />
          <Pressable
            onPress={() => send(input)}
            disabled={!canSend}
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send question"
          >
            <Ionicons name={thinking ? 'hourglass-outline' : 'arrow-up'} size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <IconBubble name="sparkles" color={colors.primary} size={30} iconSize={15} />
      <View style={styles.assistantBubble}>
        {message.thinking ? (
          <View style={styles.typingDots}>
            <View style={[styles.dot, { opacity: 0.4 }]} />
            <View style={[styles.dot, { opacity: 0.7 }]} />
            <View style={styles.dot} />
          </View>
        ) : (
          <Text style={styles.assistantText}>{message.text}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  assistantIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.md },
  userRow: { alignItems: 'flex-end' },
  userBubble: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    maxWidth: '78%',
  },
  userText: { ...typography.body, color: '#FFFFFF' },
  assistantRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    flex: 1,
  },
  assistantText: { ...typography.body, lineHeight: 21 },
  typingDots: { flexDirection: 'row', gap: 5, paddingVertical: spacing.sm },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.textMuted,
  },
  composerWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: COMPOSER_OFFSET,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  suggestRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
  suggestionChip: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    maxWidth: '60%',
  },
  suggestionText: { ...typography.small, color: colors.primary },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingLeft: spacing.md,
    paddingVertical: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    maxHeight: 90,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  sendButtonDisabled: { opacity: 0.4 },
});