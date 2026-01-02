# Bento.me Clone - Technical Specification Document
## Cloudflare Workers + TanStack Stack

## Executive Summary

**Project:** Bento.me Clone - Personal Profile Page Builder  
**Complexity Level:** ⭐⭐⭐⭐ (4/5 - Advanced)  
**Estimated Timeline:** 12-16 weeks (with 2-3 developers)  
**Core Concept:** A drag-and-drop personal page builder with rich media widgets, social platform integrations, and customizable layouts

**Architecture:** Edge-first with Cloudflare Workers, React SPA with TanStack ecosystem

---

## 1. Product Overview

### 1.1 Product Description
A web application that allows users to create beautiful, customizable personal pages (similar to "link in bio" but with rich visual experiences). Users can showcase their content, social media profiles, work, and links through an interactive grid-based layout system.

### 1.2 Core Value Proposition
- Visual storytelling through customizable widget-based layouts
- Drag-and-drop interface for easy content arrangement
- Smart widgets that automatically pull data from external platforms
- Responsive design with separate mobile/desktop layouts
- No-code solution for creating professional personal pages
- **Lightning-fast edge deployment with global low latency**

---

## 2. Core Features

### 2.1 User Authentication & Account Management
**Priority:** High  
**Complexity:** Medium

**Requirements:**
- Email/password authentication
- OAuth integration (Google, Twitter, GitHub)
- Password reset functionality
- Email verification
- User profile settings
- Account deletion
- Session management with JWT

**Technical Stack:**
- Hono middleware for auth
- Cloudflare Workers for auth endpoints
- JWT tokens stored in httpOnly cookies
- Cloudflare D1 for user data
- OAuth flow implementation in Workers

---

### 2.2 Page Editor (Drag-and-Drop Interface)
**Priority:** Critical  
**Complexity:** High

**Requirements:**
- Grid-based layout system (CSS Grid)
- Drag-and-drop functionality for widgets
- Resize widgets (multiple size options: 1x1, 1x2, 2x1, 2x2, 2x3, etc.)
- Real-time preview
- Undo/Redo functionality
- Copy/paste widgets
- Widget alignment and snapping
- Mobile vs Desktop layout customization
- Canvas physics for smooth animations

**Technical Implementation:**
- React 18+ with TypeScript
- TanStack Router for routing
- TanStack Query for server state
- dnd-kit for drag-and-drop
- CSS Grid for layout system
- Framer Motion for animations
- Zustand for local editor state
- Canvas collision detection for snapping

**Data Structure:**
```typescript
interface WidgetLayout {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: WidgetContent;
  styling: WidgetStyle;
  viewport: 'desktop' | 'mobile' | 'both';
}
```

---

### 2.3 Widget System
**Priority:** Critical  
**Complexity:** High

#### 2.3.1 Basic Widgets

**Link Widget**
- URL input
- Custom title and description
- Auto-fetch Open Graph metadata
- Custom thumbnail upload to R2
- Multiple size options (small, medium, large, wide)

**Image Widget**
- Upload images to R2 (JPEG, PNG, GIF, WebP)
- Drag to reorder in gallery
- Caption support
- Link overlay option
- Multiple size variants
- Automatic optimization via Cloudflare Images

**Video Widget**
- Upload videos to R2 (MP4, WebM)
- YouTube/Vimeo embed
- Autoplay and loop options
- Muted by default
- Custom thumbnail
- Stream via Cloudflare Stream (optional)

**Text Widget**
- Rich text editor (headings, bold, italic, links)
- Multiple text sizes
- Custom colors
- Section titles/headers
- Testimonials/quotes formatting

**Map Widget**
- Google Maps integration
- Location pin
- Custom zoom levels
- Multiple size options

**Section Title Widget**
- Organizer/divider between content sections
- Custom styling

#### 2.3.2 Smart Widgets (Platform Integrations)

**GitHub Widget**
- Profile display with contribution graph
- Repository showcase
- Stats (followers, repos)
- Multiple sizes (small, medium, large)

**Instagram Widget**
- Profile info with follower count
- Latest 6-9 posts grid
- Tall profile option
- Small profile badge

**Twitter/X Widget**
- Profile with banner and bio
- Latest tweets
- Follow button
- Multiple size options

**YouTube Widget**
- Channel info with subscriber count
- Latest 4 videos with thumbnails
- Small and large variants

**Dribbble Widget**
- Profile with shot grid
- Individual shot display
- Stats (likes, views)

**Figma Widget**
- Template/file preview
- Profile integration

**Behance Widget**
- Project showcases
- Profile display

**TikTok Widget**
- Profile display
- Latest videos
- Follower count

**Spotify Widget**
- Song embed with play button
- Album display
- Artist profile with latest albums
- Podcast episodes

---

### 2.4 Smart Widget Data Fetching
**Priority:** High  
**Complexity:** Very High

**Technical Requirements:**
- Cloudflare Workers API endpoints for each platform
- OAuth flows handled in Workers
- Cloudflare KV for caching API responses (TTL-based)
- Rate limiting with Durable Objects
- Webhook support via Workers
- Fallback for API failures

**Platform APIs Integration:**
- GitHub API v3/v4
- Instagram Graph API
- Twitter API v2
- YouTube Data API v3
- Dribbble API v2
- Behance API
- Spotify Web API
- TikTok API

**Workers Architecture:**
```typescript
// Hono API endpoint structure
app.get('/api/integrations/:platform/:username', async (c) => {
  const { platform, username } = c.req.param()
  
  // Check KV cache first
  const cached = await c.env.CACHE.get(`${platform}:${username}`)
  if (cached) return c.json(JSON.parse(cached))
  
  // Fetch from platform API
  const data = await fetchPlatformData(platform, username)
  
  // Cache in KV with TTL
  await c.env.CACHE.put(
    `${platform}:${username}`,
    JSON.stringify(data),
    { expirationTtl: 3600 } // 1 hour
  )
  
  return c.json(data)
})
```

---

### 2.5 Customization & Styling
**Priority:** High  
**Complexity:** Medium

**Features:**
- Custom background colors/gradients
- Background image upload to R2
- Theme presets (light/dark/custom)
- Widget styling options:
  - Border radius
  - Shadow effects
  - Border colors
  - Text colors
  - Custom fonts (Google Fonts)
- Global style settings
- Per-widget style overrides

---

### 2.6 Page Management
**Priority:** High  
**Complexity:** Medium

**Features:**
- Custom URL slugs (yourdomain.com/username)
- Page preview mode
- Publish/unpublish toggle
- Page templates
- Duplicate pages
- Version history (stored in D1)
- SEO metadata (title, description, OG image)
- Custom domain support via Cloudflare DNS

---

### 2.7 Analytics (Optional - Phase 2)
**Priority:** Low  
**Complexity:** Medium

**Features:**
- Page view tracking with Workers Analytics Engine
- Click tracking per widget
- Geographic data from CF request data
- Referrer tracking
- Time-based analytics
- Export data

**Technical Stack:**
- Cloudflare Analytics Engine for event ingestion
- Cloudflare D1 for aggregated analytics
- Workers for processing

---

## 3. Technical Architecture

### 3.1 Frontend Stack

**Core Framework:** React 18+ SPA (Vite)
- Fast development and build times
- Optimized production bundles
- Hot Module Replacement (HMR)

**Routing:** TanStack Router
- Type-safe routing
- Built-in data loading
- Nested layouts
- Search params management
- Route-based code splitting

**State Management:**
- **TanStack Query** - Server state, caching, synchronization
- **Zustand** - Local UI state (editor state, drag-and-drop)
- **Context API** - Theme and settings

**UI Libraries:**
- TypeScript
- TailwindCSS for styling
- Radix UI or shadcn/ui for components
- Framer Motion for animations
- dnd-kit for drag-and-drop
- Tiptap for rich text editing

**Build Tool:** Vite
- Fast dev server
- Optimized production builds
- Asset optimization
- Code splitting

---

### 3.2 Backend Stack

**Runtime:** Cloudflare Workers (Hono framework)

**API Framework:** Hono
- Ultrafast edge runtime
- Middleware support
- Type-safe routing
- Built-in validation
- WebSocket support via Durable Objects

**Database:** Cloudflare D1 (SQLite)
- Distributed SQLite at the edge
- ACID compliance
- Low latency reads
- Automatic replication

**ORM:** Drizzle ORM
- Type-safe SQL queries
- Zero-dependency
- Lightweight
- Great D1 support
- Migration management

**Caching:** Cloudflare KV
- Key-value storage at the edge
- Sub-millisecond reads globally
- TTL support
- Perfect for API caching

**File Storage:** Cloudflare R2
- S3-compatible object storage
- No egress fees
- Global distribution
- Image optimization via Cloudflare Images

**Additional Cloudflare Services:**
- **Durable Objects** - Rate limiting, WebSocket connections
- **Analytics Engine** - Event tracking
- **Email Workers** - Transactional emails
- **Images** - Automatic image optimization
- **Stream** - Video hosting (optional)

---

### 3.3 Database Schema (Drizzle ORM)

```typescript
// schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  subscriptionTier: text('subscription_tier').default('free'),
})

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  layoutConfig: text('layout_config', { mode: 'json' }).notNull(),
  styleConfig: text('style_config', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => pages.id),
  type: text('type').notNull(),
  position: text('position', { mode: 'json' }).notNull(),
  size: text('size', { mode: 'json' }).notNull(),
  content: text('content', { mode: 'json' }).notNull(),
  styling: text('styling', { mode: 'json' }),
  orderIndex: integer('order_index').notNull(),
})

export const platformConnections = sqliteTable('platform_connections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  platform: text('platform').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
})

export const pageViews = sqliteTable('page_views', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => pages.id),
  viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull(),
  referrer: text('referrer'),
  country: text('country'),
  city: text('city'),
})
```

---

### 3.4 Project Structure

```
├── packages/
│   ├── frontend/                 # React SPA
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── editor/      # Drag-and-drop editor
│   │   │   │   ├── widgets/     # Widget components
│   │   │   │   └── ui/          # Shared UI components
│   │   │   ├── routes/          # TanStack Router routes
│   │   │   ├── stores/          # Zustand stores
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── lib/             # Utilities
│   │   │   └── main.tsx
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── backend/                  # Cloudflare Workers
│   │   ├── src/
│   │   │   ├── index.ts         # Main Hono app
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── pages.ts
│   │   │   │   ├── widgets.ts
│   │   │   │   └── integrations.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── rateLimit.ts
│   │   │   ├── db/
│   │   │   │   ├── schema.ts    # Drizzle schema
│   │   │   │   └── migrations/
│   │   │   ├── services/
│   │   │   │   ├── platforms/   # API integrations
│   │   │   │   └── storage/     # R2 operations
│   │   │   └── types/
│   │   ├── wrangler.toml
│   │   └── package.json
│   │
│   └── shared/                   # Shared types
│       ├── src/
│       │   ├── types/
│       │   └── validators/
│       └── package.json
│
├── pnpm-workspace.yaml
└── package.json
```

---

### 3.5 Hono API Structure

```typescript
// backend/src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { pageRoutes } from './routes/pages'
import { widgetRoutes } from './routes/widgets'
import { integrationRoutes } from './routes/integrations'

type Bindings = {
  DB: D1Database
  CACHE: KVNamespace
  R2: R2Bucket
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Routes
app.route('/auth', authRoutes)
app.route('/api/pages', pageRoutes)
app.route('/api/widgets', widgetRoutes)
app.route('/api/integrations', integrationRoutes)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

export default app
```

```typescript
// backend/src/routes/pages.ts
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { pages, widgets } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import { eq } from 'drizzle-orm'

const app = new Hono()

// Get all user pages
app.get('/', authMiddleware, async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  
  const userPages = await db
    .select()
    .from(pages)
    .where(eq(pages.userId, userId))
  
  return c.json(userPages)
})

// Get single page with widgets
app.get('/:slug', async (c) => {
  const db = drizzle(c.env.DB)
  const slug = c.req.param('slug')
  
  const page = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .get()
  
  if (!page || !page.isPublished) {
    return c.json({ error: 'Page not found' }, 404)
  }
  
  const pageWidgets = await db
    .select()
    .from(widgets)
    .where(eq(widgets.pageId, page.id))
    .orderBy(widgets.orderIndex)
  
  return c.json({ page, widgets: pageWidgets })
})

// Create page
app.post('/', authMiddleware, async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const body = await c.req.json()
  
  const newPage = await db
    .insert(pages)
    .values({
      id: crypto.randomUUID(),
      userId,
      slug: body.slug,
      title: body.title,
      layoutConfig: body.layoutConfig || {},
      styleConfig: body.styleConfig || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
    .get()
  
  return c.json(newPage, 201)
})

// Update page
app.put('/:id', authMiddleware, async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const updated = await db
    .update(pages)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
    .returning()
    .get()
  
  return c.json(updated)
})

export { app as pageRoutes }
```

---

### 3.6 Frontend with TanStack Router & Query

```typescript
// frontend/src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

```typescript
// frontend/src/routes/editor/$pageId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Editor } from '@/components/editor/Editor'
import { pageApi } from '@/lib/api'

export const Route = createFileRoute('/editor/$pageId')({
  component: EditorPage,
})

function EditorPage() {
  const { pageId } = Route.useParams()
  const queryClient = useQueryClient()
  
  // Fetch page data
  const { data: page, isLoading } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => pageApi.getById(pageId),
  })
  
  // Update page mutation
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Page>) => 
      pageApi.update(pageId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['page', pageId])
    },
  })
  
  if (isLoading) return <div>Loading...</div>
  if (!page) return <div>Page not found</div>
  
  return (
    <Editor 
      page={page}
      onSave={(updates) => updateMutation.mutate(updates)}
    />
  )
}
```

```typescript
// frontend/src/lib/api.ts
import { QueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

export const pageApi = {
  getById: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/pages/${id}`)
    return res.json()
  },
  
  update: async (id: string, data: Partial<Page>) => {
    const res = await fetch(`${API_BASE}/api/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })
    return res.json()
  },
  
  // ... other methods
}
```

---

## 4. Development Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
**Deliverables:**
- Project setup (monorepo with pnpm)
- Frontend: Vite + React + TypeScript + TailwindCSS
- Backend: Cloudflare Workers + Hono + Drizzle
- D1 database setup and schema
- R2 bucket configuration
- Authentication system (JWT)
- Basic user dashboard
- File upload to R2

**Team Focus:** 1-2 developers

---

### Phase 2: Editor Foundation (Weeks 3-4)
**Deliverables:**
- Grid layout system with CSS Grid
- Drag-and-drop with dnd-kit
- TanStack Router setup with nested routes
- TanStack Query integration
- Basic widget system (Link, Image, Text)
- Widget resizing
- Zustand store for editor state
- Save/load page configurations
- Real-time preview

**Team Focus:** 2 developers (1 on UI, 1 on state/API)

---

### Phase 3: Basic Widgets (Weeks 5-6)
**Deliverables:**
- All basic widgets (Link, Image, Video, Text, Map)
- Widget styling options
- Link preview generation (OG metadata in Workers)
- Image optimization with Cloudflare Images
- Video upload to R2
- Mobile layout editor
- Responsive breakpoints

**Team Focus:** 2-3 developers

---

### Phase 4: Smart Widgets & Integrations (Weeks 7-9)
**Deliverables:**
- Platform API integrations (GitHub, Twitter, Instagram, YouTube)
- OAuth flows in Workers
- Smart widget components
- KV caching system for API responses
- Rate limiting with Durable Objects
- Widget refresh functionality
- Background sync jobs

**Team Focus:** 2-3 developers (backend heavy)

---

### Phase 5: Polish & Launch Prep (Weeks 10-12)
**Deliverables:**
- Performance optimization
- Mobile responsiveness refinement
- SEO optimization (meta tags)
- Analytics with Analytics Engine (optional)
- Custom domain support
- Edge caching strategies
- Error handling and monitoring
- Documentation

**Team Focus:** Full team

---

## 5. Complexity Analysis

### 5.1 Technical Challenges

**High Complexity Areas:**

1. **Drag-and-Drop System (Difficulty: 9/10)**
   - Grid snapping with collision detection
   - Responsive layout across devices
   - Smooth animations
   - State management for nested updates
   - Undo/redo implementation

2. **Smart Widget Data Fetching (Difficulty: 8/10)**
   - Multiple API integrations in Workers
   - Rate limiting and quota management
   - KV caching strategies
   - Error handling for API failures
   - OAuth flows in edge environment

3. **Layout Engine (Difficulty: 8/10)**
   - CSS Grid positioning calculations
   - Widget collision detection
   - Responsive breakpoint management
   - Separate mobile/desktop layouts
   - Maintaining layout integrity

4. **Edge Data Consistency (Difficulty: 7/10)**
   - D1 eventual consistency across regions
   - KV caching invalidation
   - Optimistic updates in TanStack Query
   - Conflict resolution

**Medium Complexity Areas:**

5. **File Upload & Storage (Difficulty: 6/10)**
   - Direct upload to R2
   - Presigned URLs
   - Image/video optimization
   - CDN integration

6. **Workers Performance (Difficulty: 6/10)**
   - CPU time limits (50ms)
   - Memory constraints
   - Cold start optimization
   - Efficient D1 queries

**Lower Complexity Areas:**

7. **Authentication (Difficulty: 5/10)**
   - JWT implementation in Workers
   - Cookie management

8. **TanStack Setup (Difficulty: 4/10)**
   - Router configuration
   - Query client setup

---

### 5.2 Cloudflare-Specific Challenges

**Edge Limitations:**
- 50ms CPU time per request (requires optimization)
- No Node.js APIs (use Web APIs only)
- D1 eventual consistency (design around it)
- KV eventual consistency (typically <60s)
- Limited package size for Workers

**Solutions:**
- Use Workers KV for caching
- Offload heavy processing to Durable Objects
- Use TanStack Query optimistic updates
- Implement proper error boundaries
- Progressive enhancement approach

---

## 6. Resource Requirements

### 6.1 Team Composition (Ideal)
- **1 Senior Full-Stack Developer** (Lead, architecture, Workers expertise)
- **1 Mid-Level Frontend Developer** (React, TanStack, editor UI)
- **1 Mid-Level Backend Developer** (Hono, Drizzle, integrations)
- **1 UI/UX Designer** (part-time, design system)
- **1 QA Engineer** (part-time, from week 6)

### 6.2 Solo Developer Timeline
If building solo: **16-24 weeks**
- Requires Workers experience
- Strong React + TypeScript skills
- Understanding of edge computing
- Focus on MVP initially

---

## 7. MVP Definition

**Must Have:**
- User authentication (email + JWT)
- Drag-and-drop editor with grid
- Basic widgets: Link, Image, Text, Video
- 2-3 smart widgets: GitHub, Twitter, Spotify
- Basic styling options
- Public page viewing
- R2 file storage
- Mobile responsive

**Can Skip for MVP:**
- Multiple platform integrations
- Advanced analytics
- Custom domains
- Version history
- Template marketplace

**MVP Timeline:** 6-8 weeks with 2-3 developers

---

## 8. Cost Estimate

### 8.1 Development Costs
- **Team (12 weeks):** $115,000-168,000
- **Solo Developer:** $30,000-60,000

---

### 8.2 Cloudflare Infrastructure Costs

**Free Tier Limits:**
- Workers: 100,000 requests/day
- D1: 100,000 rows read/day
- KV: 100,000 reads/day
- R2: 10 GB storage
- Images: 100,000 transformations/month

**Paid Plans (Monthly):**

**Small Scale (<10K users):**
- Workers Paid ($5): 10M requests
- D1 ($5): 25B row reads
- KV ($0.50): 10M reads
- R2 Storage ($0.015/GB): ~$2 for 100GB
- Images ($5): 100K transformations
- **Total: ~$20-30/month**

**Medium Scale (10K-100K users):**
- Workers: $5-20
- D1: $5-15
- KV: $1-5
- R2: $5-15
- Images: $5-20
- **Total: ~$25-80/month**

**Growth Stage (100K+ users):**
- Infrastructure scales to: $100-500/month
- Still significantly cheaper than traditional cloud

**Key Advantages:**
- No egress fees on R2 (huge savings)
- Pay-per-use model
- Generous free tiers
- Built-in DDoS protection
- Global CDN included

---

## 9. Deployment Strategy

### 9.1 Cloudflare Workers Deployment

**Development:**
```bash
# Frontend
cd packages/frontend
pnpm run dev  # Vite dev server

# Backend
cd packages/backend
pnpm run dev  # Wrangler dev with local D1
```

**Production:**
```bash
# Frontend - Deploy to Cloudflare Pages
cd packages/frontend
pnpm run build
wrangler pages deploy dist

# Backend - Deploy Workers
cd packages/backend
wrangler deploy
```

**CI/CD with GitHub Actions:**
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      # Deploy Backend
      - name: Deploy Workers
        run: |
          cd packages/backend
          pnpm install
          pnpm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
      
      # Deploy Frontend
      - name: Deploy Pages
        run: |
          cd packages/frontend
          pnpm install
          pnpm run build
          wrangler pages deploy dist
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

---

### 9.2 Database Migrations

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: './wrangler.toml',
    dbName: 'bento-db',
  },
})
```

```bash
# Generate migration
pnpm drizzle-kit generate:sqlite

# Apply to local D1
wrangler d1 migrations apply bento-db --local

# Apply to production D1
wrangler d1 migrations apply bento-db --remote
```

---

## 10. Performance Optimizations

### 10.1 Frontend Optimizations
- Code splitting by route (TanStack Router)
- Lazy load widgets
- Image lazy loading
- Virtual scrolling for long pages
- Debounced autosave
- Optimistic updates with TanStack Query

### 10.2 Backend Optimizations
- KV caching for API responses
- D1 query optimization (indexes)
- Durable Objects for rate limiting
- Conditional requests (ETag)
- Response compression
- Smart cache invalidation

### 10.3 Edge Caching
- Cache static pages at Cloudflare edge
- Cache-Control headers
- Purge cache on updates
- Stale-while-revalidate pattern

---

## 11. Security Considerations (CRITICAL)

### 11.1 Authentication & Authorization

**Enhanced Security Measures:**
- JWT rotation with refresh tokens (short-lived access tokens: 15min, refresh tokens: 7 days)
- CSRF protection with double-submit cookie pattern
- Secure httpOnly, SameSite=Strict cookies
- Password requirements: min 12 chars, mixed case, numbers, special chars
- Argon2id or bcrypt for password hashing (cost factor >= 13)
- Account lockout after 5 failed attempts (15min cooldown)
- 2FA/MFA support (TOTP, backup codes)
- Session management: concurrent session limits, device fingerprinting

```typescript
// Enhanced JWT validation middleware
app.use('/api/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  
  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET)
    if (!payload || !payload.sub) throw new Error('Invalid token')
    
    // Check if user exists and is active
    const user = await db.select().from(users).where(eq(users.id, payload.sub)).get()
    if (!user || !user.isActive) {
      return c.json({ error: 'Account inactive or deleted' }, 403)
    }
    
    c.set('userId', payload.sub)
    c.set('userRole', payload.role)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
})
```

### 11.2 Input Validation & Sanitization

**Validation Layer:**
- Zod for runtime type validation on all API endpoints
- SQL injection prevention via parameterized queries (Drizzle handles this)
- XSS prevention with DOMPurify for rich text content
- File upload validation: type, size (max 10MB), virus scanning (Cloudflare One)
- Rate limiting per endpoint and per user
- Request size limits (max 1MB body)

```typescript
// Example validation middleware
import { z } from 'zod'

const createPageSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(100),
  layoutConfig: z.record(z.any()).optional(),
  styleConfig: z.record(z.any()).optional(),
})

app.post('/api/pages', authMiddleware, async (c) => {
  const body = await c.req.json()
  
  // Validate input
  const validated = createPageSchema.safeParse(body)
  if (!validated.success) {
    return c.json({ error: 'Validation failed', details: validated.error }, 400)
  }
  
  // Check for slug collision
  const existing = await db.select().from(pages).where(eq(pages.slug, validated.data.slug)).get()
  if (existing) {
    return c.json({ error: 'Slug already taken' }, 409)
  }
  
  // ... rest of the code
})
```

### 11.3 Data Protection

**Encryption at Rest & in Transit:**
- TLS 1.3 for all communications (Cloudflare defaults)
- Encrypt sensitive data in D1 (application-level encryption for PII)
- Secure file storage in R2 (AES-256, signed URLs with expiration)
- Environment variables for all secrets (never commit to git)
- Secret rotation strategy
- Backup encryption

### 11.4 API Security

**Protection Measures:**
- API key management for third-party integrations
- CORS properly configured (whitelist domains in production)
- Content Security Policy (CSP) headers
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy header

```typescript
// Security headers middleware
app.use('*', async (c, next) => {
  c.header('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.github.com https://api.twitter.com"
  )
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  await next()
})
```

### 11.5 Rate Limiting

**Implementation with Durable Objects:**
```typescript
// Rate limiter using Durable Objects
export class RateLimiter {
  private state: DurableObjectState
  private env: Env
  private counts: Map<string, { count: number; resetTime: number }>

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
    this.counts = new Map()
  }

  async checkLimit(identifier: string, limit: number, window: number): Promise<boolean> {
    const now = Date.now()
    const entry = this.counts.get(identifier)
    
    if (!entry || entry.resetTime < now) {
      this.counts.set(identifier, { count: 1, resetTime: now + window * 1000 })
      return true
    }
    
    if (entry.count >= limit) {
      return false
    }
    
    entry.count++
    this.state.storage.put('counts', Array.from(this.counts.entries()))
    return true
  }
}
```

### 11.6 GDPR & Privacy Compliance

**Data Protection Requirements:**
- Right to erasure (account deletion with all data)
- Right to data portability (export user data)
- Cookie consent management
- Privacy policy page
- Terms of service
- Data retention policies (auto-delete inactive accounts after 2 years)
- Data breach notification procedures

---

## 12. Testing Strategy

### 12.1 Testing Pyramid

**Unit Tests (70%)**
- Jest/Vitest for frontend
- Vitest for backend Workers
- Test utilities and helper functions
- Test individual components in isolation
- Mock external dependencies

```typescript
// Example unit test
import { describe, it, expect } from 'vitest'
import { validatePageSlug } from '@/lib/validators'

describe('validatePageSlug', () => {
  it('should accept valid slugs', () => {
    expect(validatePageSlug('my-page')).toBe(true)
    expect(validatePageSlug('my-page-123')).toBe(true)
  })
  
  it('should reject invalid slugs', () => {
    expect(validatePageSlug('My Page')).toBe(false)
    expect(validatePageSlug('my_page')).toBe(false)
    expect(validatePageSlug('my page')).toBe(false)
  })
})
```

**Integration Tests (20%)**
- Test API endpoints with real database (SQLite in-memory)
- Test database migrations
- Test file upload/download flow
- Test authentication flows

```typescript
// Example integration test
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'

describe('Pages API', () => {
  let db: ReturnType<typeof drizzle>
  let app: Hono
  
  beforeAll(async () => {
    db = drizzle({ schema })
    await setupTestDB(db)
    app = createApp({ DB: db })
  })
  
  afterAll(async () => {
    await cleanupTestDB(db)
  })
  
  it('should create a page', async () => {
    const res = await testClient(app).pages.$post({
      json: { slug: 'test-page', title: 'Test Page' }
    })
    
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.slug).toBe('test-page')
  })
})
```

**E2E Tests (10%)**
- Playwright for browser automation
- Test critical user journeys
- Test drag-and-drop functionality
- Test responsive design across devices

```typescript
// Example E2E test
import { test, expect } from '@playwright/test'

test.describe('Page Editor', () => {
  test('should create and save a page', async ({ page }) => {
    await page.goto('/editor/new')
    await page.getByTestId('add-widget-link').click()
    await page.getByPlaceholder('Enter URL').fill('https://example.com')
    await page.getByPlaceholder('Title').fill('My Link')
    await page.getByTestId('save-button').click()
    
    await expect(page.getByText('Page saved successfully')).toBeVisible()
  })
})
```

### 12.2 Coverage Requirements

- **Minimum 80% code coverage** for critical paths
- **100% coverage** for security-related functions
- **100% coverage** for payment processing (if added)
- **100% coverage** for authentication/authorization

### 12.3 Testing Infrastructure

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
        
      - name: Run unit tests
        run: pnpm test:unit --coverage
        
      - name: Run integration tests
        run: pnpm test:integration
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 13. Monitoring & Observability

### 13.1 Logging Strategy

**Structured Logging:**
- Winston or Pino for backend logging
- Log levels: ERROR, WARN, INFO, DEBUG
- Correlation IDs for request tracing
- Structured JSON logs for easy parsing
- Log aggregation to Cloudflare Analytics

```typescript
// Logger utility
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: () => ({ time: new Date().toISOString() }),
  base: {},
})

// Usage
logger.info({ userId: '123', action: 'page_created' }, 'Page created')
logger.error({ error: err.message, stack: err.stack }, 'Failed to create page')
```

### 13.2 Error Tracking

**Integration with Error Monitoring:**
- Sentry or Cloudflare Analytics for error tracking
- Error boundary in React for frontend errors
- Global error handler in Workers
- Alert on critical errors (5xx rates > 1%)

```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } }
    })
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackError />
    }
    return this.props.children
  }
}
```

### 13.3 Performance Monitoring

**Metrics to Track:**
- API response times (p50, p95, p99)
- Frontend Core Web Vitals (LCP, FID, CLS)
- Worker CPU time and memory usage
- D1 query performance
- Cache hit rates
- Error rates

```typescript
// Performance middleware
app.use('*', async (c, next) => {
  const start = Date.now()
  
  await next()
  
  const duration = Date.now() - start
  c.env.ANALYTICS.writeDataPoint({
    blobs: [c.req.method, c.req.path],
    doubles: [duration],
    indexes: [c.req.method + c.req.path]
  })
})
```

### 13.4 Health Checks

**Health Check Endpoints:**
```typescript
app.get('/health', async (c) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'ok',
      cache: 'ok',
      storage: 'ok',
    },
  }
  
  // Check database
  try {
    await c.env.DB.prepare('SELECT 1').first()
  } catch (error) {
    checks.services.database = 'error'
    checks.status = 'degraded'
  }
  
  // Check cache
  try {
    await c.env.CACHE.put('health-check', 'ok', { expirationTtl: 10 })
  } catch (error) {
    checks.services.cache = 'error'
    checks.status = 'degraded'
  }
  
  const statusCode = checks.status === 'healthy' ? 200 : 503
  return c.json(checks, statusCode)
})
```

### 13.5 Alerting

**Alert Thresholds:**
- Error rate > 5% for 5 minutes
- Response time p95 > 2 seconds for 10 minutes
- Database connection failures
- Cache miss rate > 80%
- Worker CPU time limit exceeded

---

## 14. Database Design Improvements

### 14.1 Enhanced Schema with Constraints

```typescript
// schema.ts
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  subscriptionTier: text('subscription_tier').notNull().default('free'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: integer('locked_until', { mode: 'timestamp' }),
  twoFactorEnabled: integer('two_factor_enabled', { mode: 'boolean' }).default(false),
  twoFactorSecret: text('two_factor_secret'),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  usernameIdx: index('users_username_idx').on(table.username),
}))

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  layoutConfig: text('layout_config', { mode: 'json' }).notNull().default('{}'),
  styleConfig: text('style_config', { mode: 'json' }).notNull().default('{}'),
  seoConfig: text('seo_config', { mode: 'json' }).notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  viewCount: integer('view_count').default(0),
  customDomain: text('custom_domain').unique(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, (table) => ({
  userIdIdx: index('pages_user_id_idx').on(table.userId),
  slugIdx: index('pages_slug_idx').on(table.slug),
  isPublishedIdx: index('pages_is_published_idx').on(table.isPublished),
}))

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  position: text('position', { mode: 'json' }).notNull().default('{}'),
  size: text('size', { mode: 'json' }).notNull().default('{}'),
  content: text('content', { mode: 'json' }).notNull().default('{}'),
  styling: text('styling', { mode: 'json' }).default('{}'),
  orderIndex: integer('order_index').notNull(),
  viewport: text('viewport', { enum: ['desktop', 'mobile', 'both'] }).default('both'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  pageIdIdx: index('widgets_page_id_idx').on(table.pageId),
  pageIdOrderIdx: index('widgets_page_id_order_idx').on(table.pageId, table.orderIndex),
}))

export const platformConnections = sqliteTable('platform_connections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  platformUserId: text('platform_user_id'),
  connectedAt: integer('connected_at', { mode: 'timestamp' }).notNull(),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
}, (table) => ({
  userIdPlatformIdx: index('platform_connections_user_id_platform_idx').on(table.userId, table.platform),
}))

export const pageViews = sqliteTable('page_views', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull(),
  referrer: text('referrer'),
  country: text('country'),
  city: text('city'),
  deviceType: text('device_type'),
  browser: text('browser'),
  widgetId: text('widget_id').references(() => widgets.id),
}, (table) => ({
  pageIdViewedAtIdx: index('page_views_page_id_viewed_at_idx').on(table.pageId, table.viewedAt),
}))

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  changes: text('changes', { mode: 'json' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userIdCreatedAtIdx: index('audit_log_user_id_created_at_idx').on(table.userId, table.createdAt),
  entityIdCreatedAtIdx: index('audit_log_entity_id_created_at_idx').on(table.entityId, table.createdAt),
}))

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  revokedAt: integer('revoked_at', { mode: 'timestamp' }),
  deviceInfo: text('device_info', { mode: 'json' }),
}, (table) => ({
  userIdTokenIdx: index('refresh_tokens_user_id_token_idx').on(table.userId, table.token),
}))
```

### 14.2 Database Indexes for Performance

```sql
-- Additional indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_pages_user_slug ON pages(user_id, slug);
CREATE INDEX idx_widgets_page_order ON widgets(page_id, order_index);
CREATE INDEX idx_platform_connections_user_platform ON platform_connections(user_id, platform);
CREATE INDEX idx_page_views_page_viewed ON page_views(page_id, viewed_at);
```

### 14.3 Database Backup & Recovery

**Backup Strategy:**
- Daily automated backups to Cloudflare R2
- Point-in-time recovery (if available)
- Backup retention: 30 days
- Backup encryption
- Regular backup restoration testing

---

## 15. CI/CD & Deployment Pipeline Enhancements

### 15.1 Multi-Stage Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run ESLint
        run: pnpm lint
      
      - name: Run TypeScript checks
        run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run unit tests
        run: pnpm test:unit --coverage
      
      - name: Run integration tests
        run: pnpm test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Build frontend
        run: |
          cd packages/frontend
          pnpm build
      
      - name: Build backend
        run: |
          cd packages/backend
          pnpm build

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to staging
        run: |
          # Deploy Workers to staging
          # Deploy frontend to Cloudflare Pages preview
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Run database migrations
          # Deploy Workers to production
          # Deploy frontend to Cloudflare Pages production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
```

### 15.2 Environment Management

**Environments:**
- **Development**: Local with hot reload
- **Staging**: Cloudflare Workers + Pages (preview domain)
- **Production**: Cloudflare Workers + Pages (custom domain)

**Environment Variables:**
```yaml
# wrangler.toml
[vars]
ENVIRONMENT = "production"
API_URL = "https://api.example.com"
CORS_ORIGIN = "https://example.com"

# Secrets (never commit)
[secrets]
JWT_SECRET
DATABASE_URL
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
```

### 15.3 Feature Flags

**Feature Flag Implementation:**
```typescript
// Feature flags using Cloudflare KV
export async function isFeatureEnabled(
  flag: string,
  userId?: string
): Promise<boolean> {
  const enabled = await env.FEATURE_FLAGS.get(flag)
  if (enabled === 'true') return true
  if (enabled === 'false') return false
  
  // Check user-specific flag
  if (userId) {
    const userFlag = await env.FEATURE_FLAGS.get(`${flag}:${userId}`)
    if (userFlag === 'true') return true
  }
  
  return false
}
```

---

## 16. Disaster Recovery & Backup Strategy

### 16.1 Backup Procedures

- **Daily Full Backups**: D1 database exports to R2
- **Hourly Incremental Backups**: Changed data only
- **30-Day Retention**: Keep backups for 30 days
- **Off-site Replication**: Cross-region backup replication

### 16.2 Recovery Procedures

**Recovery Scenarios:**
1. Single table corruption: Restore from latest backup + replay audit logs
2. Full database loss: Restore from latest full backup
3. Region outage: Failover to another region (if applicable)

**RTO/RPO:**
- Recovery Time Objective (RTO): 1 hour
- Recovery Point Objective (RPO): 15 minutes

---

## 17. Code Quality Standards

### 17.1 Linting & Formatting

**Configuration:**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

**Prettier Configuration:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 17.2 Git Workflow

**Branching Strategy:**
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Production hotfixes

**Commit Convention:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 17.3 Code Review Checklist

- [ ] Code follows style guide
- [ ] Tests included and passing
- [ ] No console.log or debug statements
- [ ] No secrets or hardcoded values
- [ ] Security vulnerabilities addressed
- [ ] Performance considered
- [ ] Documentation updated
- [ ] Breaking changes documented

---

## 18. Scalability Considerations

### 18.1 Horizontal Scaling

**Workers Auto-scaling:**
- Cloudflare automatically scales Workers
- No manual scaling required
- Handle up to 10,000 requests per second

**Database Scaling:**
- D1 read replicas (if available)
- Query optimization and indexing
- Connection pooling
- Caching strategies

### 18.2 Caching Strategy

**Multi-Layer Caching:**
1. **Browser Cache**: Static assets (1 week)
2. **CDN Cache**: Cloudflare edge cache (1 hour)
3. **KV Cache**: API responses (15 minutes)
4. **Application Cache**: TanStack Query (5 minutes)

### 18.3 Load Testing

**Scenarios:**
- 1,000 concurrent users viewing pages
- 100 concurrent users editing pages
- 10,000 requests per minute to API endpoints
- File upload stress testing (10MB files, 100 concurrent)

---

## 19. Documentation Standards

### 19.1 Required Documentation

**Architecture Documentation:**
- System architecture diagram
- Component interaction diagrams
- Data flow diagrams
- Security model

**API Documentation:**
- OpenAPI/Swagger specification
- Endpoint documentation
- Request/response examples
- Error response codes

**Developer Documentation:**
- Setup guide
- Development workflow
- Code style guide
- Testing guide
- Deployment guide

**User Documentation:**
- Getting started guide
- Feature documentation
- Troubleshooting guide
- FAQ

### 19.2 Inline Documentation

**Code Comments:**
```typescript
/**
 * Creates a new page for a user.
 * 
 * @param userId - The ID of the user creating the page
 * @param data - Page configuration including slug, title, and layout
 * @returns Created page object with ID
 * @throws {Error} If slug is already taken or user doesn't exist
 * @example
 * ```ts
 * const page = await createPage('user123', {
 *   slug: 'my-page',
 *   title: 'My Page',
 *   layoutConfig: {}
 * })
 * ```
 */
export async function createPage(
  userId: string,
  data: CreatePageInput
): Promise<Page> {
  // Implementation
}
```

---

## 20. Recommended Tech Stack Summary

```
Frontend:
├── React 18+
├── TypeScript
├── Vite (build tool)
├── TanStack Router (routing)
├── TanStack Query (server state)
├── Zustand (local state)
├── TailwindCSS (styling)
├── Radix UI / shadcn/ui (components)
├── Framer Motion (animations)
├── dnd-kit (drag-and-drop)
├── Tiptap (rich text editor)
├── Vitest (testing)
├── Playwright (E2E testing)
└── ESLint + Prettier (code quality)

Backend:
├── Cloudflare Workers (runtime)
├── Hono (web framework)
├── Drizzle ORM (database)
├── Cloudflare D1 (database)
├── Cloudflare KV (caching)
├── Cloudflare R2 (storage)
├── Cloudflare Durable Objects (state management)
├── Zod (validation)
├── Vitest (testing)
└── Workerd (local development)

DevOps & Infrastructure:
├── Cloudflare Pages (hosting)
├── Cloudflare DNS (domain management)
├── Cloudflare Analytics (monitoring)
├── GitHub Actions (CI/CD)
├── pnpm (package manager)
├── Wrangler (deployment tool)
└── Sentry (error tracking)

Security:
├── JWT (authentication)
├── Argon2id (password hashing)
├── DOMPurify (XSS prevention)
├── Helmet.js (security headers)
├── CORS (origin control)
└── Zod (input validation)
```

---

## 21. Final Checklist for Production Readiness

### 21.1 Security Checklist

- [ ] All secrets stored in environment variables
- [ ] JWT tokens properly configured with rotation
- [ ] Password hashing with Argon2id (cost factor >= 13)
- [ ] Rate limiting implemented on all endpoints
- [ ] Input validation on all API endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (DOMPurify for user content)
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] File upload validation (type, size, virus scanning)
- [ ] 2FA/MFA support implemented
- [ ] Audit logging enabled
- [ ] Regular security audits scheduled

### 21.2 Performance Checklist

- [ ] Code splitting implemented
- [ ] Lazy loading for widgets
- [ ] Image optimization enabled
- [ ] CDN caching configured
- [ ] Database indexes optimized
- [ ] KV caching for API responses
- [ ] Response compression enabled
- [ ] Cache-Control headers set
- [ ] API response times < 200ms (p95)
- [ ] Core Web Vitals passing (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### 21.3 Monitoring & Logging Checklist

- [ ] Structured logging implemented
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] Health check endpoints created
- [ ] Alert thresholds configured
- [ ] Log aggregation to Cloudflare Analytics
- [ ] Uptime monitoring configured

### 21.4 Testing Checklist

- [ ] Unit tests with > 80% coverage
- [ ] Integration tests for critical paths
- [ ] E2E tests for user journeys
- [ ] Load testing completed
- [ ] Security testing completed
- [ ] Browser compatibility testing
- [ ] Mobile responsiveness testing

### 21.5 Documentation Checklist

- [ ] Architecture documentation complete
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Developer setup guide
- [ ] Deployment guide
- [ ] User documentation
- [ ] Troubleshooting guide
- [ ] Code comments for complex logic

### 21.6 Deployment Checklist

- [ ] CI/CD pipeline configured
- [ ] Automated backups enabled
- [ ] Disaster recovery plan documented
- [ ] Environment-specific configurations
- [ ] Feature flags implemented
- [ ] Rolling deployment strategy
- [ ] Database migrations automated
- [ ] Zero-downtime deployment tested

---

## 22. Post-Launch Considerations

### 22.1 Maintenance & Support

- Regular security updates and dependency patches
- Performance monitoring and optimization
- Bug fixes and hotfixes
- Feature requests and improvements
- User support and feedback collection

### 22.2 Scalability Planning

- Monitor resource usage and plan for scale
- Implement auto-scaling where needed
- Optimize database queries and indexes
- Implement caching strategies
- Consider read replicas for database

### 22.3 Continuous Improvement

- Collect and analyze user feedback
- A/B testing for features
- Performance optimization
- Security audits and penetration testing
- Regular code reviews and refactoring

---

## Conclusion

This enhanced implementation plan provides a robust, production-ready architecture for building a Bento.me clone. By following this comprehensive specification, the project will benefit from:

1. **Enhanced Security**: Multi-layered security approach with JWT rotation, rate limiting, input validation, and proper data protection
2. **Comprehensive Testing**: Unit, integration, and E2E testing with high coverage requirements
3. **Observability**: Full monitoring, logging, and alerting capabilities
4. **Scalability**: Designed to handle growth from MVP to production scale
5. **Maintainability**: Clean code architecture, documentation, and development standards
6. **Reliability**: Disaster recovery, backup strategies, and health monitoring

The updated timeline of **12-16 weeks** (increased from 8-12) reflects the addition of these critical production considerations that ensure the application is "bullet proof" and enterprise-ready.

---

**Document Version**: 2.0  
**Last Updated**: January 2026  
**Status**: Production-Ready Specification