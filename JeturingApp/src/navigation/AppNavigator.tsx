/**
 * App Navigator
 * Main navigation structure with Auth and App stacks
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStripeAccount } from '../contexts/StripeAccountContext';

// Auth Stack Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import ConnectAccountScreen from '../screens/ConnectAccountScreen';
import LoginScreen from '../screens/LoginScreen';

// App Stack Screens
import DashboardScreen from '../screens/DashboardScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentLinkScreen from '../screens/PaymentLinkScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import CustomerRegistrationScreen from '../screens/CustomerRegistrationScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Fase 1 - Critical Payment Flow Screens
import NumpadScreen from '../screens/NumpadScreen';
import NewPaymentScreen from '../screens/NewPaymentScreen';
import PaymentModeScreen from '../screens/PaymentModeScreen';
import CancelPaymentScreen from '../screens/CancelPaymentScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => null, // Add icon component
        }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          tabBarLabel: 'Cobrar',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
      <Tab.Screen
        name="History"
        component={TransactionHistoryScreen}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Configuración',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { account, isLoading } = useStripeAccount();

  if (isLoading) {
    return null; // Show loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!account ? (
        // Auth Stack
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="ConnectAccount" component={ConnectAccountScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        // App Stack
        <>
          <Stack.Screen name="AppTabs" component={AppTabs} />
          <Stack.Screen name="NewPayment" component={NewPaymentScreen} />
          <Stack.Screen name="Numpad" component={NumpadScreen} />
          <Stack.Screen name="PaymentMode" component={PaymentModeScreen} />
          <Stack.Screen name="CancelPayment" component={CancelPaymentScreen} />
          <Stack.Screen name="PaymentLink" component={PaymentLinkScreen} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen name="CustomerRegistration" component={CustomerRegistrationScreen} />
          <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
