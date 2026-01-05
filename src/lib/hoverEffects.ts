/**
 * Hover Effects Library
 * Defines preset hover effect animations and utilities
 */

export type HoverEffectType = 'scale' | 'lift' | 'rotate' | 'colorShift' | 'shadow' | 'brightness' | 'none';

export interface HoverEffect {
  type: HoverEffectType;
  intensity: number; // 0.1-2.0
  duration: number; // milliseconds
  color?: string; // For colorShift
  easing?: string;
}

/**
 * Preset hover effects with recommended settings
 */
export const HOVER_EFFECT_PRESETS: Record<HoverEffectType, Omit<HoverEffect, 'type'>> = {
  scale: {
    intensity: 1.05,
    duration: 200,
    easing: 'ease-in-out',
  },
  lift: {
    intensity: 8, // pixels
    duration: 300,
    easing: 'ease-out',
  },
  rotate: {
    intensity: 3, // degrees
    duration: 300,
    easing: 'ease-in-out',
  },
  colorShift: {
    intensity: 0.1, // opacity change
    duration: 250,
    easing: 'ease-in-out',
    color: '#ffffff',
  },
  shadow: {
    intensity: 1.5,
    duration: 250,
    easing: 'ease-in-out',
  },
  brightness: {
    intensity: 1.1, // 10% increase
    duration: 200,
    easing: 'ease-in-out',
  },
  none: {
    intensity: 1,
    duration: 0,
    easing: 'linear',
  },
};

/**
 * Generates Framer Motion hover config for a given effect
 */
export function createHoverAnimation(effect: HoverEffect) {
  const config = {
    whileHover: {} as any,
    transition: {
      duration: effect.duration / 1000,
      ease: effect.easing || 'ease-in-out',
    },
  };

  switch (effect.type) {
    case 'scale':
      config.whileHover.scale = effect.intensity;
      break;
    case 'lift':
      config.whileHover.y = -effect.intensity;
      break;
    case 'rotate':
      config.whileHover.rotate = effect.intensity;
      break;
    case 'colorShift':
      config.whileHover.backgroundColor = effect.color || '#f0f0f0';
      break;
    case 'shadow':
      config.whileHover.boxShadow = generateShadowCSS(effect.intensity);
      break;
    case 'brightness':
      config.whileHover.filter = `brightness(${effect.intensity})`;
      break;
    case 'none':
      // No animation
      break;
  }

  return config;
}

/**
 * Generates CSS hover rules for a given effect
 */
export function generateHoverCSS(effect: HoverEffect, selector: string = '&:hover'): string {
  if (effect.type === 'none') return '';

  const duration = effect.duration / 1000;
  const ease = effect.easing || 'ease-in-out';

  let css = `${selector} {\n  transition: all ${duration}s ${ease};\n`;

  switch (effect.type) {
    case 'scale':
      css += `  transform: scale(${effect.intensity});\n`;
      break;
    case 'lift':
      css += `  transform: translateY(-${effect.intensity}px);\n`;
      break;
    case 'rotate':
      css += `  transform: rotate(${effect.intensity}deg);\n`;
      break;
    case 'colorShift':
      css += `  background-color: ${effect.color || '#f0f0f0'};\n`;
      break;
    case 'shadow':
      css += `  box-shadow: ${generateShadowCSS(effect.intensity)};\n`;
      break;
    case 'brightness':
      css += `  filter: brightness(${effect.intensity});\n`;
      break;
  }

  css += '}';
  return css;
}

/**
 * Generates shadow CSS based on intensity
 */
function generateShadowCSS(intensity: number): string {
  const blur = Math.round(15 * intensity);
  const spread = Math.round(5 * intensity);
  const offsetY = Math.round(8 * intensity);
  const opacity = Math.min(0.25 * intensity, 0.3);

  return `0 ${offsetY}px ${blur}px ${spread}px rgba(0, 0, 0, ${opacity})`;
}

/**
 * Checks if user prefers reduced motion
 */
export function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Gets appropriate hover effect respecting accessibility preferences
 */
export function getAccessibleHoverEffect(effect: HoverEffect): HoverEffect {
  if (checkPrefersReducedMotion()) {
    return {
      ...effect,
      type: 'none',
    };
  }

  return effect;
}

/**
 * Checks if device supports hover (not touch-only)
 */
export function isHoverSupported(): boolean {
  if (typeof window === 'undefined') return true;

  // Check for touch support
  return !window.matchMedia('(hover: none)').matches && !window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Gets appropriate hover effect based on device capabilities
 */
export function getDeviceAwareHoverEffect(effect: HoverEffect): HoverEffect {
  if (!isHoverSupported()) {
    return {
      ...effect,
      type: 'none',
    };
  }

  return getAccessibleHoverEffect(effect);
}

/**
 * Combines multiple hover effects
 */
export function combineHoverEffects(...effects: HoverEffect[]): HoverEffect {
  // Return the first effect as primary
  // In a more complex implementation, you could merge transform values
  return effects[0] || HOVER_EFFECT_PRESETS.scale;
}

/**
 * Intensity guide for different effect types
 */
export const INTENSITY_GUIDE: Record<HoverEffectType, { min: number; max: number; default: number; unit: string }> = {
  scale: { min: 1, max: 1.5, default: 1.05, unit: '' },
  lift: { min: 2, max: 20, default: 8, unit: 'px' },
  rotate: { min: 1, max: 10, default: 3, unit: 'deg' },
  colorShift: { min: 0, max: 1, default: 0.1, unit: '' },
  shadow: { min: 0.5, max: 3, default: 1.5, unit: '' },
  brightness: { min: 1, max: 1.5, default: 1.1, unit: '' },
  none: { min: 0, max: 1, default: 0, unit: '' },
};

/**
 * Validates hover effect configuration
 */
export function validateHoverEffect(effect: HoverEffect): { valid: boolean; error?: string } {
  const guide = INTENSITY_GUIDE[effect.type];

  if (effect.intensity < guide.min || effect.intensity > guide.max) {
    return {
      valid: false,
      error: `Intensity must be between ${guide.min} and ${guide.max} ${guide.unit}`,
    };
  }

  if (effect.duration < 0) {
    return {
      valid: false,
      error: 'Duration cannot be negative',
    };
  }

  return { valid: true };
}
