import { CATEGORIES, EXPENSE_CATEGORIES, getCategory } from '../constants/categories';
import { currentMonthKey, formatCurrency, monthLabel } from './format';
import {
  averageDailySpend,
  dailyAverageForCategory,
  rankedCategories,
  sortByDateDesc,
  toNumber,
  topCategoryShare,
  totalBalance,
  totalExpenses,
  totalIncome,
} from './calculations';

export const SUGGESTED_QUESTIONS = [
  'What is my current balance?',
  'How much did I spend on food?',
  'What category am I spending the most on?',
  'How much income have I received?',
  'Give me a summary of my expenses.',
  'Am I over budget?',
];

function normalise(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s$£€₹¥]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAny(text, phrases) {
  return phrases.some((p) => text.includes(p));
}

function findCategoryIn(text) {
  const aliases = {
    food: ['food', 'groceries', 'grocery', 'eating', 'restaurant', 'dining', 'meals', 'coffee'],
    transport: ['transport', 'transportation', 'travel', 'bus', 'taxi', 'uber', 'fuel', 'gas', 'commute'],
    shopping: ['shopping', 'clothes', 'clothing', 'retail', 'shoes'],
    rent: ['rent', 'housing', 'apartment', 'mortgage'],
    entertainment: ['entertainment', 'fun', 'movies', 'games', 'hobbies'],
    education: ['education', 'school', 'courses', 'books', 'tuition', 'fees'],
    bills: ['bills', 'utilities', 'electricity', 'internet', 'water', 'phone bill'],
    health: ['health', 'medical', 'doctor', 'gym', 'pharmacy', 'medicine'],
    salary: ['salary', 'wages', 'pay', 'paycheck'],
    other: ['other', 'others', 'misc', 'miscellaneous'],
  };

  const found = CATEGORIES.find((category) => {
    const words = aliases[category.key.toLowerCase()] || [category.key];
    return words.some((word) => new RegExp(`\\b${word}\\b`).test(text));
  });

  return found ? found.key : null;
}

function pct(n) {
  return `${Math.round(n)}%`;
}

export function answerQuestion(question, { transactions, budget, currency }) {
  const text = normalise(question);
  const money = (v) => formatCurrency(v, currency);
  const month = currentMonthKey();
  const thisMonth = transactions.filter((t) => String(t.date).startsWith(month));
  const thisMonthExpenses = thisMonth.filter((t) => t.type === 'expense');

  if (!text) {
    return { intent: 'empty', message: 'Ask me anything about your spending.', suggestions: SUGGESTED_QUESTIONS.slice(0, 3) };
  }

  if (includesAny(text, ['hello', 'hi ', 'hey', 'good morning', 'good evening'])) {
    return {
      intent: 'greeting',
      message: `Hi! I can help you understand your money. You have ${transactions.length} transactions tracked right now. Try one of the questions below.`,
      suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
    };
  }

  if (includesAny(text, ['thank', 'thanks'])) {
    return { intent: 'thanks', message: "You're welcome! Ask me anything else about your finances.", suggestions: SUGGESTED_QUESTIONS.slice(2, 4) };
  }

  if (includesAny(text, ['help', 'what can you do', 'how do you work', 'commands', 'options'])) {
    return {
      intent: 'help',
      message:
        "Here's what I can answer:\n" +
        '• Current balance and totals\n' +
        '• Spending in any category (try "how much on transport")\n' +
        '• Your top spending category\n' +
        '• Budget status and remaining allowance\n' +
        '• Recent and largest transactions\n' +
        '• Daily and monthly averages',
      suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
    };
  }

  if (includesAny(text, ['how many transactions', 'number of transactions', 'transaction count', 'how many records'])) {
    return {
      intent: 'count',
      message: `You have ${transactions.length} transactions in total — ${transactions.filter((t) => t.type === 'income').length} income and ${transactions.filter((t) => t.type === 'expense').length} expenses.`,
      suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
    };
  }

  if (includesAny(text, ['balance', 'how much money do i have', 'how much do i have left', 'left to spend', 'how much do i owe'])) {
    const balance = totalBalance(transactions);
    const direction = balance >= 0 ? 'You have a positive balance.' : 'You are currently in the negative.';
    return {
      intent: 'balance',
      message: `${direction}\n\nCurrent balance: ${money(balance)}\nTotal income: ${money(totalIncome(transactions))}\nTotal expenses: ${money(totalExpenses(transactions))}`,
      suggestions: SUGGESTED_QUESTIONS.slice(2, 4),
    };
  }

  if (includesAny(text, ['most money', 'most in', 'highest spending', 'biggest category', 'top category', 'spending the most', 'where do i spend the most', 'largest category'])) {
    const top = topCategoryShare(transactions, month);
    if (!top) {
      return { intent: 'topCategory', message: 'You have not recorded any expenses this month yet, so I cannot find a top category.', suggestions: SUGGESTED_QUESTIONS.slice(0, 3) };
    }
    const category = getCategory(top.category);
    return {
      intent: 'topCategory',
      message: `You are spending the most money on ${category.label}.\n\n${category.label}: ${money(top.amount)} in ${monthLabel(month)}\nThat is ${pct(top.share)} of all your spending this month.`,
      suggestions: [`How much did I spend on ${category.label.toLowerCase()}?`, 'Give me a summary of my expenses.'],
    };
  }

  const categoryKey = findCategoryIn(text);
  const asksSpend = includesAny(text, ['how much', 'spent', 'spend', 'cost', 'total', 'paid', 'on ']);

  if (categoryKey && asksSpend) {
    const isIncomeQuestion = categoryKey === 'salary' && includesAny(text, ['income', 'earn', 'received', 'made']);
    const scoped = isIncomeQuestion ? thisMonth : thisMonthExpenses;
    const matching = scoped.filter((t) => t.category === categoryKey);
    const total = matching.reduce((sum, t) => sum + toNumber(t.amount), 0);
    const allTimeTotal = transactions
      .filter((t) => t.category === categoryKey)
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    if (!matching.length) {
      return {
        intent: 'categorySpend',
        message: `You have not recorded any ${getCategory(categoryKey).label.toLowerCase()} transactions in ${monthLabel(month)}.`,
        suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
      };
    }

    const category = getCategory(categoryKey);
    const daily = dailyAverageForCategory(transactions, categoryKey, month);
    return {
      intent: 'categorySpend',
      message: `You spent ${money(total)} on ${category.label} in ${monthLabel(month)}.\n\n${matching.length} transaction${matching.length === 1 ? '' : 's'} recorded\nAbout ${money(daily)} per day\nAll time on ${category.label}: ${money(allTimeTotal)}`,
      suggestions: ['What category am I spending the most on?', 'Give me a summary of my expenses.'],
    };
  }

  if (includesAny(text, ['over budget', 'budget', 'left in budget', 'remaining budget', 'exceed', 'within budget'])) {
    if (!budget?.monthlyLimit) {
      return {
        intent: 'budget',
        message: 'You have not set a monthly budget yet. Open the Budget tab to set one and I will keep an eye on it for you.',
        suggestions: ['Give me a summary of my expenses.', 'What is my current balance?'],
      };
    }
    const spent = thisMonthExpenses.reduce((sum, t) => sum + toNumber(t.amount), 0);
    const remaining = budget.monthlyLimit - spent;
    const percent = (spent / budget.monthlyLimit) * 100;
    const verdict =
      remaining < 0
        ? `You are over budget by ${money(Math.abs(remaining))}.`
        : percent >= 85
        ? `You are close to your limit — only ${money(remaining)} left.`
        : `You are within budget with ${money(remaining)} left.`;

    return {
      intent: 'budget',
      message: `${verdict}\n\nMonthly budget: ${money(budget.monthlyLimit)}\nSpent so far: ${money(spent)} (${pct(percent)})\nRemaining: ${money(remaining)}`,
      suggestions: ['What category am I spending the most on?', 'Give me a summary of my expenses.'],
    };
  }

  if (includesAny(text, ['largest expense', 'biggest expense', 'most expensive', 'largest transaction', 'biggest transaction'])) {
    const sorted = sortByDateDesc(transactions.filter((t) => t.type === 'expense')).sort(
      (a, b) => toNumber(b.amount) - toNumber(a.amount)
    );
    if (!sorted.length) {
      return { intent: 'largestExpense', message: 'You have not recorded any expenses yet.', suggestions: SUGGESTED_QUESTIONS.slice(0, 3) };
    }
    const biggest = sorted[0];
    return {
      intent: 'largestExpense',
      message: `Your largest expense is "${biggest.title}" — ${money(biggest.amount)} on ${getCategory(biggest.category).label}.\n\nThat is ${pct((biggest.amount / Math.max(totalExpenses(transactions), 1)) * 100)} of your total spending.`,
      suggestions: ['What category am I spending the most on?', 'How much did I spend on food?'],
    };
  }

  if (includesAny(text, ['recent', 'latest', 'last transaction', 'show transactions', 'list transactions'])) {
    const recent = sortByDateDesc(transactions).slice(0, 5);
    if (!recent.length) {
      return { intent: 'recent', message: 'You have not recorded any transactions yet. Add one and I can summarise it for you.', suggestions: SUGGESTED_QUESTIONS.slice(0, 3) };
    }
    const lines = recent.map(
      (t) => `${t.type === 'income' ? '+' : '-'}${money(t.amount)}  ${t.title} (${getCategory(t.category).label})`
    );
    return {
      intent: 'recent',
      message: `Here are your 5 most recent transactions:\n\n${lines.join('\n')}`,
      suggestions: ['Give me a summary of my expenses.', 'What is my current balance?'],
    };
  }

  if (includesAny(text, ['average', 'per day', 'daily', 'per month']) && includesAny(text, ['spend', 'spending', 'expense'])) {
    const daily = averageDailySpend(transactions, month);
    return {
      intent: 'average',
      message: `You are averaging ${money(daily)} per day in ${monthLabel(month)}.\n\nThat is about ${money(daily * 30)} per month.`,
      suggestions: ['What category am I spending the most on?', 'Am I over budget?'],
    };
  }

  if (
    includesAny(text, ['summary', 'overview', 'breakdown', 'summarise', 'summarize', 'report']) ||
    includesAny(text, ['total expense', 'total spent', 'total spending', 'how much have i spent', 'much did i spend'])
  ) {
    if (!transactions.length) {
      return {
        intent: 'summary',
        message: 'There is nothing to summarise yet — add your first transaction and I will break your spending down for you.',
        suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
      };
    }
    const ranked = rankedCategories(transactions, month);
    const top = ranked.slice(0, 3);
    const lines = top.length
      ? top.map((c) => `${getCategory(c.category).label}: ${money(c.amount)}`).join('\n')
      : 'No expenses recorded this month.';

    return {
      intent: 'summary',
      message: `Summary for ${monthLabel(month)}\n\nTotal income: ${money(totalIncome(transactions))}\nTotal expenses: ${money(totalExpenses(transactions))}\nBalance: ${money(totalBalance(transactions))}\n\nTop categories:\n${lines}`,
      suggestions: ['What is my current balance?', 'Am I over budget?'],
    };
  }

  if (
    (includesAny(text, ['income', 'earn', 'earned', 'received', 'salary', 'made', 'got paid']) &&
      !includesAny(text, ['expense', 'spending', 'spent'])) ||
    includesAny(text, ['how much income', 'total income'])
  ) {
    return {
      intent: 'income',
      message: `You have received ${money(totalIncome(transactions))} in total income.\n\nThis month: ${money(totalIncome(thisMonth))}\nFrom ${transactions.filter((t) => t.type === 'income').length} income transaction${transactions.filter((t) => t.type === 'income').length === 1 ? '' : 's'}`,
      suggestions: ['What is my current balance?', 'Give me a summary of my expenses.'],
    };
  }

  if (includesAny(text, ['expense', 'expenses', 'spending', 'spent', 'cost', 'costs'])) {
    return {
      intent: 'expenses',
      message: `Your total expenses are ${money(totalExpenses(transactions))} across ${transactions.filter((t) => t.type === 'expense').length} transactions.\n\nThis month alone: ${money(thisMonthExpenses.reduce((sum, t) => sum + toNumber(t.amount), 0))}`,
      suggestions: ['What category am I spending the most on?', 'Give me a summary of my expenses.'],
    };
  }

  return {
    intent: 'unknown',
    message: `I could not find an answer for "${question.trim()}".\n\nI can answer questions about your balance, spending by category, totals, budget and transactions.`,
    suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
  };
}

export const KNOWN_CATEGORY_EXAMPLES = EXPENSE_CATEGORIES.map((c) => `How much did I spend on ${c.label.toLowerCase()}?`);

export default answerQuestion;
