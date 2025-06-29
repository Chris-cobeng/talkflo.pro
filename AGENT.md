# Agent Instructions

## Build/Lint/Test Commands
- `npm run dev` - Start development server (Vite, port 8080)
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - ESLint check
- `npm run preview` - Preview production build
- No test framework configured

## Architecture & Structure
- React + TypeScript + Vite SPA with shadcn/ui components
- Authentication: Clerk (@clerk/clerk-react)
- Database: Supabase (client in src/integrations/supabase/)
- State: React Query (@tanstack/react-query) for server state
- Routing: React Router DOM
- Styling: Tailwind CSS with custom theme and CSS variables

## Code Style Guidelines
- Import alias: `@/*` maps to `./src/*`
- Components: PascalCase, prefer functional components with hooks
- File structure: /src/components/, /src/pages/, /src/hooks/, /src/types/, /src/lib/
- TypeScript: Relaxed config (noImplicitAny: false, strictNullChecks: false)
- Utilities: Use src/lib/utils.ts `cn()` for className merging
- UI: shadcn/ui components in src/components/ui/
- Types: Centralized in src/types/index.ts (Note, Folder, Settings, RecordingState)
- Error handling: Toast notifications via useToast hook
