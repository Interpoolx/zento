import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges and deduplicates Tailwind CSS class names using clsx and tailwind-merge.
 * Resolves conflicting Tailwind utilities to prevent duplicate styles.
 *
 * This is essential for component libraries and dynamic styling where you may have
 * overlapping class names (e.g., base padding + conditional padding). The function
 * ensures that only the most specific Tailwind utility is applied, avoiding CSS
 * specificity conflicts.
 *
 * @param inputs - Class values (strings, objects, arrays) to merge
 *   - Strings: `'px-4 py-2'`
 *   - Objects: `{ 'hover:bg-blue-500': isHovered }`
 *   - Arrays: `['text-lg', 'font-bold']`
 *   - Falsy values are automatically filtered out
 * @returns Merged and deduplicated class string ready for use in className
 *
 * @example
 * // Basic merging
 * cn('px-2 py-1', 'text-center')
 * // => 'px-2 py-1 text-center'
 *
 * @example
 * // Resolving conflicts - last value wins (via tailwind-merge)
 * cn('px-2', 'px-4') // px-2 conflicts with px-4
 * // => 'px-4'
 *
 * @example
 * // Conditional classes
 * cn(
 *   'base-class',
 *   { 'active-class': isActive },
 *   { 'disabled-class': isDisabled }
 * )
 *
 * @example
 * // Real-world Button component usage
 * function Button({ variant = 'primary', disabled }) {
 *   return (
 *     <button
 *       className={cn(
 *         'px-4 py-2 rounded-lg transition-all',
 *         variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
 *         variant === 'secondary' && 'bg-gray-100 text-gray-900 border border-gray-300',
 *         disabled && 'opacity-50 cursor-not-allowed'
 *       )}
 *     >
 *       Click me
 *     </button>
 *   );
 * }
 *
 * @see https://www.npmjs.com/package/tailwind-merge
 * @see https://www.npmjs.com/package/clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a cryptographically secure random UUID v4 identifier.
 * Uses the native Web Crypto API available in modern browsers.
 *
 * Perfect for generating unique IDs for widgets, pages, and other entities
 * in the editor. UUID v4 is completely random and statistically guaranteed
 * to be globally unique without needing a central registry.
 *
 * Browser support: All modern browsers and Node.js 15+
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x and y are hex digits
 *
 * @returns A randomly generated UUID v4 string (36 characters including hyphens)
 *
 * @example
 * const widgetId = generateId();
 * // => "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7"
 *
 * @example
 * // Using in widget creation
 * const newWidget: Widget = {
 *   id: generateId(),
 *   type: 'link',
 *   // ... other properties
 * };
 *
 * @example
 * // Using in page cloning/duplication
 * const clonedPage = {
 *   ...page,
 *   id: generateId(), // New unique ID for cloned page
 *   widgets: page.widgets.map(w => ({
 *     ...w,
 *     id: generateId() // New ID for each widget
 *   }))
 * };
 *
 * @note This function is async-compatible but executes synchronously.
 *       Use it freely in event handlers and component render functions.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
 * @see https://www.rfc-editor.org/rfc/rfc4122
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Formats a Date object into a human-readable string using en-US locale.
 * Produces consistent date formatting across the application.
 *
 * Uses the Intl.DateTimeFormat API for internationalization support and
 * browser-native date formatting. The format is: "MMM D, YYYY" (e.g., "Jan 5, 2026")
 *
 * This function is useful for:
 * - Displaying widget/page creation/update timestamps
 * - Showing human-friendly dates in UI without external dependencies
 * - Consistent date formatting across the editor interface
 *
 * @param date - The Date object to format. Can be:
 *   - `new Date()` - Current date
 *   - `new Date('2026-01-05')` - ISO date string
 *   - `new Date(timestamp)` - Milliseconds since epoch
 *   - `page.createdAt` - Date property from objects
 * @returns Formatted date string with short month name, day, and year
 *
 * @example
 * formatDate(new Date('2026-01-05'))
 * // => "Jan 5, 2026"
 *
 * @example
 * // Display widget creation time
 * const widget: Widget = {
 *   id: '123',
 *   // ... other properties
 *   createdAt: new Date('2025-12-15')
 * };
 *
 * <p>Created: {formatDate(widget.createdAt)}</p>
 * // Renders: "Created: Dec 15, 2025"
 *
 * @example
 * // Display page last modified
 * <div className="text-sm text-gray-500">
 *   Last updated: {formatDate(page.updatedAt)}
 * </div>
 * // Renders: "Last updated: Jan 5, 2026"
 *
 * @example
 * // Format current time
 * const now = formatDate(new Date());
 * console.log(`Saved at ${now}`); // "Saved at Jan 5, 2026"
 *
 * @note The format is always "MMM D, YYYY" in en-US locale regardless of user's system locale
 * @note Empty or invalid dates may produce unexpected results; consider validation beforehand
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Truncates a string to a maximum length and appends ellipsis (...) if needed.
 * Useful for displaying long text in constrained UI spaces without wrapping.
 *
 * The function checks if the string exceeds the specified length and only adds
 * the ellipsis if truncation is necessary. The length parameter includes the
 * ellipsis, so a truncated result will be exactly `length` characters long.
 *
 * Common use cases:
 * - Link titles in widget cards that might be very long
 * - Page titles in breadcrumbs or headers
 * - Widget descriptions in lists or sidebars
 * - User-provided text in constrained spaces
 *
 * @param str - The string to potentially truncate
 * @param length - Maximum allowed length (including the "..." if added)
 *   For example: length=8 with "Hello World" becomes "Hello..." (8 chars)
 * @returns Original string if it fits, or truncated string with ellipsis appended
 *
 * @example
 * truncate("Hello World", 8)
 * // => "Hello..."  (5 chars + 3 chars ellipsis = 8 total)
 *
 * @example
 * truncate("Hi", 8)
 * // => "Hi"  (doesn't exceed 8 chars, no truncation needed)
 *
 * @example
 * // Link widget title truncation
 * <h4>{truncate(linkContent.title, 30)}</h4>
 * // "Visit My Amazing Personal Website" becomes "Visit My Amazing Personal W..."
 *
 * @example
 * // Page title in header with limited space
 * <span className="max-w-md">
 *   {truncate(page.title, 20)}
 * </span>
 * // "My Very Long Page Title" becomes "My Very Long Page T..."
 *
 * @example
 * // Building ellipsis progressively
 * const title = linkContent.title;
 * const displayTitle = window.innerWidth < 768
 *   ? truncate(title, 20)  // Mobile: shorter
 *   : truncate(title, 50); // Desktop: longer
 *
 * @note The function counts characters, not bytes. Multi-byte characters (emoji, etc.)
 *       are counted as 1 character each, so the visual width may vary.
 * @note Always test with real content to ensure truncation looks natural in your UI.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
