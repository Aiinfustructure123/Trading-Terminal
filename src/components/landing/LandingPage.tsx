"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap, Filter, Compass, Wallet2, Bell, BookMarked,
  Settings, Command, ArrowRight, CheckCircle, Circle,
  ExternalLink, ChevronDown, Shield, Brain,
  TrendingUp, Layers, Cpu, Globe, GitFork,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Shared primitives ────────────────────────────────────────────────────────

function GlowDot({ className }: { className?: string }) {
  return (
    <span className={cn(
      "inline-block w-2 h-2 rounded-full bg-signal animate-pulse",
      className
    )} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <div className="h-px w-8 bg-signal/40" />
      <span className="text-xs font-mono uppercase tracking-widest text-signal">{children}</span>
      <div className="h-px w-8 bg-signal/40" />
    </div>
  );
}

// ── Animated terminal preview ────────────────────────────────────────────────

const TERMINAL_LINES = [
  { delay: 0,    text: "$ initializing alpha-terminal...",              color: "text-muted" },
  { delay: 400,  text: "> connecting data source registry",             color: "text-signal" },
  { delay: 800,  text: "  ✓ market source     [SAMPLE]",                color: "text-profit" },
  { delay: 1100, text: "  ✓ token screener    [SAMPLE · 1,052 tokens]", color: "text-profit" },
  { delay: 1400, text: "  ✓ on-chain source   [SAMPLE]",                color: "text-profit" },
  { delay: 1700, text: "  ✓ security scanner  [SAMPLE]",                color: "text-profit" },
  { delay: 2000, text: "  ✓ ai brief engine   [SAMPLE]",                color: "text-profit" },
  { delay: 2300, text: "> computing conviction scores...",              color: "text-signal" },
  { delay: 2700, text: "  BONK   score=84  risk=Low      ████████░░",   color: "text-ink" },
  { delay: 2900, text: "  AIAGENT score=55  risk=Moderate █████░░░░░",  color: "text-ink" },
  { delay: 3100, text: "  REKT   score=28  risk=High      ██░░░░░░░░",  color: "text-warn" },
  { delay: 3400, text: "> all panels online. terminal ready.",          color: "text-signal" },
  { delay: 3800, text: "$ _",                                           color: "text-signal" },
];

function TerminalPreview() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = TERMINAL_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay + 600)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative">
      {/* Glow behind terminal */}
      <div className="absolute inset-0 bg-signal/5 blur-3xl rounded-full scale-75 -z-10" />

      <div className="bg-panel border border-border rounded-xl overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg/60">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-danger/60" />
            <div className="w-3 h-3 rounded-full bg-warn/60" />
            <div className="w-3 h-3 rounded-full bg-profit/60" />
          </div>
          <span className="flex-1 text-center text-xs font-mono text-muted">alpha-terminal — zsh</span>
          <GlowDot />
        </div>

        {/* Terminal body */}
        <div className="p-5 font-mono text-sm space-y-1 min-h-[280px]">
          {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={cn("transition-all duration-300", line.color)}
              style={{ animation: "fade-slide-in 200ms ease-out" }}
            >
              {line.text}
            </div>
          ))}
          {visibleLines < TERMINAL_LINES.length && (
            <span className="inline-block w-2 h-4 bg-signal animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mini conviction ring (pure SVG, no deps) ─────────────────────────────────

function MiniRing({ score, color }: { score: number; color: string }) {
  const r = 20, sw = 5, cx = 24, cy = 24;
  const circumference = 2 * Math.PI * r;
  const fill = (score / 100) * circumference;

  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1C2230" strokeWidth={sw} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={sw}
        strokeDasharray={`${fill} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ transition: "stroke-dasharray 1s ease-out" }}
      />
      <text x={cx} y={cy + 4} textAnchor="middle" fill={color}
        fontSize={10} fontFamily="JetBrains Mono,monospace" fontWeight="600">
        {score}
      </text>
    </svg>
  );
}

// ── Feature screens grid ──────────────────────────────────────────────────────

const SCREENS = [
  {
    icon: <Zap size={18} />,
    name: "Master Dashboard",
    path: "/dashboard",
    desc: "Modular panel grid with drag-to-reorder. Market pulse, narrative capital flows, conviction opportunities, new launches feed, and a movers heatmap treemap — all live-refreshing.",
    tags: ["dnd-kit", "real-time", "treemap"],
    accent: "signal",
  },
  {
    icon: <Filter size={18} />,
    name: "Token Screener",
    path: "/screener",
    desc: "Virtualized table handling 1000+ rows without frame drops. Filter by mcap bucket, chain, age, risk tier, and volume. Sortable columns, saved presets, inline watchlist.",
    tags: ["virtualized", "filters", "presets"],
    accent: "signal",
  },
  {
    icon: <Layers size={18} />,
    name: "Token Detail — Case File",
    path: "/token",
    desc: "Candlestick chart, full score breakdown with weights and plain-English explanations, forensics risk flags, holder concentration bar, Bull/Base/Bear scenarios, and AI research brief.",
    tags: ["OHLCV", "AI brief", "forensics"],
    accent: "signal",
  },
  {
    icon: <Compass size={18} />,
    name: "Discovery",
    path: "/discovery",
    desc: "Three curated preset screens — Early Discovery, High Momentum, Micro-Cap Alpha — each card showing which score components are driving the rank.",
    tags: ["presets", "ranked", "explainable"],
    accent: "profit",
  },
  {
    icon: <Wallet2 size={18} />,
    name: "Smart Money",
    path: "/smart-money",
    desc: "Tracked wallet performance table: win rate, realized P&L, trade count, and recent buy/sell feed. Honestly labelled SAMPLE until a premium data source is connected.",
    tags: ["wallets", "P&L", "premium"],
    accent: "warn",
  },
  {
    icon: <Bell size={18} />,
    name: "Alerts Center",
    path: "/alerts",
    desc: "Rule builder UI for momentum, liquidity, and risk-tier triggers. Toggle and delete rules live. Full notification history feed with severity badges.",
    tags: ["rules", "triggers", "history"],
    accent: "warn",
  },
  {
    icon: <BookMarked size={18} />,
    name: "Watchlist",
    path: "/watchlist",
    desc: "Star any token from the screener or detail view and it appears here in the same full-featured table, with all sorting and filtering intact.",
    tags: ["starred", "persistent", "localStorage"],
    accent: "signal",
  },
  {
    icon: <Command size={18} />,
    name: "Command Palette",
    path: "/dashboard",
    desc: "⌘K opens a keyboard-navigable palette to jump to any token, navigate to any screen, or run actions. The power-user shortcut that makes the terminal feel like equipment.",
    tags: ["⌘K", "keyboard", "search"],
    accent: "signal",
  },
  {
    icon: <Settings size={18} />,
    name: "Settings",
    path: "/settings",
    desc: "API key slots pre-wired for every Phase 1–4 integration: DexScreener, Helius, GoPlus, CoinGecko, Anthropic, Supabase, Upstash, Telegram. Each shows phase label and docs link.",
    tags: ["API keys", "Phase 1–4", "anticipatory"],
    accent: "muted",
  },
];

const ACCENT_COLORS: Record<string, string> = {
  signal: "border-signal/20 bg-signal/5 text-signal",
  profit: "border-profit/20 bg-profit/5 text-profit",
  warn:   "border-warn/20 bg-warn/5 text-warn",
  muted:  "border-border bg-border/20 text-muted",
};

const ICON_BG: Record<string, string> = {
  signal: "bg-signal/10 text-signal",
  profit: "bg-profit/10 text-profit",
  warn:   "bg-warn/10 text-warn",
  muted:  "bg-border text-muted",
};

function ScreenCard({ screen }: { screen: typeof SCREENS[number] }) {
  return (
    <Link href={screen.path} className="group block">
      <div className="h-full p-5 rounded-xl border border-border bg-panel
                      hover:border-signal/40 hover:bg-signal/5
                      transition-all duration-200">
        {/* Icon */}
        <div className={cn("inline-flex items-center justify-center w-9 h-9 rounded-lg mb-4",
          ICON_BG[screen.accent])}>
          {screen.icon}
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-ink mb-2 group-hover:text-signal transition-colors">
          {screen.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted leading-relaxed mb-4">
          {screen.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {screen.tags.map(tag => (
            <span key={tag}
              className={cn("text-2xs px-2 py-0.5 rounded border font-mono",
                ACCENT_COLORS[screen.accent])}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ── Principles section ───────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    icon: <Brain size={20} />,
    title: "Every score is explainable",
    desc: "Any number shown expands into the exact inputs, weights, and plain-English reasoning behind it. The Conviction Ring segments are clickable breakdowns — no black boxes.",
    color: "text-signal",
  },
  {
    icon: <Shield size={20} />,
    title: "Never fake data silently",
    desc: "Every panel carries a SAMPLE DATA or LIVE badge, driven by a config map. Users always know which data is synthetic and which is from a live source.",
    color: "text-profit",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "No price predictions",
    desc: "The terminal outputs scenario analysis and relative rankings grounded in observable on-chain data — never probabilities of future returns or price targets.",
    color: "text-warn",
  },
];

// ── Architecture section ─────────────────────────────────────────────────────

const DATA_SOURCES = [
  { name: "DexScreener",     phase: "Phase 1", desc: "Token pairs, price, volume, new launches",      status: "planned", color: "border-signal/30" },
  { name: "GeckoTerminal",   phase: "Phase 1", desc: "OHLCV candles, pool data, trending pools",      status: "planned", color: "border-signal/30" },
  { name: "CoinGecko",       phase: "Phase 1", desc: "Market caps, categories, global metrics",       status: "planned", color: "border-signal/30" },
  { name: "Helius",          phase: "Phase 1", desc: "Solana holders, transfers, token metadata",     status: "planned", color: "border-signal/30" },
  { name: "GoPlus Security", phase: "Phase 1", desc: "Honeypot, mint/freeze authority, taxes, LP lock", status: "planned", color: "border-signal/30" },
  { name: "RugCheck",        phase: "Phase 1", desc: "Solana token risk reports",                     status: "planned", color: "border-signal/30" },
  { name: "Anthropic Claude",phase: "Phase 2", desc: "AI research briefs, scenario generation",       status: "planned", color: "border-profit/30" },
  { name: "Supabase",        phase: "Phase 1", desc: "Tokens, scores, watchlist, alert rules",        status: "planned", color: "border-signal/30" },
  { name: "Upstash Redis",   phase: "Phase 1", desc: "API caching, rate-limit awareness",             status: "planned", color: "border-signal/30" },
  { name: "Telegram Bot",    phase: "Phase 3", desc: "Alert delivery to user chat",                   status: "planned", color: "border-warn/30" },
];

// ── Phase roadmap ────────────────────────────────────────────────────────────

const PHASES = [
  {
    number: "0",
    title: "The Interface",
    status: "done",
    items: [
      "Full terminal UI on sample data",
      "9 screens fully navigable",
      "Conviction Ring at all sizes",
      "Typed data source interfaces",
      "SAMPLE / LIVE badge system",
      "dnd-kit draggable panels",
      "Virtualized 1000+ row screener",
      "⌘K command palette",
    ],
  },
  {
    number: "1",
    title: "Live Market Data",
    status: "next",
    items: [
      "DexScreener → live screener",
      "GeckoTerminal → OHLCV charts",
      "CoinGecko → global metrics",
      "Helius → Solana holder data",
      "GoPlus + RugCheck → forensics",
      "Upstash Redis caching layer",
      "Supabase database",
      "Zod validation at every boundary",
    ],
  },
  {
    number: "2",
    title: "Scoring + AI",
    status: "planned",
    items: [
      "Momentum score (deterministic, unit-tested)",
      "Risk tier rule engine",
      "Score history snapshots (Vercel Cron)",
      "Claude-powered research briefs",
      "AI scenario generation",
      "Score breakdown → live data",
    ],
  },
  {
    number: "3",
    title: "Alerts + Discovery Live",
    status: "planned",
    items: [
      "Alert rule evaluation in cron",
      "Telegram bot delivery",
      "In-app notification center",
      "Discovery presets → live scores",
      "Rug early-warning (liquidity drops)",
    ],
  },
  {
    number: "4",
    title: "Expansion",
    status: "planned",
    items: [
      "Base + Ethereum via same pipeline",
      "Chain config abstracted",
      "Portfolio tracking (Helius + Alchemy)",
      "PnL and risk-tier exposure",
      "Smart Money screen goes live",
    ],
  },
];

const STATUS_CONFIG = {
  done:    { label: "Complete",  class: "bg-profit/10 text-profit border-profit/30" },
  next:    { label: "Up Next",   class: "bg-signal/10 text-signal border-signal/30" },
  planned: { label: "Planned",   class: "bg-border text-muted border-border" },
};

// ── Tech stack ───────────────────────────────────────────────────────────────

const STACK = [
  "Next.js 14 App Router", "TypeScript strict", "Tailwind CSS",
  "TanStack Query", "@tanstack/react-virtual", "dnd-kit",
  "Supabase (Phase 1+)", "Upstash Redis (Phase 1+)",
  "Anthropic Claude (Phase 2+)", "Vercel + Vercel Cron",
  "Space Grotesk + JetBrains Mono",
];

// ── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-bg/90 backdrop-blur-md border-b border-border" : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-signal/10 border border-signal/40
                          flex items-center justify-center">
            <Zap size={14} className="text-signal" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            ALPHA<span className="text-signal">TERMINAL</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {["Features", "Architecture", "Roadmap", "Stack"].map(item => (
            <a key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-muted hover:text-ink transition-colors">
              {item}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a href="https://github.com/Aiinfustructure123/Trading-Terminal"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors">
            <GitFork size={15} />
            <span className="hidden sm:block">GitHub</span>
          </a>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       bg-signal text-bg hover:bg-signal/90 transition-colors">
            Open Terminal <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink overflow-x-hidden">
      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(92,225,230,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(92,225,230,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Radial fade from top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]
                          bg-signal/5 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div>
              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                              border border-signal/30 bg-signal/10 mb-6">
                <GlowDot />
                <span className="text-xs font-mono text-signal">Phase 0 — Complete</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-ink">Crypto intelligence</span>
                <br />
                <span className="text-signal">for serious traders</span>
              </h1>

              <p className="text-muted text-lg leading-relaxed mb-8 max-w-lg">
                A signals-intelligence terminal aggregating on-chain, market, and trend data
                into explainable conviction scores. Think DexScreener&apos;s density,
                Nansen&apos;s smart-money lens, and Bloomberg&apos;s interface discipline.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
                             bg-signal text-bg hover:bg-signal/90 transition-all
                             shadow-[0_0_24px_rgba(92,225,230,0.3)] hover:shadow-[0_0_32px_rgba(92,225,230,0.5)]">
                  Open Terminal <ArrowRight size={15} />
                </Link>
                <Link href="/styleguide"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
                             border border-border text-ink hover:border-signal/40
                             hover:bg-signal/5 transition-all">
                  Design System
                </Link>
              </div>

              {/* Stat row */}
              <div className="flex gap-8 mt-10">
                {[
                  { n: "9",     label: "Screens built" },
                  { n: "1050+", label: "Sample tokens" },
                  { n: "100%",  label: "Explainable scores" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-signal font-mono">{s.n}</div>
                    <div className="text-xs text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — animated terminal */}
            <div>
              <TerminalPreview />

              {/* Mini score cards below */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { sym: "BONK",    score: 84, tier: "Low",      color: "#3DDC97" },
                  { sym: "AIAGENT", score: 55, tier: "Moderate", color: "#FFB020" },
                  { sym: "REKT",    score: 28, tier: "High",     color: "#FF4D5E" },
                ].map(t => (
                  <div key={t.sym}
                    className="bg-panel border border-border rounded-lg p-3
                               flex items-center gap-3">
                    <MiniRing score={t.score} color={t.color} />
                    <div>
                      <div className="text-xs font-semibold text-ink">{t.sym}</div>
                      <div className="text-2xs font-mono" style={{ color: t.color }}>{t.tier}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Scroll hint */}
        <div className="flex justify-center mt-16">
          <a href="#features" className="flex flex-col items-center gap-1 text-muted hover:text-signal transition-colors">
            <span className="text-xs">Explore</span>
            <ChevronDown size={16} className="animate-bounce" />
          </a>
        </div>
      </section>

      {/* ── PRINCIPLES ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Core Principles</SectionLabel>
          <h2 className="text-3xl font-bold text-center text-ink mb-12">
            Built with conviction — literally
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRINCIPLES.map(p => (
              <div key={p.title}
                className="p-6 rounded-xl border border-border bg-panel">
                <div className={cn("mb-4", p.color)}>{p.icon}</div>
                <h3 className="text-sm font-semibold text-ink mb-2">{p.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES / SCREENS ───────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>What&apos;s built</SectionLabel>
          <h2 className="text-3xl font-bold text-center text-ink mb-4">
            9 screens. All navigable. Right now.
          </h2>
          <p className="text-center text-muted text-sm mb-12 max-w-xl mx-auto">
            Every panel, every interaction, every data badge functional — running on
            realistic synthetic data with no API keys required.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCREENS.map(screen => (
              <ScreenCard key={screen.name} screen={screen} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONVICTION RING SHOWCASE ──────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border bg-panel/30">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Signature Component</SectionLabel>
          <h2 className="text-3xl font-bold text-center text-ink mb-4">
            The Conviction Ring
          </h2>
          <p className="text-center text-muted text-sm mb-12 max-w-xl mx-auto">
            Every token&apos;s composite score renders as a segmented circular gauge.
            Each segment = one score component. Hover to inspect, click to open the
            full breakdown. Appears at every scale, from 16px table rows to 120px headers.
          </p>

          {/* Sizes showcase */}
          <div className="flex items-end justify-center gap-8 flex-wrap mb-12">
            {[16, 28, 48, 80, 120].map(size => {
              const sw = Math.max(3, size * 0.1);
              const score = 72;
              const r = (size - sw) / 2;
              const cx = size / 2, cy = size / 2;

              const components = [
                { weight: 0.30, sub: 84, color: "#3DDC97" },
                { weight: 0.25, sub: 60, color: "#FFB020" },
                { weight: 0.20, sub: 78, color: "#3DDC97" },
                { weight: 0.15, sub: 55, color: "#FFB020" },
                { weight: 0.10, sub: 70, color: "#3DDC97" },
              ];

              const GAP = 4;
              const usableDeg = 360 - GAP * components.length;

              let angle = 0;
              const segs = components.map(c => {
                const start = angle;
                const span = usableDeg * c.weight;
                angle += span + GAP;
                return { ...c, start, end: start + span };
              });

              const polar = (a: number) => {
                const rad = ((a - 90) * Math.PI) / 180;
                return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
              };

              const arc = (s: number, e: number) => {
                const sp = polar(s), ep = polar(e);
                const large = e - s > 180 ? 1 : 0;
                return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${large} 1 ${ep.x} ${ep.y}`;
              };

              return (
                <div key={size} className="flex flex-col items-center gap-2">
                  <svg width={size} height={size}>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1C2230" strokeWidth={sw} />
                    {segs.map((seg, i) => {
                      const filledEnd = seg.start + (seg.end - seg.start) * (seg.sub / 100);
                      return (
                        <path key={i}
                          d={arc(seg.start, filledEnd)}
                          fill="none" stroke={seg.color} strokeWidth={sw} strokeLinecap="butt"
                        />
                      );
                    })}
                    {size >= 48 && (
                      <text x={cx} y={cy + size * 0.1}
                        textAnchor="middle" fill="#3DDC97"
                        fontSize={size * 0.25} fontFamily="JetBrains Mono,monospace" fontWeight="600">
                        {score}
                      </text>
                    )}
                  </svg>
                  <span className="text-2xs text-muted font-mono">{size}px</span>
                </div>
              );
            })}
          </div>

          {/* Component breakdown demo */}
          <div className="max-w-md mx-auto p-5 bg-panel border border-border rounded-xl">
            <div className="label-eyebrow mb-4 text-center">Score Component Breakdown</div>
            {[
              { label: "Momentum",  sub: 84, weight: 30, color: "#3DDC97" },
              { label: "Liquidity", sub: 60, weight: 25, color: "#FFB020" },
              { label: "Holders",   sub: 78, weight: 20, color: "#3DDC97" },
              { label: "Safety",    sub: 55, weight: 15, color: "#FFB020" },
              { label: "Narrative", sub: 70, weight: 10, color: "#3DDC97" },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-muted w-20">{c.label}</span>
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.sub}%`, background: c.color }} />
                </div>
                <span className="num text-xs font-mono" style={{ color: c.color }}>{c.sub}</span>
                <span className="text-2xs text-muted w-8">×{c.weight}%</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-border flex justify-between">
              <span className="text-xs text-muted">Composite</span>
              <span className="num text-sm font-bold text-profit">72 / 100</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE ─────────────────────────────────────────────────── */}
      <section id="architecture" className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Architecture</SectionLabel>
          <h2 className="text-3xl font-bold text-center text-ink mb-4">
            Built for phase-by-phase live upgrades
          </h2>
          <p className="text-center text-muted text-sm mb-12 max-w-xl mx-auto">
            All data flows through typed service interfaces. Phase 0 implements each as a
            sample source. Later phases drop in live implementations behind the same interface
            — no component changes, ever.
          </p>

          {/* Architecture diagram */}
          <div className="p-6 bg-panel border border-border rounded-xl font-mono text-sm mb-10 overflow-x-auto">
            <pre className="text-muted leading-relaxed whitespace-pre">{`  Components (never change)
        ↓
  TanStack Query
        ↓
  lib/datasources/index.ts   ← single registry
        ↓
  ┌─────────────────────────────────────────┐
  │  DATA_SOURCE_CONFIG                     │
  │  market:     "sample" → "live"          │
  │  token:      "sample" → "live"          │
  │  onchain:    "sample" → "live"          │
  │  security:   "sample" → "live"          │
  │  ai:         "sample" → "live"          │
  └─────────────────────────────────────────┘
        ↓                    ↓
  sample/*.ts           live/*.ts (Phase 1+)
  (1050+ tokens,        (DexScreener, Helius,
   realistic data,       GoPlus, Claude, etc.)
   sim. latency)`}</pre>
            <div className="mt-3 text-signal text-xs">
              Swapping a source = one line change in the config. Badge flips SAMPLE → LIVE automatically.
            </div>
          </div>

          {/* Data sources grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DATA_SOURCES.map(src => (
              <div key={src.name}
                className={cn("p-4 rounded-lg border bg-panel/50", src.color)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-ink">{src.name}</span>
                  <span className="text-2xs font-mono px-1.5 py-0.5 rounded border border-border text-muted">
                    {src.phase}
                  </span>
                </div>
                <p className="text-xs text-muted">{src.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ──────────────────────────────────────────────────────── */}
      <section id="roadmap" className="py-20 px-6 border-t border-border bg-panel/20">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Roadmap</SectionLabel>
          <h2 className="text-3xl font-bold text-center text-ink mb-12">
            Phase by phase. No big bang rewrites.
          </h2>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden sm:block" />

            <div className="space-y-8">
              {PHASES.map(phase => {
                const cfg = STATUS_CONFIG[phase.status as keyof typeof STATUS_CONFIG];
                return (
                  <div key={phase.number} className="relative sm:pl-14">
                    {/* Phase dot */}
                    <div className="hidden sm:flex absolute left-0 top-0 w-10 h-10 rounded-full
                                    border border-border bg-panel items-center justify-center">
                      <span className="text-sm font-bold font-mono text-signal">{phase.number}</span>
                    </div>

                    <div className="p-5 rounded-xl border border-border bg-panel">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="text-xs font-mono font-bold text-signal">PHASE {phase.number}</span>
                        <h3 className="text-base font-semibold text-ink">{phase.title}</h3>
                        <span className={cn("text-2xs px-2 py-0.5 rounded border font-mono ml-auto", cfg.class)}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {phase.items.map(item => (
                          <div key={item} className="flex items-start gap-2">
                            {phase.status === "done"
                              ? <CheckCircle size={13} className="text-profit flex-shrink-0 mt-0.5" />
                              : <Circle size={13} className="text-muted flex-shrink-0 mt-0.5" />
                            }
                            <span className="text-xs text-muted">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── STACK ────────────────────────────────────────────────────────── */}
      <section id="stack" className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Tech Stack</SectionLabel>
          <h2 className="text-3xl font-bold text-center text-ink mb-10">
            Fixed from day one
          </h2>
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {STACK.map(tech => (
              <span key={tech}
                className="px-3 py-1.5 rounded-full border border-border bg-panel
                           text-xs font-mono text-muted hover:text-signal hover:border-signal/40
                           transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── GET STARTED ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border bg-panel/30">
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel>Get Started</SectionLabel>
          <h2 className="text-3xl font-bold text-ink mb-4">
            Run it in two minutes
          </h2>
          <p className="text-muted text-sm mb-10">
            Phase 0 needs zero API keys. Clone, install, run.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
            {/* Local */}
            <div className="p-5 bg-panel border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={15} className="text-signal" />
                <span className="text-sm font-medium text-ink">Run locally</span>
              </div>
              <pre className="text-xs font-mono text-muted leading-relaxed bg-bg rounded-lg p-4 overflow-x-auto">{`git clone https://github.com/
  Aiinfustructure123/Trading-Terminal
cd Trading-Terminal
git checkout cursor/alpha-terminal-phase0-442e
npm install
npm run dev`}</pre>
            </div>

            {/* Vercel */}
            <div className="p-5 bg-panel border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={15} className="text-signal" />
                <span className="text-sm font-medium text-ink">Deploy to Vercel</span>
              </div>
              <ol className="space-y-2 text-xs text-muted">
                {[
                  "Go to vercel.com/new",
                  "Import Aiinfustructure123/Trading-Terminal",
                  "Set branch → cursor/alpha-terminal-phase0-442e",
                  "Click Deploy — zero env vars needed for Phase 0",
                  "Get a public URL instantly",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-signal font-mono w-4 flex-shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                         bg-signal text-bg hover:bg-signal/90 transition-all
                         shadow-[0_0_32px_rgba(92,225,230,0.3)]">
              Open Terminal <ArrowRight size={15} />
            </Link>
            <a href="https://github.com/Aiinfustructure123/Trading-Terminal"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                         border border-border text-ink hover:border-signal/40 hover:bg-signal/5
                         transition-all">
              <GitFork size={15} /> View on GitHub
            </a>
            <a href="https://vercel.com/new/clone?repository-url=https://github.com/Aiinfustructure123/Trading-Terminal"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                         border border-profit/30 text-profit bg-profit/5
                         hover:border-profit/60 hover:bg-profit/10 transition-all">
              <ExternalLink size={15} /> Deploy to Vercel
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-signal/10 border border-signal/40
                            flex items-center justify-center">
              <Zap size={11} className="text-signal" />
            </div>
            <span className="text-xs font-semibold text-muted">
              ALPHA<span className="text-signal">TERMINAL</span>
            </span>
            <span className="text-muted text-xs">· Phase 0 · All data SAMPLE</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted">
            <Link href="/styleguide" className="hover:text-ink transition-colors">Styleguide</Link>
            <Link href="/dashboard" className="hover:text-ink transition-colors">Terminal</Link>
            <a href="https://github.com/Aiinfustructure123/Trading-Terminal"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-ink transition-colors">
              <GitFork size={12} /> GitHub
            </a>
          </div>

          <div className="text-2xs text-muted font-mono">
            Analytical tooling · Not financial advice
          </div>
        </div>
      </footer>
    </div>
  );
}
