import { Code2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { getCurrentTheme } from '@/store/themeStore';
import { useEditorStore } from '@/store/editorStore';
import { generateThemeStylesheet, cssVariablesToString, generateAllCSSVariables } from '@/lib/cssVariablesGenerator';

interface CSSVariablesEditorProps {
  label?: string;
}

/**
 * CSS Variables editor component for viewing and copying theme-generated CSS
 * Shows CSS custom properties that can be used to style pages
 * 
 * @param label - Optional label for the editor
 */
export function CSSVariablesEditor({ label = 'CSS Variables' }: CSSVariablesEditorProps) {
  const currentTheme = getCurrentTheme();
  const { page } = useEditorStore();
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'variables' | 'stylesheet' | 'all'>('variables');

  const stylesheet = generateThemeStylesheet(currentTheme, page.style);
  const allVars = generateAllCSSVariables(currentTheme, page.style);
  const varString = cssVariablesToString(allVars);

  const contentToCopy = mode === 'variables' ? varString : (mode === 'stylesheet' ? stylesheet : `${varString}\n\n/* Stylesheet */\n\n${stylesheet}`);

  /**
   * Copies the current CSS content to clipboard and shows a success indicator.
   * Handles clipboard API errors gracefully.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gray-500" />
          {label}
        </label>
        <div className="flex gap-1">
          {(['variables', 'stylesheet', 'all'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 text-xs rounded font-medium transition-colors ${mode === m
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {m === 'variables' ? 'Vars' : m === 'stylesheet' ? 'CSS' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Code Preview */}
      <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
        <pre className="text-xs font-mono text-gray-100 whitespace-pre-wrap break-words">
          {contentToCopy}
        </pre>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded font-medium transition-colors flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy {mode === 'variables' ? 'Variables' : 'Stylesheet'}
          </>
        )}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 leading-relaxed">
        {mode === 'variables'
          ? 'CSS custom properties (CSS variables) generated from your theme. Use these in your own CSS.'
          : mode === 'stylesheet'
            ? 'Complete CSS stylesheet with theme variables and utility classes. Paste this into a style tag.'
            : 'Complete CSS variables and stylesheet combined. Includes all theme properties and styling rules.'}
      </p>
    </div>
  );
}
