"use client";

import React, { useState } from "react";
import { Settings, CheckCircle, XCircle, Eye, EyeOff, ExternalLink } from "lucide-react";

interface APIKeyConfig {
  id: string;
  name: string;
  description: string;
  envKey: string;
  docsUrl: string;
  phase: string;
  connected: boolean;
  value: string;
}

const API_KEYS: APIKeyConfig[] = [
  {
    id: "dexscreener",
    name: "DexScreener",
    description: "Token pairs, price, volume, liquidity, new launches. Free — 300 req/min.",
    envKey: "NEXT_PUBLIC_DEXSCREENER_API_KEY",
    docsUrl: "https://docs.dexscreener.com",
    phase: "Phase 1",
    connected: false,
    value: "",
  },
  {
    id: "geckoterminal",
    name: "GeckoTerminal",
    description: "OHLCV candles, pool data, trending pools. Free tier.",
    envKey: "NEXT_PUBLIC_GECKOTERMINAL_API_KEY",
    docsUrl: "https://www.geckoterminal.com/dex-api",
    phase: "Phase 1",
    connected: false,
    value: "",
  },
  {
    id: "coingecko",
    name: "CoinGecko",
    description: "Market caps, categories, global metrics. Free/Demo key.",
    envKey: "COINGECKO_API_KEY",
    docsUrl: "https://www.coingecko.com/en/api",
    phase: "Phase 1",
    connected: false,
    value: "",
  },
  {
    id: "helius",
    name: "Helius",
    description: "Solana holders, transfers, token metadata. Free tier.",
    envKey: "HELIUS_API_KEY",
    docsUrl: "https://docs.helius.dev",
    phase: "Phase 1",
    connected: false,
    value: "",
  },
  {
    id: "goplus",
    name: "GoPlus Security",
    description: "Honeypot detection, mint/freeze authority, taxes, LP lock.",
    envKey: "GOPLUS_API_KEY",
    docsUrl: "https://docs.gopluslabs.io",
    phase: "Phase 1",
    connected: false,
    value: "",
  },
  {
    id: "rugcheck",
    name: "RugCheck",
    description: "Solana token risk reports. Forensics data.",
    envKey: "RUGCHECK_API_KEY",
    docsUrl: "https://rugcheck.xyz",
    phase: "Phase 1",
    connected: false,
    value: "",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "AI research briefs powered by Claude. Phase 2 AI integration.",
    envKey: "ANTHROPIC_API_KEY",
    docsUrl: "https://console.anthropic.com",
    phase: "Phase 2",
    connected: false,
    value: "",
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Database for tokens, score snapshots, watchlist, alert rules.",
    envKey: "NEXT_PUBLIC_SUPABASE_URL",
    docsUrl: "https://supabase.com/docs",
    phase: "Phase 1",
    connected: false,
    value: "",
  },
  {
    id: "upstash",
    name: "Upstash Redis",
    description: "API response caching and rate-limit awareness.",
    envKey: "UPSTASH_REDIS_REST_URL",
    docsUrl: "https://upstash.com/docs",
    phase: "Phase 1",
    connected: false,
    value: "",
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    description: "Alert delivery via Telegram. Provide your bot token and chat ID.",
    envKey: "TELEGRAM_BOT_TOKEN",
    docsUrl: "https://core.telegram.org/bots",
    phase: "Phase 3",
    connected: false,
    value: "",
  },
];

function APIKeyRow({ config }: { config: APIKeyConfig }) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState(config.value);

  return (
    <div className="flex items-start gap-4 px-4 py-4 border-b border-border/40 last:border-0">
      {/* Status dot */}
      <div className="flex-shrink-0 mt-1">
        {config.connected
          ? <CheckCircle size={14} className="text-profit" />
          : <XCircle size={14} className="text-muted" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-ink">{config.name}</span>
          <span className="text-2xs border border-border rounded px-1.5 py-0.5 text-muted">{config.phase}</span>
          {config.connected
            ? <span className="text-xs text-profit">Connected</span>
            : <span className="text-xs text-muted">Not connected</span>
          }
        </div>
        <p className="text-xs text-muted mb-2">{config.description}</p>
        <div className="flex items-center gap-2">
          <code className="text-xs text-signal font-mono">{config.envKey}</code>
          <a
            href={config.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted hover:text-signal transition-colors"
          >
            Docs <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 w-64 flex-shrink-0">
        <div className="flex-1 flex items-center gap-1 bg-bg border border-border rounded px-2 py-1.5 focus-within:border-signal/50 transition-colors">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Enter key…"
            className="flex-1 bg-transparent text-xs text-ink outline-none font-mono placeholder:text-muted/50"
          />
          <button
            onClick={() => setShow(s => !s)}
            className="text-muted hover:text-ink transition-colors"
          >
            {show ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const phaseGroups = API_KEYS.reduce<Record<string, APIKeyConfig[]>>((acc, k) => {
    (acc[k.phase] = acc[k.phase] || []).push(k);
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={18} className="text-signal" />
        <h1 className="text-xl font-semibold text-ink">Settings</h1>
      </div>

      {/* Data source config note */}
      <div className="p-4 mb-6 border border-signal/30 bg-signal/5 rounded-md">
        <div className="text-sm font-medium text-signal mb-1">Phase 0 — Sample Data Mode</div>
        <p className="text-xs text-muted">
          All data panels are running on synthetic sample data. Connect API keys below to
          go live panel by panel. Each connected key automatically upgrades its panel from
          SAMPLE to LIVE status.
        </p>
      </div>

      {/* API Keys by phase */}
      {Object.entries(phaseGroups).map(([phase, keys]) => (
        <div key={phase} className="panel-surface overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-border bg-bg/40">
            <span className="label-eyebrow">{phase} — API Keys</span>
          </div>
          {keys.map(k => <APIKeyRow key={k.id} config={k} />)}
        </div>
      ))}

      {/* ENV example note */}
      <div className="p-4 border border-border rounded-md">
        <div className="label-eyebrow mb-2">ENVIRONMENT SETUP</div>
        <p className="text-xs text-muted mb-2">
          Copy <code className="text-signal">.env.example</code> to <code className="text-signal">.env.local</code> and
          populate the keys. See each provider&apos;s docs link above for obtaining credentials.
        </p>
        <p className="text-xs text-muted">
          For production deployment, add secrets to your Vercel project environment variables.
        </p>
      </div>
    </div>
  );
}
