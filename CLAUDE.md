# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Build for production (output: dist/)
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run preview      # Preview production build
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State**: React Query (server) + Zustand (client)
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Maps**: Google Maps JavaScript API
- **UI**: Radix UI + Lucide icons + Recharts

## Architecture

```
src/
├── App.tsx                    # Route definitions
├── dashboard/
│   ├── layouts/               # DashboardLayout wrapper
│   ├── pages/                 # Feature modules
│   │   ├── CRM/               # Lead/client management
│   │   ├── Projects/          # Project & Kanban board
│   │   ├── Proposals/         # Sales proposals
│   │   ├── Finance/           # Transactions & receipts
│   │   ├── CMS/               # Media library
│   │   └── Sandbox/           # Lead queue & metrics
│   ├── components/            # Shared dashboard components
│   │   ├── sections/          # Reusable UI sections (PageHeader, DataTable, StatCard, etc.)
│   │   ├── sandbox/           # Sandbox-specific components
│   │   └── navigation/        # Sidebar navigation system
│   └── hooks/                 # Custom hooks for data fetching (useClients, useProjects, etc.)
├── lib/
│   ├── supabase.ts            # Supabase client + RPC calls
│   ├── queryClient.ts         # React Query config
│   └── store.ts               # Zustand store (sidebar state, nav order)
├── components/
│   ├── ui/                    # Base UI components (Button, Input, Card, etc.)
│   └── ProtectedRoute.tsx     # Auth guard
└── types/                     # TypeScript definitions (database.ts, finance.ts, etc.)
```

## Key Patterns

**Data Fetching**: All API calls go through custom hooks in `dashboard/hooks/` using React Query.

**Authentication**: Supabase Auth with RLS policies. Protected routes wrap dashboard with `ProtectedRoute`.

**Database Types**: Supabase schema types in `types/database.ts`. Main tables: `profiles`, `clients`, `interactions`, `tasks`, `projects`, `project_tasks`, `media_files`.

**Form Validation**: Zod schemas with `@hookform/resolvers` for type-safe forms.

**Component Exports**: Barrel exports via `index.ts` files for cleaner imports.

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_MAPS_API_KEY=
VITE_OPENAI_API_KEY=
```

## Routes

- `/login`, `/reset-password` - Public auth pages
- `/dashboard` - Overview (protected)
- `/dashboard/crm`, `/dashboard/crm/:id` - CRM module
- `/dashboard/projects` - Projects Kanban
- `/dashboard/proposals`, `/dashboard/proposals/:id` - Proposals
- `/dashboard/finance`, `/dashboard/finance/estatisticas` - Finance
- `/dashboard/cms` - Media library
- `/dashboard/sandbox/*` - Lead sandbox & metrics
