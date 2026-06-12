# ALPHA TERMINAL

Phase 0 UI-first build of a retail crypto intelligence terminal.  
Current focus: fully navigable interface on explicitly labeled sample data, with typed datasource boundaries that are ready for live API swaps in later phases.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS
- TanStack Query
- dnd-kit
- lightweight-charts (installed for upcoming token-detail chart work)

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Implemented routes (Phase 0 so far)

- `/styleguide` — design token system, typography, Conviction Ring variants, badges, and table density language
- `/dashboard` — Master Dashboard panels with drag/reorder + localStorage persistence, sample/live source badges, and query-driven sample data

## Datasource architecture (UI-first contract)

All UI reads through typed datasource interfaces in:

- `src/lib/datasources/types.ts`
- `src/lib/datasources/index.ts`
- `src/lib/datasources/config.ts`

Phase 0 routes to `sample/*` implementations with simulated latency and jittered values.  
Future phases can swap individual sources to `live/*` by changing mode config only, without touching components.

```mermaid
flowchart LR
  UI[App Router Screens<br/>/styleguide /dashboard] --> Q[TanStack Query Hooks]
  Q --> DS[datasources/index.ts]
  DS --> MODE[sourceModeMap]
  MODE --> SAMPLE[sample/* implementations]
  MODE --> LIVE[live/* implementations (future)]
  SAMPLE --> TYPES[types.ts interfaces]
  LIVE --> TYPES
```

## Environment

Create `.env.local` as needed in later phases.  
No live provider keys are required for the current Phase 0 implementation.
