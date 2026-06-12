"use client";

import * as React from "react";
import { CheckCircle2, Circle, KeyRound } from "lucide-react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { PageHeader } from "@/components/page-header";
import { Panel, Eyebrow } from "@/components/panel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  description: string;
  envVar: string;
  where: string;
  phase: string;
}

const GROUPS: { title: string; items: Integration[] }[] = [
  {
    title: "Market Data — Phase 1",
    items: [
      { id: "dexscreener", name: "DexScreener", description: "Pairs, price, volume, liquidity, txns, new launches.", envVar: "DEXSCREENER_API_KEY", where: "dexscreener.com/api (free, 300 req/min)", phase: "Phase 1" },
      { id: "geckoterminal", name: "GeckoTerminal", description: "OHLCV candles, pool data, trending pools.", envVar: "GECKOTERMINAL_API_KEY", where: "geckoterminal.com/api (free)", phase: "Phase 1" },
      { id: "coingecko", name: "CoinGecko", description: "Market caps, categories, global metrics.", envVar: "COINGECKO_API_KEY", where: "coingecko.com/api (free/demo key)", phase: "Phase 1" },
    ],
  },
  {
    title: "On-Chain & Forensics — Phase 1",
    items: [
      { id: "helius", name: "Helius", description: "Solana holders, transfers, token metadata.", envVar: "HELIUS_API_KEY", where: "helius.dev (free tier)", phase: "Phase 1" },
      { id: "goplus", name: "GoPlus Security", description: "Honeypot, mint/freeze authority, taxes, LP lock.", envVar: "GOPLUS_API_KEY", where: "goplus.io (free)", phase: "Phase 1" },
      { id: "rugcheck", name: "RugCheck", description: "Solana token risk reports.", envVar: "RUGCHECK_API_KEY", where: "rugcheck.xyz", phase: "Phase 1" },
    ],
  },
  {
    title: "AI & Delivery — Phase 2/3",
    items: [
      { id: "anthropic", name: "Anthropic Claude", description: "AI research briefs & scenario generation (claude-sonnet-4-6).", envVar: "ANTHROPIC_API_KEY", where: "console.anthropic.com", phase: "Phase 2" },
      { id: "telegram", name: "Telegram Bot", description: "Alert delivery (bot token + chat id).", envVar: "TELEGRAM_BOT_TOKEN", where: "t.me/BotFather", phase: "Phase 3" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { id: "supabase", name: "Supabase", description: "Postgres: tokens, score_snapshots, watchlist, alert_rules, users.", envVar: "SUPABASE_SERVICE_ROLE_KEY", where: "supabase.com", phase: "Phase 1" },
      { id: "upstash", name: "Upstash Redis", description: "Response caching & rate-limit awareness for live sources.", envVar: "UPSTASH_REDIS_REST_URL", where: "upstash.com (free tier)", phase: "Phase 1" },
    ],
  },
];

function IntegrationRow({ item }: { item: Integration }) {
  const [value, setValue] = useLocalStorage<string>(`alpha:key:${item.id}`, "");
  const connected = value.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-edge bg-panel-2/40 p-3.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-[14px] font-medium text-ink">{item.name}</span>
          <Badge variant="neutral">{item.phase}</Badge>
          {connected ? (
            <Badge variant="profit">
              <CheckCircle2 className="h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="neutral">
              <Circle className="h-3 w-3" /> Disconnected
            </Badge>
          )}
        </div>
        <p className="mt-1 text-[12px] text-muted">{item.description}</p>
        <p className="mt-1 font-mono text-[11px] text-muted">
          {item.envVar} · <span className="text-muted/80">{item.where}</span>
        </p>
      </div>
      <div className="relative w-full sm:w-72">
        <KeyRound className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
        <Input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste key to mark connected"
          className={cn("pl-8", connected && "border-profit/40")}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="API key slots for every future integration. Status reflects whether a key is present. In production these live in environment variables (see .env.example) — this UI anticipates the live wiring of each source."
      />
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-center gap-3 rounded-md border border-signal/25 bg-signal/5 px-4 py-3">
          <KeyRound className="h-4 w-4 shrink-0 text-signal" />
          <p className="text-[13px] text-ink">
            Phase 0 runs entirely on sample data — no keys required. These slots anticipate Phase 1+. Keys entered here
            are stored locally for status preview only and are not sent anywhere; production secrets belong in env vars.
          </p>
        </div>
        {GROUPS.map((g) => (
          <Panel key={g.title} title={g.title}>
            <div className="flex flex-col gap-2.5">
              {g.items.map((item) => (
                <IntegrationRow key={item.id} item={item} />
              ))}
            </div>
          </Panel>
        ))}
        <Eyebrow>Alpha Terminal · Phase 0 build · all data clearly labeled SAMPLE until each source goes live</Eyebrow>
      </div>
    </div>
  );
}
