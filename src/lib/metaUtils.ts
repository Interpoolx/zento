import type { Page } from '@/types';

/**
 * Update page title
 * @param title The page title
 */
export function setPageTitle(title: string): void {
  document.title = title;
  updateMetaTag('og:title', title);
  updateMetaTag('twitter:title', title);
}

/**
 * Update page description
 * @param description The page description
 */
export function setPageDescription(description: string): void {
  updateMetaTag('description', description);
  updateMetaTag('og:description', description);
  updateMetaTag('twitter:description', description);
}

/**
 * Update Open Graph image
 * @param imageUrl The image URL
 */
export function setOGImage(imageUrl: string): void {
  updateMetaTag('og:image', imageUrl);
  updateMetaTag('twitter:image', imageUrl);
}

/**
 * Update Open Graph URL
 * @param url The page URL
 */
export function setOGUrl(url: string): void {
  updateMetaTag('og:url', url);
}

/**
 * Set Twitter card type
 * @param cardType Type of Twitter card (summary, summary_large_image, app, player)
 */
export function setTwitterCard(cardType: string = 'summary_large_image'): void {
  updateMetaTag('twitter:card', cardType);
}

/**
 * Set Twitter creator handle
 * @param handle Twitter handle without @
 */
export function setTwitterHandle(handle: string): void {
  updateMetaTag('twitter:creator', `@${handle}`);
}

/**
 * Update favicon from URL
 * @param url The favicon URL
 */
export function setFaviconFromUrl(url: string): void {
  let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;

  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  favicon.href = url;
}

/**
 * Update favicon as base64 data URL
 * @param dataUrl Base64 encoded image data
 */
export function setFaviconFromData(dataUrl: string): void {
  let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;

  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  favicon.href = dataUrl;
}

/**
 * Fetch favicon from website and set it
 * @param url The website URL
 */
export async function setFaviconFromWebsite(url: string): Promise<void> {
  try {
    // Try common favicon locations
    const domain = new URL(url).origin;

    // Try /favicon.ico first
    const faviconUrl = `${domain}/favicon.ico`;
    const response = await fetch(faviconUrl, { mode: 'no-cors' });

    if (response.ok) {
      setFaviconFromUrl(faviconUrl);
    } else {
      // Fallback to Google favicon service
      const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      setFaviconFromUrl(googleFavicon);
    }
  } catch (error) {
    console.warn('Failed to fetch favicon:', error);
    // Use Google favicon service as fallback
    try {
      const domain = new URL(url).origin;
      const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      setFaviconFromUrl(googleFavicon);
    } catch {
      console.warn('Failed to set fallback favicon');
    }
  }
}

/**
 * Apply complete meta tags configuration from page data
 * @param page The page object
 * @param domain The domain URL for og:url (optional)
 */
export function applyPageMetaTags(page: Page, domain?: string): void {
  setPageTitle(page.title || 'My Profile');
  
  const description = page.title || 'My amazing profile page';
  setPageDescription(description);

  // Set OG image if available
  if (page.style?.ogImage) {
    setOGImage(page.style.ogImage);
  }

  // Set OG URL if domain provided
  if (domain) {
    const ogUrl = `${domain}/${page.slug}`;
    setOGUrl(ogUrl);
  }

  // Set Twitter card
  setTwitterCard('summary_large_image');

  // Set favicon if available
  if (page.style?.favicon) {
    setFaviconFromUrl(page.style.favicon);
  }
}

/**
 * Helper to update or create a meta tag
 * @param name Meta tag name (without 'meta:' prefix)
 * @param content The content value
 */
function updateMetaTag(name: string, content: string): void {
  let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    
    // Use property for og: and twitter: tags, name for others
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }

    document.head.appendChild(meta);
  }

  meta.content = content;
}

/**
 * Generate structured data (JSON-LD) for the page
 * @param page The page object
 * @param domain The domain URL
 * @returns JSON-LD object
 */
export function generateStructuredData(page: Page, domain?: string) {
  const url = domain ? `${domain}/${page.slug}` : window.location.href;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: page.title,
    description: page.title,
    url: url,
    image: page.style?.ogImage,
  };
}

/**
 * Apply structured data to page
 * @param structuredData The structured data object
 */
export function applyStructuredData(structuredData: Record<string, unknown>): void {
  let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;

  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(structuredData);
}
