# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run both client and server concurrently
npm run dev

# Client only (Vite dev server on :5173)
npm run dev:client

# Server only (Express on :3001, tsx watch)
npm run dev:server

# Build client (type-check + Vite build)
cd client && npm run build

# Lint client
cd client && npm run lint

# Type-check client only (no emit)
cd client && npx tsc --noEmit
```

No test framework is configured.

## Architecture

Full-stack TypeScript resume builder. Client (React 19 + Vite 8) and server (Express 5) with shared types.

### Monorepo Layout

- `client/` — React SPA with Tailwind CSS 4, shadcn-ui components, react-router-dom
- `server/` — Express API with in-memory storage (data lost on restart)
- `shared/types/` — TypeScript interfaces shared between client and server

### Routing

Routes defined in `client/src/App.tsx` via react-router-dom:
- `/builder` — Resume builder (wrapped in `ResumeProvider` for context)
- `/settings` — AI provider settings page (standalone, no context)
- `*` → redirects to `/builder`

### State Management

Resume state uses React Context + `useReducer` in `client/src/context/resume-context.tsx`. Actions follow a discriminated union pattern (`SET_RESUME`, `UPDATE_PERSONAL_INFO`, `ADD_SECTION`, etc.). Auto-saves to server with 500ms debounce on state changes.

### Client-Server Communication

API functions in `client/src/lib/api.ts`. Vite proxies `/api/*` to `http://localhost:3001`. Server routes are in `server/src/routes/`.

### Shared Types

`shared/types/resume.ts` defines `ResumeData` with a discriminated union `Section` type (7 variants: summary, work-experience, education, skills, projects, certifications, custom). Client re-exports via `client/src/types/resume.ts` using the `@shared` path alias. Server imports directly with relative paths ending in `.js`.

### Path Aliases

- `@/*` → `client/src/*` (client only)
- `@shared/*` → `shared/*` (client uses this alias; server uses relative paths ending in `.js`, e.g., `../../shared/types/resume.js`)

### Styling

Tailwind CSS 4 with OKLCH-based CSS variables in `client/src/index.css` (light/dark themes). Utility function `cn()` (clsx + tailwind-merge) in `client/src/lib/utils.ts`. UI primitives in `client/src/components/ui/` follow shadcn patterns.

### Key Patterns

- **Panel layout**: `react-resizable-panels` — 3-panel when editing, 2-panel when viewing
- **Drag-and-drop**: `@dnd-kit` for section reordering in sidebar
- **PDF export**: `@react-pdf/renderer` in `client/src/components/preview/`
- **Editor pattern**: Each section editor uses local `useState`, dispatches to context on save
- **API key testing**: Server makes real HTTP requests to provider APIs (Anthropic, OpenAI, Gemini, Kimi) in `server/src/routes/api-keys.ts`
- **Data lifecycle**: Server fetches resume on mount → local reducer state → 500ms debounced auto-save back to server

### Environment Variables

- `PORT` — Server port (default: `3001`)
- `CORS_ORIGIN` — Allowed CORS origin (default: `*`)
- `VITE_API_URL` — Client API base URL (default: `/api`, proxied in dev)

### Deployment

Client deploys to Vercel with SPA rewrite (`client/vercel.json`). Server requires separate hosting (not included in Vercel config).
