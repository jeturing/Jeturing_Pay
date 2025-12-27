/**
 * Feature Flags Provider
 * 
 * Wrap your app with this provider to initialize feature flags
 * and provide maintenance mode handling
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import featureFlags, { FeatureFlags } from '../services/featureFlags';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeatureFlagsContextValue {
  flags: FeatureFlags;
  loading: boolean;
  initialized: boolean;
  refresh: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  apiKey?: string;
  showMaintenanceScreen?: boolean;
  loadingComponent?: ReactNode;
  maintenanceComponent?: ReactNode;
}

export function FeatureFlagsProvider({
  children,
  apiKey,
  showMaintenanceScreen = true,
  loadingComponent,
  maintenanceComponent,
}: FeatureFlagsProviderProps) {
  const [flags, setFlags] = useState<FeatureFlags>(() => featureFlags.getFlags());
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Load API key from storage if not provided
        let key = apiKey;
        if (!key) {
          key = (await AsyncStorage.getItem('@jeturing_api_key')) || undefined;
        }

        await featureFlags.initialize(key);
        setFlags(featureFlags.getFlags());
        setInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize feature flags:', error);
        setInitialized(true); // Continue with defaults
      } finally {
        setLoading(false);
      }
    };

    init();

    // Subscribe to flag updates
    const unsubscribe = featureFlags.subscribe(setFlags);
    return unsubscribe;
  }, [apiKey]);

  const refresh = async () => {
    setLoading(true);
    try {
      await featureFlags.refresh();
      setFlags(featureFlags.getFlags());
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while initializing
  if (loading && !initialized) {
    return (
      loadingComponent || (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      )
    );
  }

  // Show maintenance screen if enabled
  if (showMaintenanceScreen && flags.maintenanceMode) {
    return (
      maintenanceComponent || (
        <View style={styles.container}>
          <Text style={styles.maintenanceTitle}>🛠️ Mantenimiento</Text>
          <Text style={styles.maintenanceText}>
            {flags.maintenanceMessage || 'La aplicación está en mantenimiento. Por favor, intenta más tarde.'}
          </Text>
        </View>
      )
    );
  }

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, initialized, refresh }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlagsContext() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlagsContext must be used within FeatureFlagsProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  maintenanceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  maintenanceText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default FeatureFlagsProvider;
