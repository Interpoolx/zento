/**
 * Font Manager
 * Manages font storage, retrieval, and application to pages and widgets
 * Handles both system fonts and custom font uploads
 */

import { generateGoogleFontsImport, generateCustomFontFaceRule } from './googleFontsAPI';

export interface ManagedFont {
  id: string;
  name: string;
  family: string;
  category: 'system' | 'google' | 'custom';
  source?: string; // URL for Google Fonts or custom fonts
  variants?: string[];
  uploadedAt?: Date;
  isActive?: boolean;
}

export interface FontCache {
  fonts: ManagedFont[];
  lastUpdated: Date;
}

const FONT_STORAGE_KEY = 'zento-managed-fonts';

/**
 * Saves managed fonts to local storage
 * 
 * @param fonts - Array of managed fonts
 */
export function saveManagedFonts(fonts: ManagedFont[]): void {
  try {
    const cache: FontCache = {
      fonts,
      lastUpdated: new Date(),
    };
    localStorage.setItem(FONT_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    console.error('Failed to save managed fonts to localStorage');
  }
}

/**
 * Retrieves managed fonts from local storage
 * 
 * @returns Array of managed fonts
 */
export function loadManagedFonts(): ManagedFont[] {
  try {
    const cached = localStorage.getItem(FONT_STORAGE_KEY);
    if (!cached) return [];

    const cache: FontCache = JSON.parse(cached);
    return cache.fonts || [];
  } catch {
    console.error('Failed to load managed fonts from localStorage');
    return [];
  }
}

/**
 * Adds a new managed font
 * 
 * @param font - Font to add
 */
export function addManagedFont(font: ManagedFont): void {
  const fonts = loadManagedFonts();
  
  // Check if font already exists
  if (fonts.find(f => f.id === font.id)) {
    console.warn(`Font with id ${font.id} already exists`);
    return;
  }

  fonts.push({
    ...font,
    uploadedAt: new Date(),
  });

  saveManagedFonts(fonts);
}

/**
 * Removes a managed font
 * 
 * @param fontId - ID of font to remove
 */
export function removeManagedFont(fontId: string): void {
  const fonts = loadManagedFonts();
  const filtered = fonts.filter(f => f.id !== fontId);
  saveManagedFonts(filtered);
}

/**
 * Updates a managed font
 * 
 * @param fontId - ID of font to update
 * @param updates - Partial font object with updates
 */
export function updateManagedFont(fontId: string, updates: Partial<ManagedFont>): void {
  const fonts = loadManagedFonts();
  const updated = fonts.map(f =>
    f.id === fontId ? { ...f, ...updates } : f
  );
  saveManagedFonts(updated);
}

/**
 * Gets a managed font by ID
 * 
 * @param fontId - Font ID
 * @returns Managed font or undefined
 */
export function getManagedFont(fontId: string): ManagedFont | undefined {
  const fonts = loadManagedFonts();
  return fonts.find(f => f.id === fontId);
}

/**
 * Activates a font for the current page
 * Injects CSS @import or @font-face rules into the document
 * 
 * @param font - Font to activate
 */
export function activateFont(font: ManagedFont): void {
  const styleId = `font-${font.id}`;

  // Check if already injected
  if (document.getElementById(styleId)) {
    return;
  }

  // Create style element
  const style = document.createElement('style');
  style.id = styleId;

  // Generate appropriate CSS based on font category
  let cssText = '';
  switch (font.category) {
    case 'google':
      if (font.source && font.variants) {
        cssText = generateGoogleFontsImport(font.name, font.variants);
      }
      break;
    case 'custom':
      if (font.source) {
        cssText = generateCustomFontFaceRule(font.family, font.source);
      }
      break;
    case 'system':
      // System fonts don't need CSS injection
      return;
  }

  style.textContent = cssText;
  document.head.appendChild(style);

  // Mark as active
  updateManagedFont(font.id, { isActive: true });
}

/**
 * Deactivates a font by removing its CSS rules
 * 
 * @param fontId - ID of font to deactivate
 */
export function deactivateFont(fontId: string): void {
  const styleElement = document.getElementById(`font-${fontId}`);
  if (styleElement) {
    styleElement.remove();
  }

  updateManagedFont(fontId, { isActive: false });
}

/**
 * Gets all active fonts
 * 
 * @returns Array of active managed fonts
 */
export function getActiveFonts(): ManagedFont[] {
  const fonts = loadManagedFonts();
  return fonts.filter(f => f.isActive);
}

/**
 * Applies font to an element by updating its font-family CSS
 * 
 * @param element - DOM element to apply font to
 * @param fontFamily - Font family string
 */
export function applyFontToElement(element: HTMLElement, fontFamily: string): void {
  element.style.fontFamily = fontFamily;
}

/**
 * Uploads a custom font file to R2 storage
 * This is a placeholder - actual implementation depends on backend
 * 
 * @param file - Font file to upload
 * @param fileName - Optional custom file name
 * @returns URL of uploaded font
 */
export async function uploadCustomFont(file: File, fileName?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  if (fileName) {
    formData.append('fileName', fileName);
  }

  try {
    const response = await fetch('/api/fonts/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Font upload failed:', error);
    throw error;
  }
}

/**
 * Validates a font file
 * Checks file type and size
 * 
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Validation result with error message if invalid
 */
export function validateFontFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const validMimeTypes = [
    'font/woff',
    'font/woff2',
    'font/ttf',
    'font/otf',
    'application/font-woff',
    'application/font-woff2',
  ];

  const validExtensions = ['.woff', '.woff2', '.ttf', '.otf'];
  const maxBytes = maxSizeMB * 1024 * 1024;

  // Check file extension
  const hasValidExtension = validExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid font format. Supported: ${validExtensions.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check MIME type (optional, as some browsers may not set it correctly)
  if (file.type && !validMimeTypes.includes(file.type)) {
    console.warn(`Unexpected MIME type: ${file.type}`);
  }

  return { valid: true };
}

/**
 * Creates a custom font object from upload
 * 
 * @param file - Uploaded font file
 * @param name - Display name for the font
 * @param url - URL where the font is hosted
 * @returns Managed font object
 */
export function createCustomManagedFont(
  file: File,
  name: string,
  url: string
): ManagedFont {
  return {
    id: `custom-${Date.now()}`,
    name: name || file.name.split('.')[0],
    family: `"${name}"`,
    category: 'custom',
    source: url,
    uploadedAt: new Date(),
    isActive: false,
  };
}

/**
 * Clears all font storage
 */
export function clearFontStorage(): void {
  localStorage.removeItem(FONT_STORAGE_KEY);
  
  // Remove all font style elements from document
  document.querySelectorAll('style[id^="font-"]').forEach(el => el.remove());
}
