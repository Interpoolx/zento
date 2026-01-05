/**
 * Glow Effects Library
 * Defines CSS glow/neon effects with animation support
 */

export type GlowAnimation = 'none' | 'pulse' | 'flicker';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface GlowEffect {
  enabled: boolean;
  color: string;
  intensity: number; // 0-100
  animation?: GlowAnimation;
  animationSpeed?: AnimationSpeed;
}

/**
 * Animation duration presets for glow effects
 */
const ANIMATION_SPEEDS: Record<AnimationSpeed, number> = {
  slow: 3000,
  normal: 2000,
  fast: 1000,
};

/**
 * Default glow effect presets
 */
export const GLOW_PRESETS: Record<string, GlowEffect> = {
  subtle: {
    enabled: true,
    color: '#3b82f6',
    intensity: 25,
    animation: 'none',
  },
  medium: {
    enabled: true,
    color: '#3b82f6',
    intensity: 50,
    animation: 'none',
  },
  intense: {
    enabled: true,
    color: '#3b82f6',
    intensity: 75,
    animation: 'none',
  },
  neon: {
    enabled: true,
    color: '#00ff88',
    intensity: 80,
    animation: 'pulse',
    animationSpeed: 'normal',
  },
  warning: {
    enabled: true,
    color: '#ff6b35',
    intensity: 60,
    animation: 'flicker',
    animationSpeed: 'normal',
  },
};

/**
 * Generates box-shadow CSS for glow effect
 */
export function generateGlowCSS(glow: GlowEffect): string {
  if (!glow.enabled || glow.intensity === 0) return 'none';

  // Map intensity (0-100) to blur and spread radius
  const blurRadius = (glow.intensity / 100) * 30;
  const spreadRadius = (glow.intensity / 100) * 10;

  return `0 0 ${blurRadius.toFixed(1)}px ${spreadRadius.toFixed(1)}px ${glow.color}`;
}

/**
 * Generates CSS keyframes for glow animations
 */
export function generateGlowKeyframes(animationType: GlowAnimation): string {
  if (animationType === 'none') return '';

  switch (animationType) {
    case 'pulse':
      return `
        @keyframes glow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `;
    case 'flicker':
      return `
        @keyframes glow-flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0.4; }
        }
      `;
    default:
      return '';
  }
}

/**
 * Generates complete CSS rule for glow effect with animation
 */
export function generateGlowStyleRule(
  glow: GlowEffect,
  selector: string = '.glow-element',
  includeKeyframes: boolean = true
): string {
  let css = '';

  // Include keyframes if animation is used
  if (includeKeyframes && glow.animation && glow.animation !== 'none') {
    css += generateGlowKeyframes(glow.animation);
    css += '\n';
  }

  // Generate main style rule
  css += `${selector} {\n`;
  css += `  box-shadow: ${generateGlowCSS(glow)};\n`;

  if (glow.animation && glow.animation !== 'none') {
    const duration = ANIMATION_SPEEDS[glow.animationSpeed || 'normal'];
    css += `  animation: glow-${glow.animation} ${duration}ms infinite;\n`;
  }

  css += '}';

  return css;
}

/**
 * Generates Framer Motion animation config for glow
 */
export function createGlowAnimation(glow: GlowEffect) {
  if (!glow.enabled || glow.animation === 'none') {
    return {};
  }

  const speed = glow.animationSpeed || 'normal';
  const duration = ANIMATION_SPEEDS[speed] / 1000;

  const config: any = {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
  };

  switch (glow.animation) {
    case 'pulse':
      config.animate = {
        opacity: [1, 0.6, 1],
      };
      config.transition = {
        duration,
        repeat: Infinity,
        ease: 'ease-in-out',
      };
      break;
    case 'flicker':
      config.animate = {
        opacity: [1, 1, 0.4, 1, 1, 0.4, 1],
      };
      config.transition = {
        duration,
        repeat: Infinity,
        times: [0, 0.19, 0.2, 0.23, 0.54, 0.55, 1],
        ease: 'linear',
      };
      break;
  }

  return config;
}

/**
 * Hex to RGB conversion helper
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Generates glow color with varying opacity for layered effect
 */
export function generateLayeredGlowCSS(glow: GlowEffect, layers: number = 3): string {
  if (!glow.enabled || glow.intensity === 0) return 'none';

  const shadows: string[] = [];
  const baseBlur = (glow.intensity / 100) * 30;
  const baseSpread = (glow.intensity / 100) * 10;

  for (let i = 1; i <= layers; i++) {
    const blurRadius = (baseBlur / layers) * i;
    const spreadRadius = (baseSpread / layers) * i;
    const opacity = 1 - (i / (layers + 1));

    // Add rgba version of color with varying opacity
    const rgb = hexToRgb(glow.color) || { r: 0, g: 0, b: 0 };
    shadows.push(`0 0 ${blurRadius.toFixed(1)}px ${spreadRadius.toFixed(1)}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
  }

  return shadows.join(', ');
}

/**
 * Validates glow effect configuration
 */
export function validateGlowEffect(glow: GlowEffect): { valid: boolean; error?: string } {
  if (glow.intensity < 0 || glow.intensity > 100) {
    return {
      valid: false,
      error: 'Intensity must be between 0 and 100',
    };
  }

  // Validate hex color
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(glow.color)) {
    return {
      valid: false,
      error: 'Invalid color format. Use hex color (e.g., #ff0000)',
    };
  }

  return { valid: true };
}

/**
 * Gets contrasting text color for a glow color
 * Useful for ensuring readability when glow is applied
 */
export function getContrastingColor(glowColor: string): string {
  const rgb = hexToRgb(glowColor);
  if (!rgb) return '#ffffff';

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
