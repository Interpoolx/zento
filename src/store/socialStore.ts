import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, PagePreview, PageComment, SocialStats, Discovery } from '@/types';

interface SocialStore {
  // User data
  currentUser: UserProfile | null;
  userProfiles: Map<string, UserProfile>;
  
  // Following/Followers
  following: Set<string>;
  followers: Set<string>;
  
  // Page interactions
  likedPages: Set<string>;
  pageComments: Map<string, PageComment[]>;
  
  // Discovery & exploration
  trendingPages: PagePreview[];
  featuredPages: PagePreview[];
  recentPages: PagePreview[];
  pagesByCategory: Map<string, PagePreview[]>;
  
  // Stats
  socialStats: SocialStats;
  
  // Actions - User Management
  setCurrentUser: (user: UserProfile) => void;
  getUserProfile: (userId: string) => UserProfile | undefined;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => void;
  
  // Actions - Follow System
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  
  // Actions - Page Interactions
  likePage: (pageId: string) => void;
  unlikePage: (pageId: string) => void;
  isPageLiked: (pageId: string) => boolean;
  
  // Actions - Comments
  addComment: (pageId: string, comment: PageComment) => void;
  removeComment: (pageId: string, commentId: string) => void;
  getPageComments: (pageId: string) => PageComment[];
  
  // Actions - Discovery
  setTrendingPages: (pages: PagePreview[]) => void;
  setFeaturedPages: (pages: PagePreview[]) => void;
  setRecentPages: (pages: PagePreview[]) => void;
  setPagesByCategory: (category: string, pages: PagePreview[]) => void;
  searchPages: (query: string) => PagePreview[];
  getDiscovery: () => Discovery;
  
  // Actions - Stats
  updateStats: (stats: Partial<SocialStats>) => void;
  getStats: () => SocialStats;
}

const defaultStats: SocialStats = {
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  followerCount: 0,
  followingCount: 0,
};

/**
 * Zustand store for managing social and community features.
 * Handles user profiles, following system, page interactions (likes, comments),
 * and discovery features (trending, featured, search).
 *
 * @returns Zustand store with social actions and state
 *
 * @example
 * ```typescript
 * const { currentUser, followUser, likePage } = useSocialStore();
 * ```
 */
export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get): SocialStore => ({
      // Initial state
      currentUser: null,
      userProfiles: new Map(),
      following: new Set(),
      followers: new Set(),
      likedPages: new Set(),
      pageComments: new Map(),
      trendingPages: [],
      featuredPages: [],
      recentPages: [],
      pagesByCategory: new Map(),
      socialStats: defaultStats,

      // User Management
      setCurrentUser: (user) => set({ currentUser: user }),

      getUserProfile: (userId) => {
        const profiles = get().userProfiles;
        return profiles.get(userId);
      },

      updateUserProfile: (userId, updates) =>
        set((state) => {
          const profiles = new Map(state.userProfiles);
          const user = profiles.get(userId);
          if (user) {
            profiles.set(userId, { ...user, ...updates });
          }
          return { userProfiles: profiles };
        }),

      // Follow System
      followUser: (userId) =>
        set((state) => {
          const newFollowing = new Set(state.following);
          newFollowing.add(userId);
          
          const profiles = new Map(state.userProfiles);
          const user = profiles.get(userId);
          if (user) {
            profiles.set(userId, {
              ...user,
              followerCount: user.followerCount + 1,
              isFollowing: true,
            });
          }

          return {
            following: newFollowing,
            userProfiles: profiles,
            socialStats: {
              ...state.socialStats,
              followingCount: state.socialStats.followingCount + 1,
            },
          };
        }),

      unfollowUser: (userId) =>
        set((state) => {
          const newFollowing = new Set(state.following);
          newFollowing.delete(userId);
          
          const profiles = new Map(state.userProfiles);
          const user = profiles.get(userId);
          if (user) {
            profiles.set(userId, {
              ...user,
              followerCount: Math.max(0, user.followerCount - 1),
              isFollowing: false,
            });
          }

          return {
            following: newFollowing,
            userProfiles: profiles,
            socialStats: {
              ...state.socialStats,
              followingCount: Math.max(0, state.socialStats.followingCount - 1),
            },
          };
        }),

      isFollowing: (userId) => {
        return get().following.has(userId);
      },

      // Page Interactions
      likePage: (pageId) =>
        set((state) => {
          const newLikedPages = new Set(state.likedPages);
          newLikedPages.add(pageId);
          
          return {
            likedPages: newLikedPages,
            socialStats: {
              ...state.socialStats,
              totalLikes: state.socialStats.totalLikes + 1,
            },
          };
        }),

      unlikePage: (pageId) =>
        set((state) => {
          const newLikedPages = new Set(state.likedPages);
          newLikedPages.delete(pageId);
          
          return {
            likedPages: newLikedPages,
            socialStats: {
              ...state.socialStats,
              totalLikes: Math.max(0, state.socialStats.totalLikes - 1),
            },
          };
        }),

      isPageLiked: (pageId) => {
        return get().likedPages.has(pageId);
      },

      // Comments
      addComment: (pageId, comment) =>
        set((state) => {
          const comments = new Map(state.pageComments);
          const pageComments = comments.get(pageId) || [];
          comments.set(pageId, [...pageComments, comment]);
          
          return {
            pageComments: comments,
            socialStats: {
              ...state.socialStats,
              totalComments: state.socialStats.totalComments + 1,
            },
          };
        }),

      removeComment: (pageId, commentId) =>
        set((state) => {
          const comments = new Map(state.pageComments);
          const pageComments = comments.get(pageId) || [];
          comments.set(
            pageId,
            pageComments.filter((c) => c.id !== commentId)
          );
          
          return {
            pageComments: comments,
            socialStats: {
              ...state.socialStats,
              totalComments: Math.max(0, state.socialStats.totalComments - 1),
            },
          };
        }),

      getPageComments: (pageId) => {
        return get().pageComments.get(pageId) || [];
      },

      // Discovery
      setTrendingPages: (pages) => set({ trendingPages: pages }),

      setFeaturedPages: (pages) => set({ featuredPages: pages }),

      setRecentPages: (pages) => set({ recentPages: pages }),

      setPagesByCategory: (category, pages) =>
        set((state) => {
          const categories = new Map(state.pagesByCategory);
          categories.set(category, pages);
          return { pagesByCategory: categories };
        }),

      searchPages: (query) => {
        const { trendingPages, featuredPages, recentPages } = get();
        const allPages = [...trendingPages, ...featuredPages, ...recentPages];
        const lowercaseQuery = query.toLowerCase();

        return allPages.filter(
          (page) =>
            page.title.toLowerCase().includes(lowercaseQuery) ||
            page.description?.toLowerCase().includes(lowercaseQuery) ||
            page.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
        );
      },

      getDiscovery: () => {
        const state = get();
        const categoryPages: Record<string, PagePreview[]> = {};
        
        state.pagesByCategory.forEach((pages, category) => {
          categoryPages[category] = pages;
        });

        return {
          trending: state.trendingPages,
          featured: state.featuredPages,
          recent: state.recentPages,
          byCategory: categoryPages,
        };
      },

      // Stats
      updateStats: (stats) =>
        set((state) => ({
          socialStats: { ...state.socialStats, ...stats },
        })),

      getStats: () => get().socialStats,
    }),
    {
      name: 'zento-social',
      partialize: (state) => ({
        following: Array.from(state.following),
        followers: Array.from(state.followers),
        likedPages: Array.from(state.likedPages),
        socialStats: state.socialStats,
      }),
    }
  )
);
