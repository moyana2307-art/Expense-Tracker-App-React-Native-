import { toISODate } from './format';

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return toISODate(date);
}

export function createSampleTransactions() {
  const now = Date.now();
  return [
    {
      id: 'sample_1',
      title: 'Monthly Salary',
      amount: 2400,
      type: 'income',
      category: 'Salary',
      date: daysAgo(1),
      note: 'Net pay for this month',
      createdAt: now,
    },
    {
      id: 'sample_2',
      title: 'Apartment Rent',
      amount: 850,
      type: 'expense',
      category: 'Rent',
      date: daysAgo(2),
      note: 'Monthly rent',
      createdAt: now - 1,
    },
    {
      id: 'sample_3',
      title: 'Grocery Shopping',
      amount: 96.4,
      type: 'expense',
      category: 'Food',
      date: daysAgo(2),
      note: 'Weekly groceries',
      createdAt: now - 2,
    },
    {
      id: 'sample_4',
      title: 'Bus Pass',
      amount: 45,
      type: 'expense',
      category: 'Transport',
      date: daysAgo(4),
      note: '',
      createdAt: now - 3,
    },
    {
      id: 'sample_5',
      title: 'Coffee with Friends',
      amount: 18.5,
      type: 'expense',
      category: 'Food',
      date: daysAgo(5),
      note: '',
      createdAt: now - 4,
    },
    {
      id: 'sample_6',
      title: 'Electricity Bill',
      amount: 72.9,
      type: 'expense',
      category: 'Bills',
      date: daysAgo(7),
      note: 'Auto payment',
      createdAt: now - 5,
    },
    {
      id: 'sample_7',
      title: 'Movie Night',
      amount: 34,
      type: 'expense',
      category: 'Entertainment',
      date: daysAgo(9),
      note: 'Two tickets and snacks',
      createdAt: now - 6,
    },
    {
      id: 'sample_8',
      title: 'Online Course',
      amount: 49,
      type: 'expense',
      category: 'Education',
      date: daysAgo(11),
      note: '',
      createdAt: now - 7,
    },
    {
      id: 'sample_9',
      title: 'Freelance Project',
      amount: 320,
      type: 'income',
      category: 'Other',
      date: daysAgo(13),
      note: 'Side project payment',
      createdAt: now - 8,
    },
    {
      id: 'sample_10',
      title: 'Gym Membership',
      amount: 39,
      type: 'expense',
      category: 'Health',
      date: daysAgo(15),
      note: '',
      createdAt: now - 9,
    },
    {
      id: 'sample_11',
      title: 'Textbook Purchase',
      amount: 62.25,
      type: 'expense',
      category: 'Education',
      date: daysAgo(18),
      note: 'Required reading',
      createdAt: now - 10,
    },
    {
      id: 'sample_12',
      title: 'Pizza Delivery',
      amount: 27.8,
      type: 'expense',
      category: 'Food',
      date: daysAgo(21),
      note: '',
      createdAt: now - 11,
    },
  ];
}

export default createSampleTransactions;
