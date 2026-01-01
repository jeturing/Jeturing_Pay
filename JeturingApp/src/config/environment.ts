/**
 * Environment Configuration Service
 * Manages environment-specific settings for development and production
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ============== ENVIRONMENT TYPES ==============

export type Environment = 'development' | 'production';

export interface EnvironmentConfig {
  environment: Environment;
  apiUrl: string;
  apiKey: string;
  stripePublishableKey: string;
  jeturingFeePercent: number;
  stripeAppId: string;
  stripeAppName: string;
  isDebug: boolean;
}

// ============== ENVIRONMENT CONFIGURATIONS ==============

const PRODUCTION_CONFIG: EnvironmentConfig = {
  environment: 'production',
  apiUrl: 'https://api-001.sajet.us',
  apiKey: '*963.Abcd',
  stripePublishableKey: 'pk_live_br1xTAFeGiH1rVEqzjVsG3MI002U1yZBfA',
  jeturingFeePercent: 1,
  stripeAppId: 'com.jeturing.pay',
  stripeAppName: 'Jeturing Pay',
  isDebug: false,
};

const DEVELOPMENT_CONFIG: EnvironmentConfig = {
  environment: 'development',
  apiUrl: 'https://api-001.sajet.us', // Same API, different Stripe keys
  apiKey: '*963.Abcd',
  stripePublishableKey: 'pk_test_51Q30QSBQV1U09B3DAiP91aohNvqLAkugPApXun5mpjbmEhFU2JR6emRRzzxftxX6v7CTkjjub5Md1RzDcyyYHbXJ00D84mYeCh',
  jeturingFeePercent: 1,
  stripeAppId: 'com.jeturing.pay.dev',
  stripeAppName: 'Jeturing Pay (Dev)',
  isDebug: true,
};

// ============== ENVIRONMENT DETECTION ==============

/**
 * Detect current environment from Expo config or env variables
 */
const detectEnvironment = (): Environment => {
  // Check Expo config first
  const expoEnv = Constants.expoConfig?.extra?.environment;
  if (expoEnv === 'development' || expoEnv === 'production') {
    return expoEnv;
  }

  // Check process.env
  const envVar = process.env.EXPO_PUBLIC_ENVIRONMENT;
  if (envVar === 'development' || envVar === 'production') {
    return envVar;
  }

  // Default based on __DEV__
  if (__DEV__) {
    return 'development';
  }

  return 'production';
};

/**
 * Get configuration for current environment
 */
export const getConfig = (): EnvironmentConfig => {
  const environment = detectEnvironment();
  
  // Override with env variables if present
  const baseConfig = environment === 'production' ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;
  
  return {
    ...baseConfig,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || baseConfig.apiUrl,
    apiKey: process.env.EXPO_PUBLIC_API_KEY || baseConfig.apiKey,
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || baseConfig.stripePublishableKey,
    jeturingFeePercent: parseInt(process.env.EXPO_PUBLIC_JETURING_FEE_PERCENT || String(baseConfig.jeturingFeePercent), 10),
    isDebug: process.env.EXPO_PUBLIC_DEBUG === 'true' || baseConfig.isDebug,
  };
};

// ============== SINGLETON CONFIG ==============

let _config: EnvironmentConfig | null = null;

/**
 * Get cached configuration
 */
export const config = (): EnvironmentConfig => {
  if (!_config) {
    _config = getConfig();
    
    if (_config.isDebug) {
      console.log('🔧 Environment Configuration:');
      console.log(`   Environment: ${_config.environment}`);
      console.log(`   API URL: ${_config.apiUrl}`);
      console.log(`   Stripe Mode: ${_config.stripePublishableKey.startsWith('pk_live') ? 'LIVE' : 'TEST'}`);
    }
  }
  return _config;
};

// ============== HELPER FUNCTIONS ==============

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return config().environment === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return config().environment === 'production';
};

/**
 * Check if using Stripe test mode
 */
export const isStripeTestMode = (): boolean => {
  return config().stripePublishableKey.startsWith('pk_test');
};

/**
 * Check if using Stripe live mode
 */
export const isStripeLiveMode = (): boolean => {
  return config().stripePublishableKey.startsWith('pk_live');
};

/**
 * Get API URL
 */
export const getApiUrl = (): string => {
  return config().apiUrl;
};

/**
 * Get API Key
 */
export const getApiKey = (): string => {
  return config().apiKey;
};

/**
 * Get Stripe Publishable Key
 */
export const getStripePublishableKey = (): string => {
  return config().stripePublishableKey;
};

/**
 * Get environment badge for UI display
 */
export const getEnvironmentBadge = (): { text: string; color: string } => {
  if (isProduction() && isStripeLiveMode()) {
    return { text: 'PRODUCCIÓN', color: '#10b981' }; // Green
  }
  if (isProduction() && isStripeTestMode()) {
    return { text: 'PRODUCCIÓN (Test)', color: '#f59e0b' }; // Amber
  }
  return { text: 'DESARROLLO', color: '#6366f1' }; // Indigo
};

// ============== EXPORTS ==============

export default {
  config,
  getConfig,
  isDevelopment,
  isProduction,
  isStripeTestMode,
  isStripeLiveMode,
  getApiUrl,
  getApiKey,
  getStripePublishableKey,
  getEnvironmentBadge,
};
