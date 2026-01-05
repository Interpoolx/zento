import type { Theme } from '@/store/themeStore';
import type { PageStyle } from '@/types';

/**
 * Converts a theme to CSS custom properties (CSS variables)
 * Can be used to apply theme colors throughout the application
 * 
 * @param theme - Theme object with colors
 * @returns Object with CSS variable declarations
 */
export function generateCSSVariablesFromTheme(theme: Theme): Record<string, string> {
  return {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-background': theme.colors.background,
    '--color-text': theme.colors.text,
    '--color-accent': theme.colors.accent,
  };
}

/**
 * Converts page style to CSS custom properties
 * 
 * @param style - Page styling object
 * @returns Object with CSS variable declarations
 */
export function generateCSSVariablesFromPageStyle(style: PageStyle): Record<string, string> {
  return {
    '--page-background-color': style.backgroundColor,
    '--page-font-color': style.fontColor,
    '--page-font-family': style.fontFamily,
    '--page-button-style': style.buttonStyle,
    '--page-widget-background': style.widgetBackground,
    '--page-widget-border-radius': `${style.widgetBorderRadius}px`,
  };
}

/**
 * Generates CSS variables from theme typography and effects
 * 
 * @param theme - Theme object with typography and effects
 * @returns Object with CSS variable declarations
 */
export function generateCSSVariablesFromThemeTypographyAndEffects(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};

  if (theme.typography) {
    vars['--font-family'] = theme.typography.fontFamily;
    vars['--heading-size'] = `${theme.typography.headingSize}px`;
    vars['--body-size'] = `${theme.typography.bodySize}px`;
    vars['--font-weight'] = theme.typography.fontWeight || 'normal';
    vars['--line-height'] = `${theme.typography.lineHeight || 1.5}`;
  }

  if (theme.effects) {
    vars['--shadow-level'] = theme.effects.shadowLevel;
    vars['--border-radius'] = `${theme.effects.borderRadius}px`;
    vars['--animation-speed'] = theme.effects.animationSpeed;
  }

  return vars;
}

/**
 * Generates complete CSS variables object from both theme and page style
 * 
 * @param theme - Theme object
 * @param pageStyle - Page style object
 * @returns Combined CSS variables object
 */
export function generateAllCSSVariables(
  theme: Theme,
  pageStyle: PageStyle
): Record<string, string> {
  return {
    ...generateCSSVariablesFromTheme(theme),
    ...generateCSSVariablesFromPageStyle(pageStyle),
    ...generateCSSVariablesFromThemeTypographyAndEffects(theme),
  };
}

/**
 * Converts CSS variables object to CSS string for use in style tag or inline styles
 * 
 * @param variables - Object with CSS variable names and values
 * @returns CSS string with :root rules
 */
export function cssVariablesToString(variables: Record<string, string>): string {
  const varStrings = Object.entries(variables)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n  ');

  return `:root {\n  ${varStrings}\n}`;
}

/**
 * Applies CSS variables to an element's style property
 * Useful for applying theme colors to a specific DOM node
 * 
 * @param element - DOM element to apply styles to
 * @param variables - CSS variables to apply
 */
export function applyCSSVariablesToElement(
  element: HTMLElement,
  variables: Record<string, string>
): void {
  Object.entries(variables).forEach(([name, value]) => {
    element.style.setProperty(name, value);
  });
}

/**
 * Retrieves a CSS variable value from a theme
 * Useful for dynamic styling based on theme colors
 * 
 * @param theme - Theme object
 * @param colorKey - Color key (primary, secondary, etc.)
 * @returns Color value or undefined
 */
export function getThemeColorVariable(
  theme: Theme,
  colorKey: keyof Theme['colors']
): string | undefined {
  return theme.colors[colorKey];
}

/**
 * Converts hex color to CSS variable reference
 * Used for CSS that references theme colors
 * 
 * @param colorName - Name of the color (primary, secondary, etc.)
 * @returns CSS variable reference string
 */
export function getColorVariableReference(colorName: string): string {
  return `var(--color-${colorName})`;
}

/**
 * Generates shadow CSS based on shadow level
 */
function getShadowCSS(level: string): string {
  const shadows: Record<string, string> = {
    none: 'none',
    small: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px rgba(0, 0, 0, 0.15)',
  };
  return shadows[level] || shadows.medium;
}

/**
 * Generates animation duration CSS based on speed
 */
function getAnimationDurationCSS(speed: string): string {
  const durations: Record<string, string> = {
    slow: '400ms',
    normal: '250ms',
    fast: '150ms',
  };
  return durations[speed] || durations.normal;
}

/**
 * Generates a CSS theme stylesheet that can be injected into the page
 * 
 * @param theme - Theme object
 * @param pageStyle - Page style object
 * @param id - Optional ID for the style tag
 * @returns CSS string suitable for <style> tag
 */
export function generateThemeStylesheet(
  theme: Theme,
  pageStyle: PageStyle
): string {
  const cssVars = generateAllCSSVariables(theme, pageStyle);
  const varString = cssVariablesToString(cssVars);

  // Build typography and effects rules
  let typographyRules = '';
  if (theme.typography) {
    typographyRules = `
    h1, h2, h3, h4, h5, h6 {
      font-size: var(--heading-size);
      font-weight: var(--font-weight);
      line-height: var(--line-height);
    }

    body, p, span {
      font-size: var(--body-size);
      font-family: var(--font-family);
      line-height: var(--line-height);
    }`;
  }

  let effectsRules = '';
  if (theme.effects) {
    const shadowCSS = getShadowCSS(theme.effects.shadowLevel);
    const animationDuration = getAnimationDurationCSS(theme.effects.animationSpeed);

    effectsRules = `
    .widget, .btn-primary, .btn-secondary {
      border-radius: var(--border-radius);
      box-shadow: ${shadowCSS};
      transition: all ${animationDuration} ease-in-out;
    }

    .widget:hover {
      box-shadow: ${getShadowCSS(theme.effects.shadowLevel === 'none' ? 'small' : 'large')};
    }`;
  }

  // Add theme-specific color rules for common elements
  const colorRules = `
    body {
      background-color: var(--page-background-color);
      color: var(--page-font-color);
      font-family: var(--page-font-family);
    }

    .widget {
      background-color: var(--page-widget-background);
      border-radius: var(--page-widget-border-radius);
    }

    .btn-primary {
      background-color: var(--color-primary);
      color: white;
    }

    .btn-secondary {
      background-color: var(--color-secondary);
      color: white;
    }

    .text-primary {
      color: var(--color-primary);
    }

    .text-accent {
      color: var(--color-accent);
    }
  `;

  return `/* Theme: ${theme.name} */\n${varString}\n${colorRules}${typographyRules}${effectsRules}`;
}

/**
 * Injects a theme stylesheet into the document
 * 
 * @param theme - Theme object
 * @param pageStyle - Page style object
 * @param removeOldStyle - Whether to remove previously injected styles
 */
export function injectThemeStylesheet(
  theme: Theme,
  pageStyle: PageStyle,
  removeOldStyle = true
): void {
  const id = 'zento-theme-styles';

  // Remove old style if it exists
  if (removeOldStyle) {
    const oldStyle = document.getElementById(id);
    if (oldStyle) {
      oldStyle.remove();
    }
  }

  // Create and inject new style
  const style = document.createElement('style');
  style.id = id;
  style.textContent = generateThemeStylesheet(theme, pageStyle);
  document.head.appendChild(style);
}
