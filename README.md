# Alpha Terminal

A retail **crypto intelligence terminal** that aggregates on-chain, market, and trend
signals into **explainable scores** — helping a trader spot early opportunities and avoid
scams. DexScreener-grade data density, a Nansen-style smart-money lens, and a
Bloomberg-grade interface, with an AI layer that explains its reasoning.

> **Status: Phase 0 — The Interface.** The entire terminal is built and navigable, powered
> by a realistic **sample-data layer**. Every panel carries a small **`SAMPLE`** badge. As
> real sources connect in later phases, badges flip to **`LIVE`** automatically — the user
> always knows which data is which.

## Core principles

1. **Every score is explainable.** Any number expands into the exact inputs, weights, and
   reasoning behind it (the Conviction Ring + Score Breakdown panel). No black boxes.
2. **Never fake data silently.** Phase 0 panels are badged `SAMPLE`; a panel reads `LIVE`
   only when its source is genuinely connected.
3. **No price predictions.** Output is scenario analysis and relative rankings grounded in
   observable data — never probabilities of future returns.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Phase 0 needs **no API keys** — it runs entirely on the sample-data layer.

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
```

When you start wiring live sources, copy the env template and fill in keys (each has a
comment on where to obtain it):

```bash
cp .env.example .env.local
```

## Screens

| Route             | Screen                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| `/`               | **Master Dashboard** — market pulse, narratives, opportunities, new launches, movers heatmap, draggable panels (persisted to localStorage) |
| `/screener`       | **Token Screener** — virtualized 1,000+ row table, filters, saved presets ("Early Discovery" built in) |
| `/token/[address]`| **Token Case File** — chart, score breakdown, forensics, holders, scenarios, AI research brief |
| `/discovery`      | **Discovery** — ranked opportunity cards per preset, each showing the "why" |
| `/smart-money`    | **Smart Money** — tracked-wallet table (honestly badged SAMPLE — premium data) |
| `/alerts`         | **Alerts Center** — rule builder, rule list with toggles, notification history |
| `/watchlist`      | **Watchlist** — the screener table over saved tokens |
| `/settings`       | **Settings** — API-key slots for every future integration with connected/disconnected status |
| `/styleguide`     | **Styleguide** — palette, type scale, the Conviction Ring at every size, badges, table styles |

Plus a **Command Palette (⌘K)** to jump to any token/screen and run actions.

## Architecture

All data flows through **typed service interfaces** in
[`src/lib/datasources/types.ts`](src/lib/datasources/types.ts). Phase 0 implements each as
a `sample/*` source returning realistic generated data with simulated latency and
live-feeling updates. Later phases drop in `live/*` implementations behind the same
interfaces — **components never change**. A single config map
([`config.ts`](src/lib/datasources/config.ts)) controls sample/live per source and drives
the `SAMPLE`/`LIVE` badges automatically. Fetching is **TanStack Query** throughout, even
against sample sources, so swapping to live APIs changes nothing in the components.

```mermaid
flowchart TD
    subgraph UI["UI — components (never change between phases)"]
      DASH[Dashboard]
      SCR[Screener]
      DET[Token Case File]
      RING[Conviction Ring + Score Breakdown]
    end

    subgraph Q["TanStack Query hooks — src/lib/hooks/use-data.ts"]
      H[useTokens / useToken / useForensics / useHolders / useBrief ...]
    end

    subgraph REG["Source registry — src/lib/datasources/index.ts"]
      direction LR
      CFG[[config.ts<br/>SOURCE_MODE: sample | live]]
    end

    subgraph IFACE["Typed interfaces — types.ts"]
      M[MarketDataSource]
      O[OnChainSource]
      S[SecuritySource]
      A[AISource]
    end

    subgraph SAMPLE["Phase 0 — sample/*"]
      SM[sample/market.ts]
      SO[sample/onchain.ts]
      SS[sample/security.ts]
      SA[sample/ai.ts]
    end

    subgraph LIVE["Phase 1+ — live/* (same signatures)"]
      LM[DexScreener · GeckoTerminal · CoinGecko]
      LO[Helius]
      LS[GoPlus · RugCheck]
      LA[Anthropic Claude]
    end

    SCORE[[Scoring engine<br/>momentum.ts · risk.ts<br/>pure · deterministic]]

    UI --> Q --> REG
    CFG -. selects .-> IFACE
    IFACE --- M & O & S & A
    M & O & S & A -->|sample| SAMPLE
    M & O & S & A -.->|live| LIVE
    SAMPLE --> SCORE
    LIVE --> SCORE
    SCORE --> RING
```

### Key directories

```
src/
  app/                      # App Router pages (one per screen)
  components/
    dashboard/              # dashboard panels + draggable grid (dnd-kit)
    screener/               # filter bar + virtualized table (TanStack Virtual)
    token/                  # case-file panels (chart, forensics, holders, scenario, AI brief)
    score/                  # explainable score breakdown
    shell/                  # sidebar, topbar, command palette, alerts ticker
    ui/                     # design-system primitives (Conviction Ring, badges, ...)
  lib/
    datasources/
      types.ts              # the contracts
      config.ts             # sample/live switch + integrations
      index.ts              # resolved source registry
      sample/               # Phase 0 generated data + seeded universe
    scoring/                # momentum.ts, risk.ts (pure, documented in SCORING.md)
    hooks/                  # TanStack Query wrappers
    store/                  # localStorage stores (watchlist, presets, alert rules)
    utils.ts                # formatters + cn()
```

## Design system

Defined as Tailwind v4 design tokens in [`src/app/globals.css`](src/app/globals.css) and
showcased at [`/styleguide`](http://localhost:3000/styleguide).

- **Palette** — near-black field (`--bg #07080C`), panels (`#0E1117`), with color used as
  *signal*: cyan `--signal` (live/positive), `--danger` red, `--warn` amber, `--profit`
  green.
- **Type** — Space Grotesk (UI) + JetBrains Mono with `tabular-nums` for every number.
- **Conviction Ring** — segmented circular gauge (one segment per score component) that
  renders from 16px in table rows to 120px on the detail header. The product's identity.
- **Motion** — restrained: cyan tick-flash on number updates, 150ms panel fade-slide,
  scrolling alerts ticker; all respect `prefers-reduced-motion`.

## Roadmap

- **Phase 0 — Interface** ✅ (this build): every screen on the sample-data layer.
- **Phase 1 — Live market data (Solana first):** DexScreener, GeckoTerminal, CoinGecko,
  Helius, GoPlus, RugCheck behind `live/*` with Upstash caching, zod validation, retries,
  and honest "source degraded" states. Supabase for persistence.
- **Phase 2 — Scoring + AI:** see [`SCORING.md`](SCORING.md); Claude research agent
  (cite-only, no predictions); Vercel Cron score snapshots → sparklines.
- **Phase 3 — Alerts + Discovery live:** cron-evaluated rules, Telegram delivery, rug
  early-warning on watchlisted tokens.
- **Phase 4 — Expansion:** Base + Ethereum via the same pipeline, read-only portfolio
  tracking, Smart Money live (only with a real labeled-wallet source).

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind v4 · TanStack Query · TanStack
Virtual · lightweight-charts · dnd-kit · cmdk · lucide-react · zod. Planned: Supabase,
Upstash Redis, Anthropic API, Vercel + Vercel Cron.

> **Note on `shadcn/ui`:** the design calls for shadcn-style primitives. To keep Phase 0
> fully self-contained and offline-buildable, the equivalent primitives are hand-built in
> `src/components/ui/` against the same Tailwind tokens and Radix-style patterns, so the
> shadcn CLI can be layered in later without rework.

---

*Analytical tooling, not financial advice.*
