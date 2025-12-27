/**
 * useFeatureFlag Hook
 * 
 * React hook for consuming feature flags with automatic re-renders on changes
 * 
 * Usage:
 *   const isTapToPayEnabled = useFeatureFlag('enableTapToPay');
 *   const { isEnabled, value, refresh } = useFeatureFlags();
 */

import { useState, useEffect, useCallback } from 'react';
import featureFlags, {
  FeatureFlags,
  FeatureFlagKey,
  isFeatureEnabled,
  getFeatureValue,
} from '../services/featureFlags';

/**
 * Hook to check a single feature flag
 */
export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  const [enabled, setEnabled] = useState(() => isFeatureEnabled(flag));

  useEffect(() => {
    const unsubscribe = featureFlags.subscribe((flags) => {
      const value = flags[flag];
      setEnabled(typeof value === 'boolean' ? value : false);
    });

    return unsubscribe;
  }, [flag]);

  return enabled;
}

/**
 * Hook to get a feature flag value (for non-boolean flags)
 */
export function useFeatureValue<K extends FeatureFlagKey>(
  flag: K
): FeatureFlags[K] {
  const [value, setValue] = useState(() => getFeatureValue(flag));

  useEffect(() => {
    const unsubscribe = featureFlags.subscribe((flags) => {
      setValue(flags[flag]);
    });

    return unsubscribe;
  }, [flag]);

  return value;
}

/**
 * Hook to get all feature flags with utilities
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(() => featureFlags.getFlags());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = featureFlags.subscribe(setFlags);
    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await featureFlags.refresh();
    } finally {
      setLoading(false);
    }
  }, []);

  const isEnabled = useCallback(
    (flag: FeatureFlagKey): boolean => {
      const value = flags[flag];
      return typeof value === 'boolean' ? value : false;
    },
    [flags]
  );

  const getValue = useCallback(
    <K extends FeatureFlagKey>(flag: K): FeatureFlags[K] => flags[flag],
    [flags]
  );

  const setOverride = useCallback(
    async (flag: FeatureFlagKey, value: any) => {
      await featureFlags.setLocalOverride(flag, value);
    },
    []
  );

  const clearOverrides = useCallback(async () => {
    await featureFlags.clearOverrides();
  }, []);

  return {
    flags,
    loading,
    refresh,
    isEnabled,
    getValue,
    setOverride,
    clearOverrides,
  };
}

/**
 * Hook for maintenance mode check
 */
export function useMaintenanceMode() {
  const maintenanceMode = useFeatureFlag('maintenanceMode');
  const maintenanceMessage = useFeatureValue('maintenanceMessage');

  return {
    isInMaintenance: maintenanceMode,
    message: maintenanceMessage,
  };
}

/**
 * Hook for debug/developer features
 */
export function useDebugMode() {
  const debugMode = useFeatureFlag('enableDebugMode');
  const mockData = useFeatureFlag('enableMockData');
  const apiLogging = useFeatureFlag('enableApiLogging');

  return {
    isDebugMode: debugMode,
    useMockData: mockData,
    logApiCalls: apiLogging,
  };
}

export default useFeatureFlag;
