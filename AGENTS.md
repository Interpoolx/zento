# AGENTS.md - Zento Project Agent Commands & Conventions

This document defines commands and conventions for working with agents on the Zento project (Bento.me Clone).

## Project Overview

**Zento** is a drag-and-drop personal profile page builder with rich media widgets and platform integrations.

- **Tech Stack**: React 18, TypeScript, Vite, TailwindCSS, Zustand, dnd-kit, Framer Motion
- **Type**: Frontend SPA (backend on Cloudflare Workers, not in this repo)
- **Build System**: Vite
- **Package Manager**: pnpm (implied by workspace config)

---

## Directory Structure

```
zento/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state stores
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── styles/          # Global styles (Tailwind)
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── index.html           # HTML entry point
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
├── tailwind.config.js   # Tailwind config
└── .gitignore          # Git ignore rules
```

---

## Common Agent Commands

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Type check without building
npx tsc --noEmit
```

### Code Quality

```bash
# Format code (setup ESLint/Prettier first if needed)
pnpm format

# Lint code
pnpm lint

# Run tests (when added)
pnpm test
```

### File Operations

- **Component files**: Create in `src/components/` with `.tsx` extension
- **Type definitions**: Place in `src/types/` as `.ts` files
- **Hooks**: Create in `src/hooks/` as `use*.ts` files
- **Store**: Zustand stores in `src/store/` 
- **Utilities**: Helper functions in `src/utils/`

---

## Code Style Conventions

### TypeScript
- Use strict mode (tsconfig.json configured)
- Explicit type annotations for function parameters/returns
- Avoid `any` type - use `unknown` when necessary
- Use interfaces for objects, types for unions/primitives

### React Components
- Functional components with hooks only
- JSX files use `.tsx` extension
- Props interface: `interface ComponentProps { ... }`
- Use `React.FC<Props>` for typing

### Styling
- Use TailwindCSS utility classes for styling
- Custom CSS in `.module.css` if needed
- Component-scoped styles via CSS modules
- Dark mode support via Tailwind dark mode utilities

### State Management
- Use Zustand for global state
- Store files in `src/store/` with `*.store.ts` naming
- Create custom hooks to use stores: `useStore()`

### File Naming
- Components: PascalCase (`Button.tsx`, `Modal.tsx`)
- Utilities: camelCase (`formatDate.ts`, `validateEmail.ts`)
- Stores: camelCase with `.store.ts` suffix (`user.store.ts`)
- Hooks: camelCase with `use` prefix (`useModal.ts`)

---

## Testing (When Implemented)

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

Test files location: `src/**/*.test.ts(x)`

---

## Build & Deploy

### Local Build
```bash
pnpm build
# Output: dist/
```

### Type Checking Before Deploy
```bash
npx tsc --noEmit
```

---

## Dependencies Management

### Adding Dependencies
```bash
pnpm add <package>          # Production
pnpm add -D <package>       # Development
```

### Current Key Dependencies
- **react** & **react-dom**: UI framework
- **@dnd-kit/***: Drag-and-drop system
- **framer-motion**: Animations
- **zustand**: State management
- **tailwindcss**: Styling
- **lucide-react**: Icons
- **typescript**: Type safety
- **vite**: Build tool

---

## Git Workflow

### Branch Naming
```
feature/<feature-name>
bugfix/<bug-name>
chore/<task-name>
docs/<doc-name>
```

### Commit Messages
```
feat: Add new widget component
fix: Resolve drag-drop layout bug
docs: Update AGENTS.md
style: Format code with Prettier
refactor: Extract store logic
chore: Update dependencies
```

### Before Committing
1. Run `pnpm build` to check build passes
2. Run type checker: `npx tsc --noEmit`
3. Verify no console errors

---

## Debugging

### Browser DevTools
- React DevTools extension
- Redux DevTools (for Zustand via middleware)
- Network tab for API calls

### Common Issues

**Build fails**
```bash
pnpm install  # Reinstall deps
rm -rf node_modules dist  # Clean rebuild
pnpm build
```

**Type errors**
```bash
npx tsc --noEmit  # Show all type errors
```

**HMR not working**
- Restart dev server: `pnpm dev`
- Check Vite config for HMR settings

---

## Implementation Priority

Based on `implementation-plan.md`:

1. **High Priority**
   - Page Editor (drag-and-drop interface)
   - Basic Widgets (Link, Image, Text)
   - Customization & Styling

2. **Medium Priority**
   - Smart Widgets (platform integrations)
   - Settings & User Preferences
   - Responsive Design (mobile/desktop)

3. **Lower Priority**
   - Advanced animations
   - Analytics integrations
   - Offline mode

---

## Architecture Notes

### Component Hierarchy
```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── MainContent
│       ├── PageEditor (with dnd-kit)
│       │   ├── Canvas
│       │   │   └── Widgets (draggable)
│       │   └── Toolbar
│       └── Settings
└── Modals/Portals
```

### State Management
- **Global State** (Zustand): User, pages, widgets, editor state
- **Local State** (useState): Form inputs, UI toggles, modals
- **Server State** (when connected): Pages, user data (TanStack Query)

### Key Stores
- `user.store.ts` - User auth & profile
- `editor.store.ts` - Page editor state (widgets, layout)
- `ui.store.ts` - UI state (modals, notifications)

---

## Agent Task Templates

### Adding a New Widget
1. Create widget component: `src/components/Widgets/NewWidget.tsx`
2. Add widget type to `src/types/widget.ts`
3. Add widget creator to editor toolbar
4. Register in widget factory
5. Add styling options
6. Test drag-drop behavior

### Fixing a Bug
1. Reproduce in dev server
2. Identify root cause
3. Make minimal fix
4. Verify with `pnpm build`
5. Check type safety: `npx tsc --noEmit`

### Refactoring
1. Create feature branch
2. Make isolated changes
3. Verify no visual/functional changes
4. Keep commits atomic
5. Update tests if they exist

---

## Resources

- **Implementation Plan**: [implementation-plan.md](implementation-plan.md)
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com
- **dnd-kit**: https://docs.dndkit.com
- **Zustand**: https://github.com/pmndrs/zustand

---

**Last Updated**: January 2026  
**Maintainer**: Zento Team
