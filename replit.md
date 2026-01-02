# Zento - Profile Page Builder

## Overview

Zento is a drag-and-drop personal profile page builder (similar to Bento.me or Linktree). Users can create customizable profile pages with rich media widgets, social platform integrations, and responsive layouts. The application is a React SPA with plans for a Cloudflare Workers backend (not yet implemented in this repository).

**Core Features:**
- Drag-and-drop widget-based page editor
- Multiple widget types: links, images, videos, text, social icons, dividers
- Responsive preview (desktop/mobile)
- Customizable styling and layouts
- Grid-based positioning system

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server (runs on port 5000)
- **TailwindCSS** for utility-first styling with custom design tokens
- **Zustand** for lightweight state management with persistence
- **dnd-kit** for drag-and-drop functionality
- **Framer Motion** for animations

### Component Structure
- `/src/components/ui/` - Reusable UI primitives (Button, Input, Card, Tabs)
- `/src/components/widgets/` - Widget type renderers (LinkWidget, ImageWidget, etc.)
- `/src/components/editor/` - Main editor interface and canvas
- `/src/store/` - Zustand stores for application state
- `/src/types/` - TypeScript type definitions
- `/src/lib/` - Utility functions and widget registry

### State Management Pattern
The editor uses a single Zustand store (`editorStore`) with persistence middleware. The store manages:
- Current page configuration (layout, style, widgets)
- Selected widget state
- CRUD operations for widgets
- Page publishing state

### Widget System
Widgets are the core building blocks with a consistent structure:
- Each widget has a type, size, position, content, and style
- Sizes: small (1x1), medium (2x1), large (2x2), wide (4x1), tall (1x2)
- Widget registry (`widget-registry.ts`) defines templates and size configurations
- WidgetRenderer dispatches to appropriate type-specific components

### Styling Approach
- TailwindCSS with custom color palette (primary scale)
- Custom animations defined in tailwind.config.js
- `cn()` utility combining clsx and tailwind-merge for conditional classes
- Custom scrollbar utilities

## External Dependencies

### Runtime Dependencies
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` - Drag-and-drop system
- `framer-motion` - Animation library
- `lucide-react` - Icon library
- `zustand` - State management
- `clsx`, `tailwind-merge` - CSS class utilities

### Planned Backend (Not Yet Implemented)
Per implementation-plan.md, the backend is intended to use:
- Cloudflare Workers with Hono framework
- Cloudflare D1 for database
- JWT-based authentication with OAuth support
- Edge-first deployment architecture

### External Services Referenced
- Google Fonts (Inter font family)
- Google Favicon service for link previews
- YouTube/Vimeo embed support in VideoWidget