import React from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import { STORAGE_KEYS } from '../src/utils/storage';
import createSampleTransactions from '../src/utils/sampleData';

async function seedOnboardedUser() {
  await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(createSampleTransactions()));
  await AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify({ monthlyLimit: 500 }));
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ hasOnboarded: true, currency: 'USD' }));
  await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({ name: 'Alex Johnson', joinedAt: 1 }));
}

it('onboards a new user and lands on the dashboard', async () => {
  const user = userEvent.setup();
  await render(<App />);
  const nameInput = await screen.findByPlaceholderText('e.g. Alex Johnson');
  await user.type(nameInput, 'Alex');
  await user.press(screen.getByText('Get Started'));
  expect(await screen.findByText(/Hi, Alex/)).toBeTruthy();
});

it('renders the dashboard with real data without crashing', async () => {
  await seedOnboardedUser();
  await render(<App />);
  expect(await screen.findAllByText(/Current balance/)).toBeTruthy();
  expect(await screen.findAllByText(/Spending by category/)).toBeTruthy();
});

it('opens the add screen from the home Add button', async () => {
  const user = userEvent.setup();
  await seedOnboardedUser();
  await render(<App />);
  await screen.findByText('Spending by category');

  await user.press(screen.getAllByText('Add')[0]);
  expect(await screen.findByText('in USD')).toBeTruthy();
  expect((await screen.findAllByText('Add transaction')).length).toBeGreaterThan(0);
});

it('navigates through every bottom tab without crashing', async () => {
  const user = userEvent.setup();
  await seedOnboardedUser();
  await render(<App />);
  await screen.findByText('Spending by category');

  await user.press(screen.getAllByText('Activity')[0]);
  expect(await screen.findByText('Monthly Salary')).toBeTruthy();

  await user.press(screen.getAllByText('Budget')[0]);
  expect(await screen.findByText(/Monthly spending limit/)).toBeTruthy();

  await user.press(screen.getAllByText('Assistant')[0]);
  expect((await screen.findAllByText(/Smart Assistant/)).length).toBeGreaterThan(0);
});