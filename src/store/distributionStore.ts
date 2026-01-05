import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PageDistribution, PageMetaTags, PageAnalytics, ShareLink, SlugValidation } from '@/types';

interface DistributionStore {
  // Page Distribution
  distributions: Map<string, PageDistribution>;
  metaTags: Map<string, PageMetaTags>;
  analytics: Map<string, PageAnalytics[]>;
  shareLinks: Map<string, ShareLink[]>;
  
  // Distribution actions
  createDistribution: (pageId: string, slug: string) => void;
  updateDistribution: (pageId: string, updates: Partial<PageDistribution>) => void;
  publishPage: (pageId: string) => void;
  unpublishPage: (pageId: string) => void;
  getDistribution: (pageId: string) => PageDistribution | undefined;
  
  // Meta Tags
  setMetaTags: (pageId: string, tags: PageMetaTags) => void;
  getMetaTags: (pageId: string) => PageMetaTags | undefined;
  updateMetaTags: (pageId: string, updates: Partial<PageMetaTags>) => void;
  
  // Analytics
  recordPageView: (pageId: string, referrer?: string, device?: string) => void;
  recordClick: (pageId: string, platform: string) => void;
  getAnalytics: (pageId: string) => PageAnalytics | undefined;
  
  // Share Links
  createShareLink: (pageId: string, platform: ShareLink['platform']) => ShareLink;
  trackShareClick: (pageId: string, shareId: string) => void;
  getShareLinks: (pageId: string) => ShareLink[];
  
  // Slug validation
  validateSlug: (slug: string, existingSlugs?: string[]) => SlugValidation;
  isSlugAvailable: (slug: string) => boolean;
  
  // Custom domain
  setCustomDomain: (pageId: string, domain: string) => void;
  removeCustomDomain: (pageId: string) => void;
  
  // Short link generation
  generateShortLink: (pageId: string, baseUrl: string) => string;
}

const slugRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/**
 * Zustand store for managing page distribution, sharing, and analytics.
 * Handles publishing, SEO meta tags, analytics tracking, and sharing functionality.
 *
 * @returns Zustand store with distribution actions and state
 *
 * @example
 * ```typescript
 * const { publishPage, setMetaTags, recordPageView } = useDistributionStore();
 * ```
 */
export const useDistributionStore = create<DistributionStore>()(
  persist(
    (set, get): DistributionStore => ({
      // Initial state
      distributions: new Map(),
      metaTags: new Map(),
      analytics: new Map(),
      shareLinks: new Map(),

      // Distribution
      createDistribution: (pageId, slug) =>
        set((state) => {
          const distributions = new Map(state.distributions);
          distributions.set(pageId, {
            pageId,
            slug,
            isPublished: false,
            viewCount: 0,
            clickCount: 0,
          });
          return { distributions };
        }),

      updateDistribution: (pageId, updates) =>
        set((state) => {
          const distributions = new Map(state.distributions);
          const dist = distributions.get(pageId);
          if (dist) {
            distributions.set(pageId, { ...dist, ...updates });
          }
          return { distributions };
        }),

      publishPage: (pageId) =>
        set((state) => {
          const distributions = new Map(state.distributions);
          const dist = distributions.get(pageId);
          if (dist) {
            distributions.set(pageId, {
              ...dist,
              isPublished: true,
              publishedAt: new Date(),
            });
          }
          return { distributions };
        }),

      unpublishPage: (pageId) =>
        set((state) => {
          const distributions = new Map(state.distributions);
          const dist = distributions.get(pageId);
          if (dist) {
            distributions.set(pageId, { ...dist, isPublished: false });
          }
          return { distributions };
        }),

      getDistribution: (pageId) => {
        return get().distributions.get(pageId);
      },

      // Meta Tags
      setMetaTags: (pageId, tags) =>
        set((state) => {
          const metaTags = new Map(state.metaTags);
          metaTags.set(pageId, tags);
          return { metaTags };
        }),

      getMetaTags: (pageId) => {
        return get().metaTags.get(pageId);
      },

      updateMetaTags: (pageId, updates) =>
        set((state) => {
          const metaTags = new Map(state.metaTags);
          const tags = metaTags.get(pageId);
          if (tags) {
            metaTags.set(pageId, { ...tags, ...updates });
          }
          return { metaTags };
        }),

      // Analytics
      recordPageView: (pageId, referrer, device) =>
        set((state) => {
          const analytics = new Map(state.analytics);
          const today = new Date().toISOString().split('T')[0];
          const dayAnalytics = analytics.get(pageId) || [];
          
          const todayData = dayAnalytics.find(a => a.date === today);
          if (todayData) {
            todayData.views += 1;
            if (referrer) {
              todayData.referrers[referrer] = (todayData.referrers[referrer] || 0) + 1;
            }
            if (device) {
              todayData.devices[device] = (todayData.devices[device] || 0) + 1;
            }
          } else {
            dayAnalytics.push({
              pageId,
              date: today,
              views: 1,
              clicks: 0,
              referrers: referrer ? { [referrer]: 1 } : {},
              devices: device ? { [device]: 1 } : {},
              locations: {},
            });
          }
          
          analytics.set(pageId, dayAnalytics);
          
          // Update distribution view count
          const distributions = new Map(state.distributions);
          const dist = distributions.get(pageId);
          if (dist) {
            distributions.set(pageId, { ...dist, viewCount: dist.viewCount + 1 });
          }
          
          return { analytics, distributions };
        }),

      recordClick: (pageId, platform) =>
        set((state) => {
          const distributions = new Map(state.distributions);
          const dist = distributions.get(pageId);
          if (dist) {
            distributions.set(pageId, { ...dist, clickCount: dist.clickCount + 1 });
          }

          const shareLinks = new Map(state.shareLinks);
          const links = shareLinks.get(pageId) || [];
          const link = links.find(l => l.platform === platform);
          if (link) {
            link.clicks += 1;
          }
          shareLinks.set(pageId, links);

          return { distributions, shareLinks };
        }),

      getAnalytics: (pageId) => {
        const data = get().analytics.get(pageId);
        if (!data || data.length === 0) return undefined;
        
        // Aggregate all data
        const aggregated: PageAnalytics = {
          pageId,
          date: 'all-time',
          views: 0,
          clicks: 0,
          referrers: {},
          devices: {},
          locations: {},
        };

        data.forEach(day => {
          aggregated.views += day.views;
          aggregated.clicks += day.clicks;
          Object.entries(day.referrers).forEach(([ref, count]) => {
            aggregated.referrers[ref] = (aggregated.referrers[ref] || 0) + count;
          });
          Object.entries(day.devices).forEach(([device, count]) => {
            aggregated.devices[device] = (aggregated.devices[device] || 0) + count;
          });
        });

        return aggregated;
      },

      // Share Links
      createShareLink: (pageId, platform) => {
        const link: ShareLink = {
          id: crypto.randomUUID(),
          pageId,
          platform,
          url: `${window.location.origin}/share/${pageId}?platform=${platform}`,
          clicks: 0,
          createdAt: new Date(),
        };

        set((state) => {
          const shareLinks = new Map(state.shareLinks);
          const links = shareLinks.get(pageId) || [];
          shareLinks.set(pageId, [...links, link]);
          return { shareLinks };
        });

        return link;
      },

      trackShareClick: (pageId, shareId) =>
        set((state) => {
          const shareLinks = new Map(state.shareLinks);
          const links = shareLinks.get(pageId) || [];
          const link = links.find(l => l.id === shareId);
          if (link) {
            link.clicks += 1;
          }
          shareLinks.set(pageId, links);
          return { shareLinks };
        }),

      getShareLinks: (pageId) => {
        return get().shareLinks.get(pageId) || [];
      },

      // Slug validation
      validateSlug: (slug, existingSlugs = []) => {
        const errors: string[] = [];
        let isValid = true;
        let isAvailable = true;

        if (!slug) {
          errors.push('Slug is required');
          isValid = false;
        }

        if (slug.length < 3) {
          errors.push('Slug must be at least 3 characters');
          isValid = false;
        }

        if (slug.length > 63) {
          errors.push('Slug must not exceed 63 characters');
          isValid = false;
        }

        if (!slugRegex.test(slug)) {
          errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
          isValid = false;
        }

        const reservedSlugs = ['api', 'admin', 'dashboard', 'settings', 'share', 'explore', 'trending'];
        if (reservedSlugs.includes(slug.toLowerCase())) {
          errors.push('This slug is reserved');
          isValid = false;
        }

        if (existingSlugs.includes(slug)) {
          errors.push('This slug is already taken');
          isAvailable = false;
        }

        return { slug, isValid, isAvailable, errors };
      },

      isSlugAvailable: (slug) => {
        return !Array.from(get().distributions.values()).some(d => d.slug === slug);
      },

      // Custom domain
      setCustomDomain: (pageId, domain) =>
        set((state) => {
          if (!domainRegex.test(domain)) {
            console.error('Invalid domain format');
            return state;
          }

          const distributions = new Map(state.distributions);
          const dist = distributions.get(pageId);
          if (dist) {
            distributions.set(pageId, { ...dist, customDomain: domain });
          }
          return { distributions };
        }),

      removeCustomDomain: (pageId) =>
        set((state) => {
          const distributions = new Map(state.distributions);
          const dist = distributions.get(pageId);
          if (dist) {
            distributions.set(pageId, { ...dist, customDomain: undefined });
          }
          return { distributions };
        }),

      // Short link generation
      generateShortLink: (pageId, baseUrl) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let shortCode = '';
        for (let i = 0; i < 6; i++) {
          shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const shortLink = `${baseUrl}/${shortCode}`;

        set((state) => {
          const distributions = new Map(state.distributions);
          const dist = distributions.get(pageId);
          if (dist) {
            distributions.set(pageId, { ...dist, shortLink });
          }
          return { distributions };
        });

        return shortLink;
      },
    }),
    {
      name: 'zento-distribution',
      partialize: (state) => ({
        distributions: Array.from(state.distributions.entries()),
        metaTags: Array.from(state.metaTags.entries()),
        shareLinks: Array.from(state.shareLinks.entries()),
      }),
    }
  )
);
