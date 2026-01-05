/**
 * Animation Presets for Framer Motion
 * Defines standard animation configurations for different speed levels
 */

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type EasingType = 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'anticipate' | 'backIn' | 'backOut' | 'backInOut' | 'circIn' | 'circOut' | 'circInOut';

export interface AnimationConfig {
  speed: AnimationSpeed;
  customDuration?: number; // milliseconds
  easing?: EasingType;
  disableAnimations?: boolean; // For accessibility
}

/**
 * Animation duration presets (in milliseconds)
 */
export const ANIMATION_DURATIONS: Record<AnimationSpeed, number> = {
  slow: 400,
  normal: 250,
  fast: 150,
};

/**
 * Easing function mappings for Framer Motion
 */
export const EASING_FUNCTIONS: Record<EasingType, number[] | string> = {
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  linear: 'linear',
  anticipate: 'anticipate',
  backIn: 'backIn',
  backOut: 'backOut',
  backInOut: 'backInOut',
  circIn: 'circIn',
  circOut: 'circOut',
  circInOut: 'circInOut',
};

/**
 * Default animation presets for different speeds
 */
export const ANIMATION_PRESETS: Record<AnimationSpeed, AnimationConfig> = {
  slow: {
    speed: 'slow',
    customDuration: ANIMATION_DURATIONS.slow,
    easing: 'ease-in-out',
  },
  normal: {
    speed: 'normal',
    customDuration: ANIMATION_DURATIONS.normal,
    easing: 'ease-in-out',
  },
  fast: {
    speed: 'fast',
    customDuration: ANIMATION_DURATIONS.fast,
    easing: 'ease-in-out',
  },
};

/**
 * Fade animation configuration
 * Gradually changes opacity from 0 to 1
 */
export function createFadeAnimation(config: AnimationConfig) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: config.customDuration || ANIMATION_DURATIONS[config.speed],
      ease: EASING_FUNCTIONS[config.easing || 'ease-in-out'],
    },
  };
}

/**
 * Slide animation configuration
 * Slides in from top, bottom, left, or right
 */
export function createSlideAnimation(config: AnimationConfig, direction: 'up' | 'down' | 'left' | 'right' = 'up') {
  const directionMap = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  const initial = { ...directionMap[direction], opacity: 0 };

  return {
    initial,
    animate: { ...Object.keys(initial).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}), opacity: 1 },
    exit: initial,
    transition: {
      duration: config.customDuration || ANIMATION_DURATIONS[config.speed],
      ease: EASING_FUNCTIONS[config.easing || 'ease-in-out'],
    },
  };
}

/**
 * Scale animation configuration
 * Grows or shrinks from center point
 */
export function createScaleAnimation(config: AnimationConfig, startScale: number = 0.95) {
  return {
    initial: { scale: startScale, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: startScale, opacity: 0 },
    transition: {
      duration: config.customDuration || ANIMATION_DURATIONS[config.speed],
      ease: EASING_FUNCTIONS[config.easing || 'ease-in-out'],
    },
  };
}

/**
 * Bounce animation configuration
 * Adds spring-like bounce effect
 */
export function createBounceAnimation(config: AnimationConfig) {
  return {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 10,
      mass: 0.5,
      duration: config.customDuration || ANIMATION_DURATIONS[config.speed],
    },
  };
}

/**
 * Rotate animation configuration
 * Spins element from 0 to 360 degrees
 */
export function createRotateAnimation(config: AnimationConfig) {
  return {
    initial: { rotate: -10, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    exit: { rotate: 10, opacity: 0 },
    transition: {
      duration: config.customDuration || ANIMATION_DURATIONS[config.speed],
      ease: EASING_FUNCTIONS[config.easing || 'ease-in-out'],
    },
  };
}

/**
 * Stagger children animation configuration
 * Animates children elements with delay between them
 */
export function createStaggerAnimation(config: AnimationConfig, staggerDelay: number = 0.05) {
  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: config.customDuration ? config.customDuration / 1000 * 0.2 : 0,
      },
    },
  };
}

/**
 * Gets animation duration in seconds (for CSS animations)
 */
export function getAnimationDurationInSeconds(config: AnimationConfig): number {
  return (config.customDuration || ANIMATION_DURATIONS[config.speed]) / 1000;
}

/**
 * Gets animation duration in milliseconds (for Framer Motion)
 */
export function getAnimationDurationInMs(config: AnimationConfig): number {
  return config.customDuration || ANIMATION_DURATIONS[config.speed];
}

/**
 * Respects prefers-reduced-motion media query
 * Returns minimal animation if user prefers reduced motion
 */
export function respectsReducedMotion(config: AnimationConfig): AnimationConfig {
  if (typeof window === 'undefined') return config;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return {
      ...config,
      disableAnimations: true,
      customDuration: 0,
    };
  }

  return config;
}

/**
 * Creates a simple transition config for CSS animations
 * Useful for non-Framer Motion animations
 */
export function createTransitionCSS(config: AnimationConfig, properties: string[] = ['all']): string {
  if (config.disableAnimations) return 'none';

  const duration = getAnimationDurationInSeconds(config);
  const easing = typeof EASING_FUNCTIONS[config.easing || 'ease-in-out'] === 'string'
    ? EASING_FUNCTIONS[config.easing || 'ease-in-out']
    : 'ease-in-out';

  return properties.map(prop => `${prop} ${duration}s ${easing}`).join(', ');
}

/**
 * Combines multiple animations with proper timing
 */
export function combineAnimations(...animations: any[]) {
  return {
    initial: Object.assign({}, ...animations.map(a => a.initial)),
    animate: Object.assign({}, ...animations.map(a => a.animate)),
    exit: Object.assign({}, ...animations.map(a => a.exit)),
    transition: animations[0]?.transition,
  };
}
