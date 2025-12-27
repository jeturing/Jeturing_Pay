/**
 * Jeturing Pay - Main App Component
 * Cross-platform payment app with Stripe Connect
 * 
 * Feature Flags System:
 * - Local defaults in app.json (extra.featureFlags)
 * - Remote override via API (/feature-flags/)
 * - Environment variables at build time
 */

import React from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { StripeAccountProvider } from './src/contexts/StripeAccountContext';
import { FeatureFlagsProvider } from './src/components/FeatureFlagsProvider';
import AppNavigator from './src/navigation/AppNavigator';

// Load from environment or use production key
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PK || 'pk_live_jeturing';

// Custom loading component for feature flags initialization
const FeatureFlagsLoader = () => (
  <View style={styles.loaderContainer}>
    <Text style={styles.loaderText}>Cargando configuración...</Text>
  </View>
);

export default function App() {
  return (
    <FeatureFlagsProvider
      loadingComponent={<FeatureFlagsLoader />}
      onError={(error) => {
        // Log error but continue with local defaults
        console.warn('Feature flags error:', error);
      }}
    >
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <StripeAccountProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" />
            <AppNavigator />
          </NavigationContainer>
        </StripeAccountProvider>
      </StripeProvider>
    </FeatureFlagsProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loaderText: {
    fontSize: 16,
    color: '#6c757d',
  },
});
