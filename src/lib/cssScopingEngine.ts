/**
 * CSS Scoping Engine
 * Scopes user-provided CSS to page containers to prevent layout breaking
 * Restricts selectors to nested context
 */

export interface ScopingOptions {
  containerSelector: string;
  allowRootKeyframes?: boolean;
  restrictPositioning?: boolean;
  prefixSelectors?: boolean;
}

const DEFAULT_OPTIONS: ScopingOptions = {
  containerSelector: '.zento-page',
  allowRootKeyframes: false,
  restrictPositioning: true,
  prefixSelectors: true,
};

/**
 * Scopes CSS rules to a container
 * 
 * @param css - Raw CSS code
 * @param options - Scoping options
 * @returns Scoped CSS code
 */
export function scopeCSS(css: string, options: Partial<ScopingOptions> = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let scoped = css;

  // Remove comments first
  scoped = removeComments(scoped);

  // Process each rule
  const rules = parseCSS(scoped);
  const scopedRules = rules.map(rule => scopeRule(rule, opts));

  // Rejoin rules
  scoped = scopedRules
    .filter(rule => rule && rule.trim().length > 0)
    .map(rule => formatRule(rule))
    .join('\n\n');

  return scoped;
}

/**
 * Parses CSS into individual rules
 */
function parseCSS(css: string): string[] {
  const rules: string[] = [];
  let depth = 0;
  let currentRule = '';

  for (let i = 0; i < css.length; i++) {
    const char = css[i];

    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      currentRule += char;

      if (depth === 0) {
        rules.push(currentRule.trim());
        currentRule = '';
        continue;
      }
    }

    currentRule += char;
  }

  // Add any remaining rule
  if (currentRule.trim()) {
    rules.push(currentRule.trim());
  }

  return rules;
}

/**
 * Scopes a single CSS rule to container
 */
function scopeRule(rule: string, options: ScopingOptions): string {
  // Extract selector and declarations
  const match = rule.match(/^([^{]+)\s*\{\s*([\s\S]*)\s*\}$/);
  if (!match) return rule;

  const [, selector, declarations] = match;

  // Handle at-rules
  if (selector.trim().startsWith('@')) {
    return scopeAtRule(rule, options);
  }

  // Scope regular selectors
  const scopedSelectors = scopeSelectors(selector, options);
  return `${scopedSelectors} {\n  ${declarations.trim()}\n}`;
}

/**
 * Scopes at-rules (@media, @keyframes, etc.)
 */
function scopeAtRule(rule: string, options: ScopingOptions): string {
  const atRuleMatch = rule.match(/^(@[^{]+)\s*\{\s*([\s\S]*)\s*\}$/);
  if (!atRuleMatch) return rule;

  const [, atRule, content] = atRuleMatch;

  // Allow @media queries (nest content)
  if (atRule.trim().startsWith('@media')) {
    // Re-scope content inside @media
    const innerRules = parseCSS(content);
    const rescopedRules = innerRules.map(r => scopeRule(r, options));
    const rescopedContent = rescopedRules
      .filter(r => r && r.trim())
      .join('\n');

    return `${atRule} {\n  ${rescopedContent}\n}`;
  }

  // Restrict @keyframes to scoped context
  if (atRule.trim().startsWith('@keyframes')) {
    if (!options.allowRootKeyframes) {
      // Scope keyframes to container
      return `${atRule} {\n  ${content}\n}`;
    }
  }

  // Other at-rules are blocked or restricted
  return `/* Restricted at-rule: ${atRule} */`;
}

/**
 * Scopes selectors to container
 */
function scopeSelectors(selectorString: string, options: ScopingOptions): string {
  const selectors = selectorString
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const scopedSelectors = selectors.map(selector => {
    // Don't scope pseudo-elements or pseudo-classes used alone
    if (selector === ':root' || selector === 'html' || selector === 'body') {
      // Replace with container
      return options.containerSelector;
    }

    // Scope selector to container
    if (options.prefixSelectors) {
      if (selector.startsWith('&')) {
        // Support SCSS-style & reference
        return `${options.containerSelector}${selector.substring(1)}`;
      }

      // Add container prefix
      return `${options.containerSelector} ${selector}`;
    }

    return selector;
  });

  return scopedSelectors.join(', ');
}

/**
 * Restricts dangerous positioning properties
 * 
 * @param css - CSS code to restrict
 * @returns CSS with restricted positioning properties
 */
export function restrictPositioning(css: string): string {
  let restricted = css;

  // Find and comment out fixed positioning
  restricted = restricted.replace(
    /position\s*:\s*fixed\s*(!important)?;/gi,
    '/* position: fixed; (restricted) */'
  );

  // Find and comment out sticky positioning
  restricted = restricted.replace(
    /position\s*:\s*sticky\s*(!important)?;/gi,
    '/* position: sticky; (restricted) */'
  );

  // Restrict z-index values
  restricted = restricted.replace(
    /z-index\s*:\s*(\d+)/gi,
    (match, value) => {
      const zIndex = parseInt(value);
      const maxZ = 99;
      return zIndex > maxZ ? `z-index: ${maxZ}` : match;
    }
  );

  return restricted;
}

/**
 * Removes CSS comments
 */
function removeComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Formats a CSS rule for readability
 */
function formatRule(rule: string): string {
  return rule
    .replace(/\s+/g, ' ')
    .replace(/\s*\{\s*/g, ' {\n  ')
    .replace(/\s*;\s*/g, ';\n  ')
    .replace(/\s*\}\s*/g, '\n}')
    .replace(/\n\s+\n/g, '\n')
    .trim();
}

/**
 * Validates if selector is safe
 */
export function isSelectorSafe(selector: string): boolean {
  const dangerousPatterns = [
    /^body/i,
    /^html/i,
    /!important/,
    /javascript:/,
    /behavior:/,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(selector));
}

/**
 * Gets all selectors from CSS and indicates which are scoped
 */
export function getScopedSelectors(
  css: string,
  containerSelector: string = '.zento-page'
): Array<{ original: string; scoped: string; safe: boolean }> {
  const rules = parseCSS(css);
  const selectors: Array<{ original: string; scoped: string; safe: boolean }> = [];

  rules.forEach(rule => {
    const match = rule.match(/^([^{]+)\s*\{/);
    if (match && !rule.trim().startsWith('@')) {
      const original = match[1].trim();
      const scoped = scopeSelectors(original, {
        containerSelector,
        prefixSelectors: true,
      });
      const safe = isSelectorSafe(original);

      selectors.push({ original, scoped, safe });
    }
  });

  return selectors;
}

/**
 * Creates a scoped CSS block as a string
 */
export function createScopedBlock(
  css: string,
  pageId: string = 'page-1',
  options: Partial<ScopingOptions> = {}
): string {
  const opts = {
    ...DEFAULT_OPTIONS,
    containerSelector: `[data-page-id="${pageId}"]`,
    ...options,
  };

  return scopeCSS(css, opts);
}

/**
 * Injects scoped CSS into document
 */
export function injectScopedCSS(
  css: string,
  pageId: string,
  styleId: string = `custom-css-${pageId}`
): HTMLStyleElement | null {
  try {
    // Remove existing style if present
    const existing = document.getElementById(styleId);
    if (existing) {
      existing.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = styleId;

    // Scope and apply CSS
    const scoped = createScopedBlock(css, pageId);
    style.textContent = scoped;

    // Inject into document
    document.head.appendChild(style);
    return style;
  } catch (error) {
    console.error('Failed to inject scoped CSS:', error);
    return null;
  }
}

/**
 * Removes injected scoped CSS
 */
export function removeScopedCSS(styleId: string): boolean {
  try {
    const style = document.getElementById(styleId);
    if (style) {
      style.remove();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to remove scoped CSS:', error);
    return false;
  }
}

/**
 * Validates scoped CSS can be injected safely
 */
export function validateScopedInjection(css: string, pageId: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for injection attack patterns
  if (css.includes('</style>')) {
    errors.push('CSS contains style tag closing, possible injection');
  }

  if (css.includes('<script')) {
    errors.push('CSS contains script tags, possible injection');
  }

  if (css.includes('import') && css.includes('url(')) {
    warnings.push('CSS import detected, ensure URL is trusted');
  }

  // Test parsing
  try {
    parseCSS(css);
  } catch (e) {
    errors.push('CSS parsing failed, may be malformed');
  }

  // Test scoping
  try {
    createScopedBlock(css, pageId);
  } catch (e) {
    errors.push('CSS scoping failed');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
