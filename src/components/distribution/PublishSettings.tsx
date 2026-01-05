import { useState } from 'react';
import { useDistributionStore } from '@/store/distributionStore';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Globe, Copy } from 'lucide-react';

interface PublishSettingsProps {
  pageId: string;
  pageTitle: string;
  slug?: string;
  isPublished?: boolean;
  onPublish?: (slug: string) => void;
  onUnpublish?: () => void;
}

/**
 * Component for managing page publishing settings including slug, custom domain, and short links.
 * @param props - Component props
 * @param props.pageId - Unique identifier of the page
 * @param props.pageTitle - Title of the page used for generating default slug
 * @param props.slug - Optional initial slug value
 * @param props.isPublished - Optional initial publish state
 * @param props.onPublish - Callback fired when page is published with the slug
 * @param props.onUnpublish - Callback fired when page is unpublished
 * @returns Publish settings form with URL configuration and domain options
 */
export function PublishSettings({
  pageId,
  pageTitle,
  slug: initialSlug,
  isPublished: initialPublished,
  onPublish,
  onUnpublish,
}: PublishSettingsProps) {
  const { validateSlug, publishPage, unpublishPage, createDistribution, getDistribution, setCustomDomain, generateShortLink } =
    useDistributionStore();

  const distribution = getDistribution(pageId);
  const [slug, setSlug] = useState(initialSlug || distribution?.slug || pageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'));
  const [isPublished, setIsPublished] = useState(initialPublished || distribution?.isPublished || false);
  const [customDomain, setCustomDomainInput] = useState(distribution?.customDomain || '');
  const [shortLink, setShortLinkInput] = useState(distribution?.shortLink || '');
  const [validation, setValidation] = useState<ReturnType<typeof validateSlug> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  /**
   * Handles slug input changes and validates the new slug value.
   * @param newSlug - The new slug value entered by the user
   */
  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
    const result = validateSlug(newSlug);
    setValidation(result);
  };

  /**
   * Publishes the page if the slug is valid.
   * Creates a new distribution if one doesn't exist, then marks the page as published.
   */
  const handlePublish = () => {
    if (!validation?.isValid) return;

    if (!distribution) {
      createDistribution(pageId, slug);
    }

    publishPage(pageId);
    setIsPublished(true);
    onPublish?.(slug);
  };

  /**
   * Unpublishes the page, making it private again.
   * Updates local state and triggers the onUnpublish callback.
   */
  const handleUnpublish = () => {
    unpublishPage(pageId);
    setIsPublished(false);
    onUnpublish?.();
  };

  /**
   * Generates a shortened URL for the page for easy sharing.
   * Uses the current origin as the base URL with /s prefix.
   */
  const handleGenerateShortLink = () => {
    const link = generateShortLink(pageId, `${window.location.origin}/s`);
    setShortLinkInput(link);
  };

  /**
   * Sets a custom domain for the page distribution.
   */
  const handleSetCustomDomain = () => {
    setCustomDomain(pageId, customDomain);
  };

  /**
   * Copies text to clipboard and shows a temporary "copied" indicator.
   * @param text - The text to copy to clipboard
   * @param id - Identifier for tracking which item was copied (for UI feedback)
   */
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const pageUrl = `${window.location.origin}/${slug}`;
  const customUrl = customDomain ? `https://${customDomain}` : null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Publish Settings</h3>
        <p className="text-sm text-gray-600">Control how your page is shared and accessed</p>
      </div>

      {/* Publish Status */}
      <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-primary-900">
              {isPublished ? '🟢 Published' : '🔴 Unpublished'}
            </p>
            <p className="text-sm text-primary-700 mt-1">
              {isPublished
                ? `Live at ${pageUrl}`
                : 'Your page is private. Publish to share it.'}
            </p>
          </div>

          {isPublished ? (
            <button
              onClick={handleUnpublish}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={!validation?.isValid}
              className={cn(
                'px-4 py-2 rounded-lg font-semibold transition-colors',
                validation?.isValid
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              )}
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {/* URL Configuration */}
      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold">URL Configuration</h4>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium mb-2">Page Slug</label>
          <div className="flex gap-2 mb-2">
            <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
              {window.location.origin}/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my-page"
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border text-sm',
                validation
                  ? validation.isValid && validation.isAvailable
                    ? 'border-green-200 focus:ring-green-500'
                    : 'border-red-200 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-primary-500',
                'focus:outline-none focus:ring-2 transition-all'
              )}
            />
          </div>

          {validation && (
            <div className={cn('text-sm flex items-start gap-2', validation.isValid ? 'text-green-600' : 'text-red-600')}>
              {validation.isValid ? <Check className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
              <div>
                {validation.errors.length > 0 ? (
                  <ul className="space-y-1">
                    {validation.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                ) : (
                  <p>✓ Slug is available</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Unique Page URL */}
        {isPublished && (
          <div>
            <label className="block text-sm font-medium mb-2">Page URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={pageUrl}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
              />
              <button
                onClick={() => handleCopy(pageUrl, 'page-url')}
                className={cn(
                  'px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2',
                  copied === 'page-url'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                <Copy className="w-4 h-4" />
                {copied === 'page-url' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Domain */}
      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Custom Domain
        </h4>

        <div>
          <label className="block text-sm font-medium mb-2">Domain</label>
          <div className="flex gap-2">
            <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">https://</span>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomainInput(e.target.value)}
              placeholder="yourdomain.com"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSetCustomDomain}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Set
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Custom domains require DNS configuration. Contact support for setup.
          </p>
        </div>

        {customUrl && (
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={customUrl}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
            />
            <button
              onClick={() => handleCopy(customUrl, 'custom-url')}
              className={cn(
                'px-4 py-2 rounded-lg font-semibold transition-all',
                copied === 'custom-url'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Short Link */}
      {isPublished && (
        <div className="space-y-4 border-t pt-6">
          <h4 className="font-semibold">Short Link</h4>

          {shortLink ? (
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shortLink}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
              />
              <button
                onClick={() => handleCopy(shortLink, 'short-link')}
                className={cn(
                  'px-4 py-2 rounded-lg font-semibold transition-all',
                  copied === 'short-link'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateShortLink}
              className="w-full px-4 py-3 bg-primary-100 text-primary-600 rounded-lg font-semibold hover:bg-primary-200 transition-colors"
            >
              Generate Short Link
            </button>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">Publishing Tips</p>
            <ul className="text-xs text-blue-800 mt-2 space-y-1">
              <li>• Choose a memorable slug for easy sharing</li>
              <li>• Custom domains require DNS configuration</li>
              <li>• Short links are great for social media</li>
              <li>• Once published, your page is publicly visible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
