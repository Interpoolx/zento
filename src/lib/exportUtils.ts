import type { Page, Widget } from '@/types';
import { generateAllCSSVariables } from './cssVariablesGenerator';
import { getCurrentTheme } from '@/store/themeStore';

/**
 * Generates a self-contained HTML string for the current page.
 * Includes all widgets and theme-based styling.
 */
export function generatePageHTML(page: Page): string {
  const cssVariables = generateAllCSSVariables(getCurrentTheme(), page.style);
  const variableString = Object.entries(cssVariables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            ${variableString}
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: ${page.style.fontFamily}, sans-serif;
            background: ${page.style.backgroundGradient || page.style.backgroundColor};
            color: ${page.style.fontColor};
            min-height: 100vh;
            display: flex;
            justify-content: center;
        }

        .canvas {
            width: 100%;
            max-width: ${page.layout?.maxWidth || 1200}px;
            padding: 48px 20px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: ${page.layout?.columnGap || 16}px;
        }

        @media (max-width: 768px) {
            .canvas {
                grid-template-columns: repeat(2, 1fr);
                padding: 20px;
            }
        }

        .widget {
            background: var(--widget-background, #ffffff);
            border-radius: var(--widget-radius, 24px);
            padding: 24px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            overflow: hidden;
        }

        /* Basic Widget Styles */
        .widget-text h2 { margin-top: 0; }
        .widget-link a { color: var(--color-primary); text-decoration: none; font-weight: 600; }
        .widget-image img { width: 100%; border-radius: 12px; }
    </style>
</head>
<body>
    <div class="canvas">
        ${page.widgets.map(w => renderWidgetHTML(w)).join('\n')}
    </div>
</body>
</html>
  `.trim();
}

/**
 * Simple HTML renderer for widgets in the exported file.
 */
function renderWidgetHTML(widget: Widget): string {
  const gridSpan = widget.size === 'large' ? 'grid-column: span 2; grid-row: span 2;' :
    widget.size === 'wide' ? 'grid-column: span 2;' :
      widget.size === 'tall' ? 'grid-row: span 2;' : '';

  let content = '';
  switch (widget.content.type) {
    case 'text':
      content = `<div>${widget.content.data.content || ''}</div>`;
      break;
    case 'link':
      content = `<a href="${widget.content.data.url}" target="_blank">${widget.content.data.title || 'Visit Link'}</a>`;
      break;
    case 'image':
      content = `<img src="${widget.content.data.url}" alt="${widget.content.data.alt || ''}">`;
      break;
    default:
      content = `<p>${widget.type} widget placeholder</p>`;
  }

  return `<div class="widget widget-${widget.type}" style="${gridSpan}">${content}</div>`;
}

/**
 * Triggers a browser download for the generated HTML.
 */
export function downloadPageAsHTML(page: Page) {
  const html = generatePageHTML(page);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${page.slug || 'my-page'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
