/**
 * Animation Provider Component
 * Wrapper component for displaying Lottie animations dynamically
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { AnimationName, loadAnimation } from '@utils/lottieLoader';

interface AnimationProviderProps {
  /** Name of the animation to display */
  name: AnimationName;
  /** Whether the animation should be visible */
  visible: boolean;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Whether to autoplay the animation */
  autoPlay?: boolean;
  /** Custom style for the animation container */
  style?: StyleProp<ViewStyle>;
  /** Animation speed multiplier */
  speed?: number;
  /** Callback when animation completes */
  onAnimationFinish?: () => void;
}

/**
 * AnimationProvider - Dynamically loads and displays Lottie animations
 * 
 * @example
 * ```tsx
 * <AnimationProvider
 *   name="payment-success"
 *   visible={isSuccess}
 *   loop={false}
 *   onAnimationFinish={() => navigate('Home')}
 * />
 * ```
 */
export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  name,
  visible,
  loop = true,
  autoPlay = true,
  style,
  speed = 1,
  onAnimationFinish,
}) => {
  if (!visible) return null;

  return (
    <LottieView
      source={loadAnimation(name)}
      style={[{ width: 200, height: 200 }, style]}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      onAnimationFinish={onAnimationFinish}
      resizeMode="contain"
    />
  );
};

export default AnimationProvider;
