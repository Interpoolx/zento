import { useState } from 'react';
import { useDistributionStore } from '@/store/distributionStore';
import { cn } from '@/lib/utils';
import { AlertCircle, Check } from 'lucide-react';
import type { PageMetaTags } from '@/types';

interface SEOSettingsProps {
  pageId: string;
  pageTitle: string;
  initialTags?: PageMetaTags;
}

/**
 * Component for managing SEO meta tags including title, description, keywords, and social sharing settings.
 * @param props - Component props
 * @param props.pageId - Unique identifier of the page
 * @param props.pageTitle - Default title for the page
 * @param props.initialTags - Optional initial meta tag values
 * @returns SEO settings form with Open Graph and Twitter Card configuration
 */
export function SEOSettings({ pageId, pageTitle, initialTags }: SEOSettingsProps) {
  const { setMetaTags, getMetaTags } = useDistributionStore();
  const [formData, setFormData] = useState<PageMetaTags>(
    initialTags || getMetaTags(pageId) || {
      pageId,
      title: pageTitle,
      description: '',
      keywords: [],
      twitterCard: 'summary',
    }
  );
  const [saved, setSaved] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  /**
   * Saves the current SEO settings to the distribution store.
   * Shows a temporary "saved" indicator for user feedback.
   */
  const handleSave = () => {
    setMetaTags(pageId, formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /**
   * Adds a new keyword to the keywords list if it's not already present.
   * Clears the keyword input field after adding.
   */
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...(formData.keywords || []), keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  /**
   * Removes a keyword from the keywords list.
   * @param keyword - The keyword to remove
   */
  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords?.filter(k => k !== keyword) || [],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">SEO Settings</h3>
        <p className="text-sm text-gray-600">Configure how your page appears in search results</p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Page Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            maxLength={60}
            placeholder="Enter page title (50-60 chars)"
            className={cn(
              'w-full px-3 py-2 rounded-lg border border-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'transition-all'
            )}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.title.length}/60 characters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Meta Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            maxLength={160}
            placeholder="Enter meta description (150-160 chars)"
            className={cn(
              'w-full px-3 py-2 rounded-lg border border-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'transition-all resize-none h-20'
            )}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/160 characters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Keywords</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="Add keywords (comma separated)"
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border border-gray-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                'transition-all'
              )}
            />
            <button
              onClick={addKeyword}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.keywords?.map((keyword) => (
              <div
                key={keyword}
                className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Graph */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h4 className="font-semibold mb-3">Open Graph (Social Sharing)</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">OG Title</label>
              <input
                type="text"
                value={formData.ogTitle || formData.title}
                onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                placeholder="Title for social sharing"
                className={cn(
                  'w-full px-3 py-2 rounded-lg border border-gray-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">OG Description</label>
              <textarea
                value={formData.ogDescription || formData.description}
                onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                placeholder="Description for social sharing"
                className={cn(
                  'w-full px-3 py-2 rounded-lg border border-gray-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-16'
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">OG Image URL</label>
              <input
                type="url"
                value={formData.ogImage || formData.ogImage || ''}
                onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className={cn(
                  'w-full px-3 py-2 rounded-lg border border-gray-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
              />
              {formData.ogImage && (
                <img
                  src={formData.ogImage}
                  alt="OG Preview"
                  className="mt-2 max-w-xs rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Twitter Card */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h4 className="font-semibold mb-3">Twitter Card</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Card Type</label>
              <select
                value={formData.twitterCard || 'summary'}
                onChange={(e) => setFormData({ ...formData, twitterCard: e.target.value as PageMetaTags['twitterCard'] })}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border border-gray-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
                <option value="player">Player</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter Creator (@username)</label>
              <input
                type="text"
                value={formData.twitterCreator || ''}
                onChange={(e) => setFormData({ ...formData, twitterCreator: e.target.value })}
                placeholder="@yourhandle"
                className={cn(
                  'w-full px-3 py-2 rounded-lg border border-gray-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={cn(
          'w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
          saved
            ? 'bg-green-100 text-green-600'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        )}
      >
        {saved ? (
          <>
            <Check className="w-5 h-5" />
            Saved
          </>
        ) : (
          'Save SEO Settings'
        )}
      </button>

      {/* Preview Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">SEO Tips</p>
            <ul className="text-xs text-blue-800 mt-2 space-y-1">
              <li>• Title should be 50-60 characters</li>
              <li>• Description should be 150-160 characters</li>
              <li>• Use relevant keywords naturally</li>
              <li>• Include OG image for better social sharing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
