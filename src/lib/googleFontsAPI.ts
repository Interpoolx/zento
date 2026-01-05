/**
 * Google Fonts API Integration
 * Provides utilities for working with Google Fonts in the Zento editor
 * Includes font fetching, caching, and CSS generation
 */

export interface GoogleFont {
  family: string;
  variants: string[];
  category: string;
  version: string;
  lastModified: string;
  files: Record<string, string>;
}

export interface GoogleFontsResponse {
  kind: string;
  items: GoogleFont[];
}

const GOOGLE_FONTS_API_KEY = 'AIzaSyD-c8N5nJ9cKqMvV8n8XqP1qQ2rS3tU4vW5';
const GOOGLE_FONTS_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';
const CACHE_KEY = 'zento-google-fonts-cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CachedFonts {
  timestamp: number;
  fonts: GoogleFont[];
}

/**
 * Fetches available Google Fonts from the API
 * Uses local cache if available and not expired
 * 
 * @returns Array of available Google Fonts
 */
export async function fetchGoogleFonts(): Promise<GoogleFont[]> {
  try {
    // Check cache first
    const cached = getGoogleFontsCache();
    if (cached) {
      return cached;
    }

    // Fetch from API
    const response = await fetch(
      `${GOOGLE_FONTS_API_URL}?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
    );

    if (!response.ok) {
      throw new Error(`Google Fonts API error: ${response.statusText}`);
    }

    const data: GoogleFontsResponse = await response.json();
    const fonts = data.items || [];

    // Cache the results
    setGoogleFontsCache(fonts);

    return fonts;
  } catch (error) {
    console.error('Failed to fetch Google Fonts:', error);
    return [];
  }
}

/**
 * Generates a Google Fonts import statement for a given font
 * 
 * @param fontFamily - Font family name (e.g., 'Open Sans')
 * @param variants - Array of font variants (e.g., ['400', '700'])
 * @returns CSS import statement ready for use
 */
export function generateGoogleFontsImport(fontFamily: string, variants: string[] = ['400']): string {
  const encodedFamily = fontFamily.replace(/\s+/g, '+');
  const variantString = variants.join(';');
  return `@import url('https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${variantString}');`;
}

/**
 * Generates a Google Fonts link tag for embedding in HTML head
 * 
 * @param fontFamily - Font family name (e.g., 'Open Sans')
 * @param variants - Array of font variants (e.g., ['400', '700'])
 * @returns HTML link tag string
 */
export function generateGoogleFontsLink(fontFamily: string, variants: string[] = ['400']): string {
  const encodedFamily = fontFamily.replace(/\s+/g, '+');
  const variantString = variants.join(';');
  return `<link href="https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${variantString}" rel="stylesheet">`;
}

/**
 * Creates a CSS font-face rule for a custom font file
 * 
 * @param fontFamily - Name for the font family
 * @param fontUrl - URL to the font file
 * @param fontWeight - Font weight (default: 400)
 * @param fontStyle - Font style (normal or italic, default: normal)
 * @returns CSS font-face rule
 */
export function generateCustomFontFaceRule(
  fontFamily: string,
  fontUrl: string,
  fontWeight: string | number = 400,
  fontStyle: 'normal' | 'italic' = 'normal'
): string {
  // Detect font format from file extension
  const extension = fontUrl.split('.').pop()?.toLowerCase();
  let format = '';
  switch (extension) {
    case 'woff2':
      format = 'woff2';
      break;
    case 'woff':
      format = 'woff';
      break;
    case 'ttf':
      format = 'truetype';
      break;
    case 'otf':
      format = 'opentype';
      break;
    default:
      format = 'woff2'; // Default to woff2
  }

  return `
@font-face {
  font-family: '${fontFamily}';
  src: url('${fontUrl}') format('${format}');
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  font-display: swap;
}`;
}

/**
 * Parses Google Fonts variant string (e.g., '400', '700italic')
 * Returns separate weight and style
 * 
 * @param variant - Variant string from Google Fonts API
 * @returns Object with weight and style
 */
export function parseGoogleFontsVariant(variant: string): { weight: string; style: string } {
  const isItalic = variant.includes('italic');
  const weight = variant.replace('italic', '');

  return {
    weight: weight || '400',
    style: isItalic ? 'italic' : 'normal',
  };
}

/**
 * Gets cached Google Fonts if available and not expired
 * 
 * @returns Cached fonts array or null if expired/not found
 */
function getGoogleFontsCache(): GoogleFont[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedFonts = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has expired
    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.fonts;
  } catch {
    return null;
  }
}

/**
 * Saves Google Fonts to cache
 * 
 * @param fonts - Array of Google Fonts to cache
 */
function setGoogleFontsCache(fonts: GoogleFont[]): void {
  try {
    const data: CachedFonts = {
      timestamp: Date.now(),
      fonts,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Clears the Google Fonts cache
 */
export function clearGoogleFontsCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

/**
 * Searches for fonts matching a query string
 * 
 * @param query - Search query
 * @param fonts - Array of fonts to search through
 * @returns Filtered array of matching fonts
 */
export function searchGoogleFonts(query: string, fonts: GoogleFont[]): GoogleFont[] {
  const lowerQuery = query.toLowerCase();
  return fonts.filter(
    (font) =>
      font.family.toLowerCase().includes(lowerQuery) ||
      font.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Groups fonts by category
 * 
 * @param fonts - Array of Google Fonts
 * @returns Object with categories as keys and font arrays as values
 */
export function groupFontsByCategory(
  fonts: GoogleFont[]
): Record<string, GoogleFont[]> {
  return fonts.reduce(
    (acc, font) => {
      const category = font.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(font);
      return acc;
    },
    {} as Record<string, GoogleFont[]>
  );
}
