/**
 * FeatureGate Component
 * 
 * Conditionally render children based on feature flag state
 * 
 * Usage:
 *   <FeatureGate flag="enableTapToPay">
 *     <TapToPayButton />
 *   </FeatureGate>
 * 
 *   <FeatureGate flag="enableTapToPay" fallback={<DisabledMessage />}>
 *     <TapToPayButton />
 *   </FeatureGate>
 */

import React, { ReactNode } from 'react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { FeatureFlagKey } from '../services/featureFlags';

interface FeatureGateProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
  /** Invert the condition (show when flag is OFF) */
  not?: boolean;
}

export function FeatureGate({
  flag,
  children,
  fallback = null,
  not = false,
}: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);
  const shouldShow = not ? !isEnabled : isEnabled;

  return <>{shouldShow ? children : fallback}</>;
}

/**
 * Higher-order component for feature-gating
 * 
 * Usage:
 *   const TapToPayScreen = withFeatureGate(TapToPayScreenComponent, 'enableTapToPay');
 */
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  flag: FeatureFlagKey,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureGatedComponent(props: P) {
    const isEnabled = useFeatureFlag(flag);

    if (!isEnabled) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <Component {...props} />;
  };
}

export default FeatureGate;
