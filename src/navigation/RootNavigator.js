import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

import WelcomeScreen from '../screens/WelcomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import TransactionDetailsScreen from '../screens/TransactionDetailsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import AssistantScreen from '../screens/AssistantScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FinancialSummaryScreen from '../screens/FinancialSummaryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', component: DashboardScreen, label: 'Home', icon: 'home', active: 'home' },
  { name: 'Activity', component: TransactionHistoryScreen, label: 'Activity', icon: 'swap-horizontal', active: 'swap-horizontal' },
  { name: 'Budget', component: BudgetScreen, label: 'Budget', icon: 'wallet', active: 'wallet' },
  { name: 'Assistant', component: AssistantScreen, label: 'Assistant', icon: 'chatbubble-ellipses', active: 'chatbubble-ellipses' },
];

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? tab.active : `${tab.icon}-outline`} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { profile, settings } = useApp();
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      primary: colors.primary,
      text: colors.text,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!settings.hasOnboarded || !profile ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="FinancialSummary" component={FinancialSummaryScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderRadius: 22,
    marginHorizontal: 12,
    marginBottom: 10,
    height: 66,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    shadowColor: '#0F172A',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});

export default RootNavigator;