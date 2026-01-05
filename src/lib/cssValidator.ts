/**
 * CSS Validator
 * Validates and sanitizes user-provided CSS for security and compliance
 * Prevents XSS, layout breaking, and other malicious CSS patterns
 */

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  sanitized?: string;
}

/**
 * Harmful CSS properties that could break layouts or enable attacks
 */
const HARMFUL_PROPERTIES = [
  'position: fixed',
  'position: sticky',
  'position: absolute',
  'z-index',
  'overflow: hidden',
  'display: none',
  'visibility: hidden',
  'pointer-events: none',
  'width: 0',
  'height: 0',
];

/**
 * Disallowed at-rules (@ directives)
 */
const DISALLOWED_AT_RULES = [
  '@import',
  '@namespace',
  '@supports',
  '@document',
  '@media (prefers-color-scheme',
  '@keyframes', // Only at root level
  '@font-face', // Restricted
];

/**
 * Dangerous patterns to detect
 */
const DANGEROUS_PATTERNS = [
  { pattern: /javascript:/gi, description: 'JavaScript URLs not allowed' },
  { pattern: /expression\(/gi, description: 'CSS expressions not allowed' },
  { pattern: /behavior:/gi, description: 'Behavior URLs not allowed' },
  { pattern: /-moz-binding:/gi, description: 'Mozilla binding not allowed' },
  { pattern: /vbscript:/gi, description: 'VBScript URLs not allowed' },
  { pattern: /on\w+\s*=/gi, description: 'Event handlers in CSS not allowed' },
];

/**
 * Validates CSS code for security and compliance
 * 
 * @param css - CSS code to validate
 * @returns Validation result with warnings and errors
 */
export function validateCustomCSS(css: string): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!css || css.trim().length === 0) {
    return { valid: true, warnings, errors };
  }

  // Check for dangerous patterns
  for (const { pattern, description } of DANGEROUS_PATTERNS) {
    if (pattern.test(css)) {
      errors.push(description);
    }
  }

  // Check for disallowed at-rules
  for (const atRule of DISALLOWED_AT_RULES) {
    if (new RegExp(atRule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi').test(css)) {
      if (atRule === '@keyframes') {
        warnings.push('@keyframes rule will be restricted to scoped containers only');
      } else {
        errors.push(`${atRule} is not allowed`);
      }
    }
  }

  // Check for potentially harmful properties
  for (const property of HARMFUL_PROPERTIES) {
    if (new RegExp(property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi').test(css)) {
      warnings.push(`⚠️ ${property} is restricted and may be limited`);
    }
  }

  // Check for overly complex selectors
  const complexSelectors = css.match(/[^}]*\{[^}]*\}/g) || [];
  if (complexSelectors.some(rule => rule.length > 1000)) {
    warnings.push('Some CSS rules are very large and may impact performance');
  }

  // Check for excessive nesting depth
  const maxNesting = Math.max(...(css.match(/\{/g) || []).map((_, i, arr) => {
    let depth = 0;
    for (let j = 0; j <= i; j++) {
      if (arr[j] === '{') depth++;
      if (css[j] === '}') depth--;
    }
    return depth;
  }), 0);

  if (maxNesting > 5) {
    warnings.push('CSS nesting depth is high, which may impact performance');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Sanitizes CSS by removing dangerous patterns
 * 
 * @param css - CSS code to sanitize
 * @returns Sanitized CSS code
 */
export function sanitizeCSS(css: string): string {
  let sanitized = css;

  // Remove dangerous patterns
  for (const { pattern } of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Remove disallowed at-rules (except @keyframes, which is scoped)
  const restrictedRules = DISALLOWED_AT_RULES.filter(rule => rule !== '@keyframes');
  for (const atRule of restrictedRules) {
    const pattern = new RegExp(`${atRule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^;]*;?`, 'gi');
    sanitized = sanitized.replace(pattern, '');
  }

  // Remove harmful inline properties (but keep in context for warnings)
  // This is complex as we need to preserve CSS structure
  // For now, rely on validation warnings

  return sanitized.trim();
}

/**
 * Minifies CSS for storage
 * 
 * @param css - CSS code to minify
 * @returns Minified CSS
 */
export function minifyCSS(css: string): string {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove whitespace
    .replace(/\s+/g, ' ')
    // Remove space around special characters
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Clean up double spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Expands minified CSS for editing
 * 
 * @param css - Minified CSS to expand
 * @returns Formatted CSS
 */
export function formatCSS(css: string): string {
  let formatted = css;

  // Add newlines after closing braces
  formatted = formatted.replace(/\}/g, '}\n');

  // Add newlines after semicolons (inside rules)
  formatted = formatted.replace(/;(?!\n)/g, ';\n');

  // Indent rule content
  const lines = formatted.split('\n');
  let indentLevel = 0;
  formatted = lines
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Decrease indent before closing brace
      if (trimmed.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indented = '  '.repeat(indentLevel) + trimmed;

      // Increase indent after opening brace
      if (trimmed.endsWith('{')) {
        indentLevel++;
      }

      return indented;
    })
    .filter(line => line.trim().length > 0)
    .join('\n');

  return formatted;
}

/**
 * Gets the total line count of CSS code
 * 
 * @param css - CSS code to count lines in
 * @returns The total number of lines
 * @example
 * getLineCount('body { color: red; }') // Returns 1
 * getLineCount('body {\n  color: red;\n}') // Returns 3
 */
export function getLineCount(css: string): number {
  return css.split('\n').length;
}

/**
 * Gets the total character count of CSS code
 * 
 * @param css - CSS code to count characters in
 * @returns The total number of characters
 * @example
 * getCharacterCount('body { color: red; }') // Returns 20
 */
export function getCharacterCount(css: string): number {
  return css.length;
}

/**
 * Estimates performance impact of CSS
 * 
 * @param css - CSS code
 * @returns Performance assessment
 */
export function assessPerformance(css: string): {
  score: number; // 0-100
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  const charCount = getCharacterCount(css);

  // Check for excessive size
  if (charCount > 50000) {
    issues.push('CSS is very large (>50KB), may impact load times');
    score -= 20;
  } else if (charCount > 10000) {
    issues.push('CSS is large (>10KB), consider optimization');
    score -= 10;
  }

  // Check for expensive selectors
  const expensiveSelectors = (css.match(/\*[^}]*\{/g) || []).length;
  if (expensiveSelectors > 5) {
    issues.push(`Found ${expensiveSelectors} universal selectors, which are expensive`);
    score -= 10;
  }

  // Check for deep selectors
  const deepSelectors = (css.match(/\s[^}]{50,}\{/g) || []).length;
  if (deepSelectors > 0) {
    issues.push('Found very deep selectors, consider using classes');
    score -= 5;
  }

  // Check for animations
  const animationCount = (css.match(/@keyframes/g) || []).length;
  if (animationCount > 3) {
    issues.push(`${animationCount} animations detected, may impact performance`);
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
  };
}

/**
 * Extracts selector list from CSS
 * 
 * @param css - CSS code
 * @returns Array of selectors
 */
export function extractSelectors(css: string): string[] {
  const selectors: string[] = [];
  const regex = /([^{}]+)\s*\{/g;
  let match;

  while ((match = regex.exec(css)) !== null) {
    const selector = match[1].trim();
    if (selector && !selector.startsWith('@')) {
      selectors.push(selector);
    }
  }

  return selectors;
}

/**
 * Checks if CSS targets dangerous selectors
 * 
 * @param css - CSS code
 * @returns Array of dangerous selectors found
 */
export function findDangerousSelectors(css: string): string[] {
  const dangerous: string[] = [];
  const selectors = extractSelectors(css);

  // Patterns that could be dangerous
  const dangerousPatterns = [
    { pattern: /^html/i, reason: 'Targets root element' },
    { pattern: /^body/i, reason: 'Targets body element' },
    { pattern: /\*(?!\s*\})/i, reason: 'Universal selector may be inefficient' },
  ];

  for (const selector of selectors) {
    for (const { pattern } of dangerousPatterns) {
      if (pattern.test(selector)) {
        dangerous.push(selector);
      }
    }
  }

  return dangerous;
}

/**
 * Gets comprehensive CSS statistics including line count, character count, and rules
 * 
 * @param css - CSS code to analyze
 * @returns Object containing statistical information about the CSS
 * @returns {number} lines - Total number of lines
 * @returns {number} characters - Total number of characters
 * @returns {number} selectors - Total number of unique selectors
 * @returns {number} declarations - Total number of CSS declarations
 * @returns {number} atRules - Total number of at-rules (@media, @keyframes, etc.)
 * @example
 * const stats = getStatistics('body { color: red; }');
 * console.log(stats); // { lines: 1, characters: 20, selectors: 1, declarations: 1, atRules: 0 }
 */
export function getStatistics(css: string): {
  lines: number;
  characters: number;
  selectors: number;
  declarations: number;
  atRules: number;
} {
  return {
    lines: getLineCount(css),
    characters: getCharacterCount(css),
    selectors: extractSelectors(css).length,
    declarations: (css.match(/[:]/g) || []).length,
    atRules: (css.match(/@[\w-]+/g) || []).length,
  };
}

/**
 * Generates a security report for CSS
 */
export function generateSecurityReport(css: string): {
  riskLevel: 'low' | 'medium' | 'high';
  issues: Array<{ severity: 'info' | 'warning' | 'error'; message: string }>;
  recommendations: string[];
} {
  const validation = validateCustomCSS(css);
  const performance = assessPerformance(css);
  const dangerous = findDangerousSelectors(css);

  const issues: Array<{ severity: 'info' | 'warning' | 'error'; message: string }> = [];
  const recommendations: string[] = [];

  // Add validation issues
  validation.errors.forEach(error => {
    issues.push({ severity: 'error', message: error });
  });

  validation.warnings.forEach(warning => {
    issues.push({ severity: 'warning', message: warning });
  });

  // Add performance issues
  performance.issues.forEach(issue => {
    issues.push({ severity: 'warning', message: issue });
  });

  // Add dangerous selector warnings
  dangerous.forEach(selector => {
    issues.push({
      severity: 'warning',
      message: `Selector "${selector}" may have unintended side effects`,
    });
  });

  // Generate recommendations
  if (validation.errors.length > 0) {
    recommendations.push('Fix validation errors before applying CSS');
  }

  if (performance.score < 50) {
    recommendations.push('Consider optimizing CSS for better performance');
  }

  if (dangerous.length > 0) {
    recommendations.push('Review selectors targeting root elements');
  }

  if (css.includes('!important')) {
    recommendations.push('Minimize use of !important declarations');
  }

  const riskLevel = validation.errors.length > 0 ? 'high' : dangerous.length > 0 ? 'medium' : 'low';

  return {
    riskLevel,
    issues,
    recommendations,
  };
}
