# Smart Expense Tracker Assistant

A React Native (Expo) mobile app that helps you record income and expenses, organise
transactions into categories, monitor spending, set a monthly budget and ask a built-in
assistant questions about your finances.

Built as a final React Native project demonstrating components, hooks, state management,
navigation, forms, lists, AsyncStorage persistence, calculations and a clean mobile UI.

---

## Features

| Feature | Details |
| --- | --- |
| Dashboard | Current balance, total income/expenses, recent transactions, spending by category, budget alerts |
| Add / Edit transaction | Title, amount, type (income / expense), category, date, optional notes |
| Transaction history | Search by title/category/amount, filter by category and type, grouped by day |
| Transaction details | Full record view with edit and delete actions |
| Categories | 10 categories (Food, Transport, Shopping, Rent, Entertainment, Education, Bills, Health, Salary, Other) with icons and colours |
| Financial summary | Totals, balance, transaction count, highest spending category, category breakdown charts, month-vs-month comparison |
| Smart Assistant | Answers questions like *"How much did I spend on food?"*, *"Am I over budget?"*, *"What is my current balance?"* — computed locally from stored data (no paid API needed) |
| Budget management | Monthly limit, amount spent, remaining, progress bar, warnings at 85% and when exceeded |
| Data storage | Everything persisted with AsyncStorage — data survives app restarts |
| Extras | Sample data loader, multi-currency formatting (USD/EUR/GBP/INR/JPY/AUD/CAD), hide-amounts toggle |

## Screens

1. **Welcome / Onboarding** — enter your name, pick a base currency, get started
2. **Home (Dashboard)** — balance hero, totals, recent activity, category breakdown
3. **Add Transaction** — form with type toggle, category picker and date picker (also used for editing)
4. **Activity (Transaction History)** — searchable, filterable, grouped list
5. **Transaction Details** — full record with edit / delete
6. **Budget** — set a monthly limit, track progress, view category share
7. **Financial Summary** — totals, charts, highest category, month comparison
8. **Smart Assistant** — chat-style Q&A computed from your data
9. **Profile & Settings** — profile name, currency, data management, sample data, sign out

## Tech Stack

- **Expo SDK 57** (React Native 0.86, React 19)
- **React Navigation** — native stack + bottom tabs
- **@react-native-async-storage/async-storage** — persistence
- **@react-native-community/datetimepicker** — date selection
- **@expo/vector-icons** — iconography
- **react-native-svg** — bundled chart views
- **expo-linear-gradient** — onboarding background

## Project Structure

```
├── App.js                     # Root: providers + navigation gate
├── src/
│   ├── components/            # Reusable UI (Button, Input, Card, TransactionCard,
│   │                          #   SummaryCard, CategoryCard, SpendingChart, ...)
│   ├── constants/             # Categories, filter options
│   ├── context/               # AppContext — global state + AsyncStorage persistence
│   ├── navigation/            # RootNavigator — stack + tab setup
│   ├── screens/               # All screens (9)
│   ├── theme/                 # Colours, spacing, typography, shadows
│   └── utils/                 # Formatting, calculations, assistant engine, storage, sample data
```

## Getting Started

Requirements: [Node.js](https://nodejs.org/) 18+ and the **Expo Go** app on your phone
(or an Android/iOS simulator).

```bash
npm install        # or: npx expo install --fix
npx expo start     # then scan the QR code with Expo Go
```

Useful commands:

```bash
npx expo start            # start the dev server
npm run android           # open on Android (Expo Go / emulator)
npm run ios               # open on iOS (Expo Go / simulator)
npx expo lint             # lint the codebase
npx expo-doctor           # verify dependencies and native config
npx expo export --platform android   # build a production JS bundle
```

## How the Smart Assistant works

The assistant (`src/utils/assistant.js`) matches a normalised version of the user's
question against predefined intents (balance, category spend, top category, budget,
summary, recent/largest transactions, income, expenses…). Each intent computes its
answer live from the stored transaction data using the calculation helpers in
`src/utils/calculations.js`. No network or paid AI API is required.

## Data & Persistence

- Transactions, the monthly budget and app settings are stored in AsyncStorage
  under the `@smart_expense/` namespace (`src/utils/storage.js`).
- All state flows through one place — `src/context/AppContext.js` — which reloads
  data on launch and writes through on every change.
- Use **Settings → Load sample data** to explore the app with 12 example transactions.

## Testing / Verification

The pure logic modules (calculations and the assistant) are framework-free and were
verified with a Babel-powered Node harness against 9+ natural-language questions and
budget edge cases. Lint passes with `npx expo lint`, `expo-doctor` reports
`21/21 checks passed`, and the app exports a production bundle successfully.