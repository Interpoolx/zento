import { useState } from 'react';
import { useSocialStore } from '@/store/socialStore';
import { cn } from '@/lib/utils';
import { Search, Heart, MessageCircle, Eye } from 'lucide-react';

interface DiscoveryPageProps {
  onSelectPage?: (pageId: string) => void;
}

/**
 * Discovery page component for browsing and searching published pages.
 * Allows users to explore featured, trending, and categorized pages with social features.
 *
 * Features:
 * - **Search** - Full-text search across page titles, descriptions, and tags
 * - **Categories** - Filter pages by auto-discovered category tags
 * - **Featured Section** - Curated featured pages (first 6 displayed)
 * - **Trending Section** - Popular pages sorted by recent engagement (first 4)
 * - **Social Interactions** - Like/unlike pages, view counts, comment counts
 * - **Page Cards** - Thumbnail preview, title, description, tags, engagement metrics
 * - **Responsive Grid** - 1-3 columns depending on viewport (mobile → tablet → desktop)
 *
 * State Management:
 * - Uses `useSocialStore()` for page discovery data and like/unlike actions
 * - Maintains local state for search query and selected category filter
 * - Dynamically computes displayed pages based on search/filter state
 *
 * @param onSelectPage - Optional callback fired when clicking a page card.
 *   Receives the page ID as parameter. Use to navigate to page preview/details.
 *   If not provided, cards show hover effect but don't perform action.
 * @returns Full-screen discovery interface with gradient background,
 *   header, search bar, category filters, featured grid, and trending section
 *
 * @example
 * ```tsx
 * // Basic usage in router
 * import { DiscoveryPage } from '@/components/discovery/DiscoveryPage';
 * 
 * function App() {
 *   const handleSelectPage = (pageId: string) => {
  *     // Navigate to page preview or load page
  *     navigateTo(`/pages/${pageId}`);
  *   };
  *   
  *   return <DiscoveryPage onSelectPage={handleSelectPage} />;
  * }
  *
  * Usage with loading state:
  * - onSelectPage callback receives pageId string
  * - Use callback to navigate, load page, or update editor
  * - Can be used with async/await for loading states
  * - Works without callback for read-only discovery
 *
 * Display Logic:
 * - If searching: Shows search results (all matching pages)
 * - Else if category selected: Shows pages in that category
 * - Else: Shows featured pages (limited to 6)
 * - When not searching/filtering: Shows trending section with 4 trending pages
 *
 * Styling:
 * - Uses Tailwind utilities with custom `cn()` helper for merging classes
 * - Gradient background: gray-50 → gray-100 (light theme)
 * - Card hover effects: scale-105 with shadow transition
 * - Search input has focus ring on primary-500 color
 * - Category pills: button-style toggles with active state
 *
 * @see {@link PageCard} - Inner component for individual page cards
 * @see {@link useSocialStore} - Provides discovery data and social interactions
 * @see {@link cn} - Utility for conditional Tailwind class merging
 */
export function DiscoveryPage({ onSelectPage }: DiscoveryPageProps) {
  const { getDiscovery, searchPages, isPageLiked, likePage, unlikePage } = useSocialStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const discovery = getDiscovery();

  const searchResults = searchQuery ? searchPages(searchQuery) : [];
  const allPages = Object.values(discovery.byCategory).flat();
  const categories = Array.from(new Set(allPages.map(p => p.category).filter(Boolean)));

  const displayedPages = searchQuery ? searchResults : selectedCategory ? (discovery.byCategory[selectedCategory] || []) : discovery.featured.slice(0, 6);

  /**
   * Individual page card component for displaying page previews in the discovery grid.
   * Renders a card with thumbnail, metadata, and engagement metrics for a single page.
   *
   * Card Structure:
   * - Thumbnail Image scrolls 1.1x on hover
   * - Page Title and Description with 2-line clamp
   * - Tags display (first 2 tags only)
   * - Engagement metrics: views, likes, comments
   *
   * Interactive Features:
   * - Click Card: Triggers onSelectPage callback for navigation
   * - Click Heart: Toggles like status (filled red when liked)
   * - **Hover Effect**: Card scales to 1.05, shadow increases (smooth 300ms transition)
   * - **Thumbnail Hover**: Image scales 1.1x with smooth animation
   *
   * Styling:
   * - White background with rounded-xl corners
   * - Shadow elevation: sm → lg on hover
   * - Group utilities for coordinated hover effects
   * - Dark text colors for accessibility
   * - Line clamping prevents overflow in titles/descriptions
   *
   * Props:
   * - `page`: Discovery page object with id, pageId, title, description, tags,
   *   thumbnail, views, likes, category, and other metadata
   *
   * @param page - The page data object from discovery.featured or search results.
   *   Must include: id, pageId, title, description, tags[], thumbnail URL,
   *   views count, likes count, category, and other metadata fields.
   * @returns Rendered page card with hover interactions and engagement metrics
   *
   * Usage Notes:
   * - Renders a single card that user can click to select
   * - Shows page title, description, thumbnail, views/likes
   * - Card is clickable and toggles like status with heart icon
   * - Used within discovery grid or search results
   * - Each card maintains its own like state independently
   *
   * State & Interactions:
   * - Checks `isPageLiked(page.id)` to determine heart fill color
   * - Calls `likePage(page.id)` when clicking empty heart
   * - Calls `unlikePage(page.id)` when clicking filled heart
   * - Uses `e.stopPropagation()` to prevent card click when liking
   *
   * @see {@link DiscoveryPage} - Parent component that renders multiple PageCards
   * @see {@link useSocialStore.isPageLiked} - Check if current user liked this page
   * @see {@link useSocialStore.likePage} - Add to current user's likes
   * @see {@link useSocialStore.unlikePage} - Remove from current user's likes
   */
  const PageCard = ({ page }: { page: typeof discovery.featured[0] }) => {
    const isLiked = isPageLiked(page.id);

    return (
      <div
        onClick={() => onSelectPage?.(page.pageId)}
        className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
      >
        {page.thumbnail && (
          <div className="w-full h-32 overflow-hidden bg-gray-100">
            <img
              src={page.thumbnail}
              alt={page.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="p-4">
          <h3 className="font-bold text-sm mb-1 line-clamp-2">{page.title}</h3>
          {page.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-3">{page.description}</p>
          )}

          {page.tags && page.tags.length > 0 && (
            <div className="flex gap-1 mb-3 flex-wrap">
              {page.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {page.views}
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isLiked) {
                    unlikePage(page.id);
                  } else {
                    likePage(page.id);
                  }
                }}
              >
                <Heart className={cn('w-3 h-3', isLiked && 'fill-red-500 text-red-500')} />
                {page.likes}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                0
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover</h1>
          <p className="text-gray-600">Explore amazing profiles and get inspired</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages, creators, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                'transition-all'
              )}
            />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && !searchQuery && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Categories</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  !selectedCategory
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                )}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category || null)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPages.length > 0 ? (
            displayedPages.map(page => (
              <PageCard key={page.id} page={page} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-2">No pages found</p>
              <p className="text-sm text-gray-400">Try adjusting your search terms</p>
            </div>
          )}
        </div>

        {/* Trending Section */}
        {!searchQuery && !selectedCategory && (
          <>
            <div className="mt-16 mb-8">
              <h2 className="text-2xl font-bold mb-4">🔥 Trending Now</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {discovery.trending.slice(0, 4).map(page => (
                  <PageCard key={page.id} page={page} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
