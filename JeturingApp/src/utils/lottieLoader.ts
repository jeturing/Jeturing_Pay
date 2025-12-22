/**
 * Lottie Animation Loader
 * Dynamically loads Lottie JSON animations from the animations folder
 */

export type AnimationName = 'onboarding' | 'payment-success' | 'loading-spin' | 'error-shake';

/**
 * Load a Lottie animation by name
 * @param name - Name of the animation file (without .json extension)
 * @returns The Lottie animation JSON object
 */
export const loadAnimation = (name: AnimationName) => {
  const animations = {
    'onboarding': require('../../animations/onboarding.json'),
    'payment-success': require('../../animations/payment-success.json'),
    'loading-spin': require('../../animations/loading-spin.json'),
    'error-shake': require('../../animations/error-shake.json'),
  };

  return animations[name];
};

/**
 * Preload all animations for better performance
 */
export const preloadAnimations = () => {
  const names: AnimationName[] = ['onboarding', 'payment-success', 'loading-spin', 'error-shake'];
  return names.map(name => ({
    name,
    source: loadAnimation(name)
  }));
};
