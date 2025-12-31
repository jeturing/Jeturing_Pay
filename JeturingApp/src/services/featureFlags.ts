/**
 * Feature Flags Service
 * 
 * Provides feature flag management with:
 * - Local env defaults (compile-time via app.json extra)
 * - Remote API overrides (runtime via /feature-flags endpoint)
 * - AsyncStorage caching for offline support
 * - Real-time updates via polling or on-demand refresh
 * 
 * Priority: Remote API > Local Storage Cache > Env Defaults
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const STORAGE_KEY = '@jeturing_feature_flags';
const API_BASE_URL = 'https://api-001.sajet.us';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ===========================
// Feature Flag Definitions
// ===========================

export interface FeatureFlags {
  // Payment Features
  enableTapToPay: boolean;
  enablePaymentLinks: boolean;
  enableQrPayments: boolean;
  enableRecurringPayments: boolean;
  enableTipping: boolean;
  
  // Terminal Features
  enableTerminalReaders: boolean;
  enableSimulatedReaders: boolean;
  
  // Customer Features
  enableCustomerLookup: boolean;
  enableCustomerInvoices: boolean;
  
  // UI Features
  enableDarkMode: boolean;
  enableAnimations: boolean;
  enableBiometricAuth: boolean;
  
  // Analytics & Monitoring
  enableSentry: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  
  // Developer Features
  enableDebugMode: boolean;
  enableMockData: boolean;
  enableApiLogging: boolean;
  
  // Onboarding
  enableSelfOnboarding: boolean;
  enableExpressOnboarding: boolean;
  
  // MPOS Features
  enableMposTransactions: boolean;
  enableMposRefunds: boolean;
  
  // API Configuration
  apiVersion: string;
  minAppVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

// ===========================
// Default Values (from env or hardcoded)
// ===========================

const getEnvDefaults = (): FeatureFlags => {
  const extra = Constants.expoConfig?.extra?.featureFlags || {};
  
  // Helper to read from process.env with fallback to extra config
  const getEnvFlag = (envKey: string, extraKey: keyof typeof extra, defaultValue: boolean | string): any => {
    // Check process.env first (EXPO_PUBLIC_FF_* variables)
    const envValue = process.env[envKey];
    if (envValue !== undefined) {
      // Convert string to boolean for flags
      if (typeof defaultValue === 'boolean') {
        return envValue === 'true' || envValue === '1';
      }
      return envValue;
    }
    // Fallback to app.json extra config
    return extra[extraKey] ?? defaultValue;
  };
  
  return {
    // Payment Features
    enableTapToPay: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_TAP_TO_PAY', 'enableTapToPay', true),
    enablePaymentLinks: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_PAYMENT_LINKS', 'enablePaymentLinks', true),
    enableQrPayments: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_QR_PAYMENTS', 'enableQrPayments', true),
    enableRecurringPayments: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_RECURRING_PAYMENTS', 'enableRecurringPayments', false),
    enableTipping: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_TIPPING', 'enableTipping', true),
    
    // Terminal Features
    enableTerminalReaders: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_TERMINAL_READERS', 'enableTerminalReaders', true),
    enableSimulatedReaders: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_SIMULATED_READERS', 'enableSimulatedReaders', __DEV__),
    
    // Customer Features
    enableCustomerLookup: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_CUSTOMER_LOOKUP', 'enableCustomerLookup', true),
    enableCustomerInvoices: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_CUSTOMER_INVOICES', 'enableCustomerInvoices', true),
    
    // UI Features
    enableDarkMode: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_DARK_MODE', 'enableDarkMode', false),
    enableAnimations: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_ANIMATIONS', 'enableAnimations', true),
    enableBiometricAuth: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_BIOMETRIC_AUTH', 'enableBiometricAuth', true),
    
    // Analytics & Monitoring
    enableSentry: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_SENTRY', 'enableSentry', !__DEV__),
    enableAnalytics: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_ANALYTICS', 'enableAnalytics', !__DEV__),
    enableCrashReporting: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_CRASH_REPORTING', 'enableCrashReporting', !__DEV__),
    
    // Developer Features
    enableDebugMode: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_DEBUG_MODE', 'enableDebugMode', __DEV__),
    enableMockData: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_MOCK_DATA', 'enableMockData', false),
    enableApiLogging: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_API_LOGGING', 'enableApiLogging', __DEV__),
    
    // Onboarding
    enableSelfOnboarding: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_SELF_ONBOARDING', 'enableSelfOnboarding', true),
    enableExpressOnboarding: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_EXPRESS_ONBOARDING', 'enableExpressOnboarding', true),
    
    // MPOS Features
    enableMposTransactions: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_MPOS_TRANSACTIONS', 'enableMposTransactions', true),
    enableMposRefunds: getEnvFlag('EXPO_PUBLIC_FF_ENABLE_MPOS_REFUNDS', 'enableMposRefunds', true),
    
    // API Configuration
    apiVersion: getEnvFlag('EXPO_PUBLIC_FF_API_VERSION', 'apiVersion', '2.5.0'),
    minAppVersion: getEnvFlag('EXPO_PUBLIC_FF_MIN_APP_VERSION', 'minAppVersion', '1.0.0'),
    maintenanceMode: getEnvFlag('EXPO_PUBLIC_FF_MAINTENANCE_MODE', 'maintenanceMode', false),
    maintenanceMessage: getEnvFlag('EXPO_PUBLIC_FF_MAINTENANCE_MESSAGE', 'maintenanceMessage', ''),
  };
};

// ===========================
// Feature Flags Manager
// ===========================

class FeatureFlagsManager {
  private flags: FeatureFlags;
  private lastFetchTime: number = 0;
  private listeners: Set<(flags: FeatureFlags) => void> = new Set();
  private apiKey: string | null = null;

  constructor() {
    this.flags = getEnvDefaults();
  }

  /**
   * Initialize flags - load from cache, then fetch remote
   */
  async initialize(apiKey?: string): Promise<FeatureFlags> {
    if (apiKey) {
      this.apiKey = apiKey;
    }

    // Load cached flags first (for fast startup)
    await this.loadFromCache();

    // Fetch remote flags in background
    this.fetchRemoteFlags().catch(console.warn);

    return this.flags;
  }

  /**
   * Get current flags
   */
  getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Check a single flag
   */
  isEnabled(flag: keyof FeatureFlags): boolean {
    const value = this.flags[flag];
    return typeof value === 'boolean' ? value : false;
  }

  /**
   * Get a flag value (for non-boolean flags)
   */
  getValue<K extends keyof FeatureFlags>(flag: K): FeatureFlags[K] {
    return this.flags[flag];
  }

  /**
   * Override a flag locally (for testing)
   */
  async setLocalOverride(flag: keyof FeatureFlags, value: any): Promise<void> {
    (this.flags as any)[flag] = value;
    await this.saveToCache();
    this.notifyListeners();
  }

  /**
   * Clear all local overrides
   */
  async clearOverrides(): Promise<void> {
    this.flags = getEnvDefaults();
    await AsyncStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }

  /**
   * Subscribe to flag changes
   */
  subscribe(callback: (flags: FeatureFlags) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Force refresh from remote
   */
  async refresh(): Promise<FeatureFlags> {
    await this.fetchRemoteFlags();
    return this.flags;
  }

  // ===========================
  // Private Methods
  // ===========================

  private async loadFromCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { flags, timestamp } = JSON.parse(cached);
        // Merge with defaults (in case new flags were added)
        this.flags = { ...getEnvDefaults(), ...flags };
        this.lastFetchTime = timestamp;
      }
    } catch (error) {
      console.warn('Failed to load cached feature flags:', error);
    }
  }

  private async saveToCache(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          flags: this.flags,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Failed to cache feature flags:', error);
    }
  }

  private async fetchRemoteFlags(): Promise<void> {
    // Skip if recently fetched
    if (Date.now() - this.lastFetchTime < CACHE_TTL_MS) {
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await fetch(`${API_BASE_URL}/feature-flags`, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const remoteFlags = await response.json();
        // Merge remote flags with defaults
        this.flags = { ...getEnvDefaults(), ...remoteFlags };
        this.lastFetchTime = Date.now();
        await this.saveToCache();
        this.notifyListeners();
      }
    } catch (error) {
      console.warn('Failed to fetch remote feature flags:', error);
      // Continue with cached/default flags
    }
  }

  private notifyListeners(): void {
    const currentFlags = this.getFlags();
    this.listeners.forEach((callback) => {
      try {
        callback(currentFlags);
      } catch (error) {
        console.warn('Feature flag listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagsManager();

// Export types and utilities
export type FeatureFlagKey = keyof FeatureFlags;

export const isFeatureEnabled = (flag: FeatureFlagKey): boolean => {
  return featureFlags.isEnabled(flag);
};

export const getFeatureValue = <K extends FeatureFlagKey>(
  flag: K
): FeatureFlags[K] => {
  return featureFlags.getValue(flag);
};

export default featureFlags;
