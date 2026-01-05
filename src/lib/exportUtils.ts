import type { Page } from '@/types';

/**
 * Exports a page as JSON file
 * @param page The page to export
 */
export function exportPageAsJSON(page: Page): void {
  const json = JSON.stringify(page, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${page.slug || 'page'}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a page as HTML file with inline styles
 * @param page The page to export
 */
export function exportPageAsHTML(page: Page): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.title}">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${page.style.fontFamily || 'Inter, sans-serif'};
      color: ${page.style.fontColor || '#000'};
      background: ${page.style.backgroundGradient || page.style.backgroundColor || '#fff'};
      min-height: 100vh;
    }
    
    .container {
      max-width: ${page.layout.maxWidth || 1200}px;
      margin: 0 auto;
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(${page.layout.columns || 4}, 1fr);
      gap: ${page.layout.columnGap || 16}px ${page.layout.rowGap || 16}px;
    }
    
    .widget {
      border-radius: ${page.style.widgetBorderRadius || 16}px;
      background: ${page.style.widgetBackground || '#fff'};
      padding: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Page exported from Zento</p>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${page.slug || 'page'}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports a page from JSON file
 * @param file The JSON file to import
 * @returns Promise resolving to the imported page
 */
export async function importPageFromJSON(file: File): Promise<Page> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const page: Page = JSON.parse(content);
        resolve(page);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Exports page config to clipboard
 * @param page The page to export
 */
export async function exportPageToClipboard(page: Page): Promise<void> {
  const json = JSON.stringify(page, null, 2);
  try {
    await navigator.clipboard.writeText(json);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Imports a page configuration from the clipboard
 * 
 * Reads JSON data from the clipboard and parses it into a Page object.
 * Requires clipboard read permission from the user.
 * 
 * @returns Promise resolving to the imported page object
 * @throws Error if clipboard access is denied or JSON is invalid
 * @example
 * try {
 *   const page = await importPageFromClipboard();
 *   console.log('Imported page:', page.title);
 * } catch (error) {
 *   console.error('Import failed:', error.message);
 * }
 */
export async function importPageFromClipboard(): Promise<Page> {
  try {
    const text = await navigator.clipboard.readText();
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to paste from clipboard or invalid JSON');
  }
}

/**
 * Creates a shareable link from page data (for future backend integration)
 * @param page The page to share
 * @returns The page data encoded for sharing
 */
export function createPageShareData(page: Page): string {
  const json = JSON.stringify(page);
  return btoa(json); // Base64 encode for URL-safe sharing
}

/**
 * Decodes a shared page link
 * @param encodedData The encoded page data
 * @returns The decoded page
 */
export function decodePageShareData(encodedData: string): Page {
  const json = atob(encodedData);
  return JSON.parse(json);
}
