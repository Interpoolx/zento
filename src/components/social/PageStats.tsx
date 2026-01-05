import { useSocialStore } from '@/store/socialStore';
import { cn } from '@/lib/utils';
import { Heart, MessageCircle, Eye, Share2 } from 'lucide-react';

interface PageStatsProps {
  pageId: string;
  showShareButton?: boolean;
  onShare?: () => void;
}

/**
 * Dashboard component for displaying page engagement metrics and social interactions.
 * 
 * Renders a comprehensive analytics view showing page performance with interactive
 * elements for user engagement. Integrates with the social store for real-time
 * state management of likes and other social actions.
 * 
 * Displayed Metrics:
 * - **Views**: Total page view count (blue themed)
 * - **Likes**: Total likes received (red themed, interactive)
 * - **Comments**: Total comment count (purple themed)
 * - **Engagement**: Combined likes + comments (green themed)
 * - **Engagement Rate**: Visual progress bar showing (likes + comments) / views
 * 
 * Interactive Features:
 * - Like/Unlike toggle button with animated heart icon
 * - Optional share button that triggers parent callback
 * - Responsive 2-column (mobile) to 4-column (desktop) grid
 * 
 * @component
 * @param {PageStatsProps} props - Component configuration
 * @param {string} props.pageId - Unique identifier for the page being tracked
 * @param {boolean} [props.showShareButton=false] - Whether to show the share button
 * @param {() => void} [props.onShare] - Callback fired when share button is clicked
 *                                        (typically opens ShareModal or native share)
 * @returns {React.ReactElement} Stats dashboard card with metrics and action buttons
 * 
 * @example
 * // Basic stats display without share button
 * <PageStats pageId="page-123" />
 * 
 * @example
 * // Stats with share functionality
 * <PageStats
 *   pageId="page-123"
 *   showShareButton={true}
 *   onShare={() => setShareModalOpen(true)}
 * />
 * 
 * @example
 * // In a page detail view
 * function PageDetailView({ page }) {
 *   return (
 *     <div className="space-y-6">
 *       <PageHeader page={page} />
 *       <PageStats
 *         pageId={page.id}
 *         showShareButton={page.isPublished}
 *         onShare={() => navigator.share({ url: page.publicUrl })}
 *       />
 *       <PageComments pageId={page.id} />
 *     </div>
 *   );
 * }
 * 
 * @note Stats are fetched from useSocialStore - ensure provider is wrapped at app level
 * @note Engagement rate caps at 100% to handle edge cases where engagement exceeds views
 * @see useSocialStore for state management details
 * @see PageComments for the companion comments component
 */
export function PageStats({ pageId, showShareButton, onShare }: PageStatsProps) {
  const { getStats, isPageLiked, likePage, unlikePage } = useSocialStore();
  const stats = getStats();
  const isLiked = isPageLiked(pageId);

  /**
   * Toggles the like state of the page.
   * Likes the page if not already liked, otherwise unlikes it.
   */
  const handleLikeClick = () => {
    if (isLiked) {
      unlikePage(pageId);
    } else {
      likePage(pageId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-bold text-lg mb-4">Page Stats</h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Views</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-600">Likes</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.totalLikes}</div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Comments</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalComments}</div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-green-600 rounded-full" />
            <span className="text-sm text-gray-600">Engagement</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.totalComments + stats.totalLikes}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleLikeClick}
          className={cn(
            'flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
            isLiked
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
          {isLiked ? 'Liked' : 'Like'}
        </button>

        {showShareButton && (
          <button
            onClick={onShare}
            className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-blue-100 text-blue-600 hover:bg-blue-200"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        )}
      </div>

      {/* Engagement Rate */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Engagement Rate</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, ((stats.totalLikes + stats.totalComments) / (stats.totalViews || 1)) * 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats.totalViews > 0
            ? `${(((stats.totalLikes + stats.totalComments) / stats.totalViews) * 100).toFixed(1)}%`
            : 'N/A'}
        </p>
      </div>
    </div>
  );
}
