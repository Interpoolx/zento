import { Code2, Copy, AlertTriangle, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { validateCustomCSS, minifyCSS, formatCSS, generateSecurityReport } from '@/lib/cssValidator';
import { createScopedBlock } from '@/lib/cssScopingEngine';

interface CustomCSSEditorProps {
  value: string;
  onChange: (css: string) => void;
  pageId?: string;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  label?: string;
}

/**
 * Custom CSS Editor component
 * Allows users to write custom CSS with validation, scoping, and security warnings
 *
 * @param value - Current CSS code
 * @param onChange - Callback when CSS changes
 * @param pageId - Page ID for CSS scoping
 * @param enabled - Whether custom CSS is enabled
 * @param onEnabledChange - Callback when enabled state changes
 * @param label - Optional label
 */
export function CustomCSSEditor({
  value,
  onChange,
  pageId = 'page-1',
  enabled = true,
  onEnabledChange,
  label = 'Custom CSS',
}: CustomCSSEditorProps) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview' | 'report'>('edit');
  const [minified, setMinified] = useState('');
  const [scopedPreview, setScopedPreview] = useState('');

  // Validate and generate previews
  const validation = validateCustomCSS(value);
  const report = generateSecurityReport(value);
  const scoped = createScopedBlock(value, pageId);

  useEffect(() => {
    if (value) {
      setMinified(minifyCSS(value));
      setScopedPreview(scoped);
    }
  }, [value, pageId, scoped]);

  /**
   * Copies text to clipboard and shows a temporary success indicator.
   * @param text - The text content to copy
   */
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  /**
   * Formats the current CSS code using the formatCSS utility.
   */
  const handleFormat = () => {
    onChange(formatCSS(value));
  };

  /**
   * Clears all CSS content after user confirmation.
   */
  const handleClear = () => {
    if (confirm('Are you sure you want to clear all CSS?')) {
      onChange('');
    }
  };

  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gray-500" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onEnabledChange?.(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-xs font-medium text-gray-700">Enabled</span>
          </label>
        </div>
      </div>

      {!enabled && (
        <div className="p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm text-gray-600">
            Custom CSS is disabled. Enable it above to start writing CSS for your page.
          </p>
        </div>
      )}

      {enabled && (
        <>
          {/* Mode Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['edit', 'preview', 'report'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${mode === m
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-700 hover:bg-white hover:bg-opacity-50'
                  }`}
              >
                {m === 'edit' ? '✏️ Edit' : m === 'preview' ? '👁️ Preview' : '⚠️ Report'}
              </button>
            ))}
          </div>

          {/* Editor/Preview Area */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-900">
            {mode === 'edit' && (
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-96 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none border-0"
                placeholder="/* Write your custom CSS here */&#10;.my-selector {&#10;  color: #fff;&#10;}"
                spellCheck="false"
              />
            )}

            {mode === 'preview' && (
              <pre className="w-full h-96 p-4 text-gray-100 font-mono text-xs overflow-auto">
                {scopedPreview || '/* No CSS to preview */'}
              </pre>
            )}

            {mode === 'report' && (
              <div className="w-full h-96 p-4 text-gray-100 font-mono text-xs overflow-auto">
                <div className="space-y-4">
                  {/* Risk Level */}
                  <div>
                    <p className="font-bold mb-2">
                      Risk Level:{' '}
                      <span
                        className={`${report.riskLevel === 'high'
                            ? 'text-red-400'
                            : report.riskLevel === 'medium'
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}
                      >
                        {report.riskLevel.toUpperCase()}
                      </span>
                    </p>
                  </div>

                  {/* Issues */}
                  {report.issues.length > 0 && (
                    <div>
                      <p className="font-bold mb-2">Issues ({report.issues.length})</p>
                      <ul className="space-y-1 text-xs">
                        {report.issues.map((issue, i) => (
                          <li
                            key={i}
                            className={`${issue.severity === 'error'
                                ? 'text-red-400'
                                : issue.severity === 'warning'
                                  ? 'text-yellow-400'
                                  : 'text-blue-400'
                              }`}
                          >
                            [{issue.severity.toUpperCase()}] {issue.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.recommendations.length > 0 && (
                    <div>
                      <p className="font-bold mb-2">Recommendations</p>
                      <ul className="space-y-1 text-xs text-green-400">
                        {report.recommendations.map((rec, i) => (
                          <li key={i}>✓ {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-gray-600">
              <span>Lines: {value.split('\n').length}</span>
              <span>Characters: {value.length}</span>
              <span>Minified: {minified.length} chars</span>
            </div>

            <div className="flex items-center gap-2">
              {hasErrors ? (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  {validation.errors.length} errors
                </div>
              ) : hasWarnings ? (
                <div className="flex items-center gap-1 text-yellow-600">
                  <AlertCircle className="w-4 h-4" />
                  {validation.warnings.length} warnings
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Valid
                </div>
              )}
            </div>
          </div>

          {/* Validation Warnings/Errors */}
          {(hasErrors || hasWarnings) && (
            <div
              className={`p-3 rounded border ${hasErrors
                  ? 'border-red-200 bg-red-50'
                  : 'border-yellow-200 bg-yellow-50'
                }`}
            >
              {hasErrors && (
                <div>
                  <p className="text-xs font-semibold text-red-800 mb-1">Errors:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {validation.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {hasWarnings && !hasErrors && (
                <div>
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Warnings:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {validation.warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleFormat}
              className="flex-1 px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
            >
              Format
            </button>
            <button
              onClick={() => handleCopy(minified)}
              className="flex-1 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Minified
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Security Warning */}
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded">
            <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">
              <p className="font-semibold mb-1">⚠️ Security Notice</p>
              <p>
                Custom CSS has access to your page layout. Ensure you trust the source.
                Your CSS will be scoped to prevent breaking your page layout.
              </p>
            </div>
          </div>

          {/* Documentation */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            <p className="font-semibold mb-1">ℹ️ CSS Restrictions</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>External imports (@import) are not allowed</li>
              <li>Fixed/sticky positioning is restricted</li>
              <li>CSS is automatically scoped to your page</li>
              <li>JavaScript in CSS URLs will be blocked</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
