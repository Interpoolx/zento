import { useState } from 'react';
import { useDistributionStore } from '@/store/distributionStore';
import { cn } from '@/lib/utils';
import { Copy, Check, Twitter, Facebook, Linkedin, Mail, MessageCircle, Share2 } from 'lucide-react';
import type { ShareLink } from '@/types';

interface ShareModalProps {
  pageId: string;
  pageTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component for sharing a page to various social platforms.
 * Supports Twitter, Facebook, LinkedIn, WhatsApp, Email, and direct link copying.
 * @param props - Component props
 * @param props.pageId - Unique identifier of the page to share
 * @param props.pageTitle - Title of the page for sharing messages
 * @param props.isOpen - Controls modal visibility
 * @param props.onClose - Callback fired when modal should close
 * @returns Share modal with social platform buttons and direct link copy
 */
export function ShareModal({ pageId, pageTitle, isOpen, onClose }: ShareModalProps) {
  const { createShareLink, getShareLinks, trackShareClick } = useDistributionStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const shareLinks = getShareLinks(pageId);

  if (!isOpen) return null;

  const baseUrl = `${window.location.origin}/page/${pageId}`;

  const platforms = [
    { id: 'twitter', name: 'Twitter/𝕏', icon: Twitter, color: 'hover:bg-black/5' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'hover:bg-blue-50' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'hover:bg-blue-100' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'hover:bg-green-50' },
    { id: 'email', name: 'Email', icon: Mail, color: 'hover:bg-gray-50' },
  ] as const;

  /**
   * Handles sharing to a specific social platform.
   * Creates a share link if one doesn't exist, tracks the click, and opens the platform's share dialog.
   * @param platform - The social platform to share to (twitter, facebook, linkedin, whatsapp, email)
   */
  const handleShare = (platform: ShareLink['platform']) => {
    let link = shareLinks.find(l => l.platform === platform);
    if (!link) {
      link = createShareLink(pageId, platform);
    }
    trackShareClick(pageId, link.id);

    const message = `Check out "${pageTitle}" - ${baseUrl}`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      email: `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(baseUrl)}`,
    };

    if (platform !== 'copy') {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  /**
   * Copies the direct page URL to clipboard and shows a temporary success indicator.
   */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopiedId('direct');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">Share "{pageTitle}"</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Direct Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Direct Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={baseUrl}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={cn(
                  'px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2',
                  copiedId === 'direct'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                )}
              >
                {copiedId === 'direct' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Platforms */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Share to</label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map(({ id, name, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => handleShare(id as ShareLink['platform'])}
                  className={cn(
                    'p-3 rounded-lg border border-gray-200 flex items-center gap-2 font-medium text-sm',
                    'transition-all hover:border-primary-500',
                    color
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Share Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 text-sm">Share this page</p>
                <p className="text-xs text-blue-700 mt-1">
                  {shareLinks.length > 0
                    ? `Shared ${shareLinks.reduce((sum, l) => sum + l.clicks, 0)} times`
                    : 'Share your page to boost visibility'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
