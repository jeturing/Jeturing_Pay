/**
 * Jeturing Pay - Main App Component
 * Cross-platform payment app with Stripe Connect
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { StripeAccountProvider } from './src/contexts/StripeAccountContext';
import AppNavigator from './src/navigation/AppNavigator';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_jeturing'; // Replace with actual key

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <StripeAccountProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </NavigationContainer>
      </StripeAccountProvider>
    </StripeProvider>
  );
}
