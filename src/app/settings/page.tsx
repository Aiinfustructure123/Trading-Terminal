"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Check, X, Eye, EyeOff } from "lucide-react";
import { Panel, Eyebrow } from "@/components/ui/primitives";
import { INTEGRATIONS, type Integration } from "@/lib/datasources/config";
import type { SourceKey } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

const SOURCE_TITLES: Record<SourceKey, string> = {
  market: "Market Data",
  onchain: "On-Chain",
  security: "Security & Forensics",
  ai: "AI & Delivery",
};

const KEY = "alpha.apiKeys";

export default function SettingsPage() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      setKeys(JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch {
      setKeys({});
    }
  }, []);

  const setKey = (id: string, val: string) => {
    setKeys((prev) => {
      const next = { ...prev, [id]: val };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const grouped = (["market", "onchain", "security", "ai"] as SourceKey[]).map((src) => ({
    src,
    items: INTEGRATIONS.filter((i) => i.source === src),
  }));

  return (
    <div className="flex flex-col gap-4 p-3 md:p-4">
      <div className="flex items-center gap-2">
        <SettingsIcon className="size-4 text-signal" />
        <Eyebrow>Settings</Eyebrow>
      </div>

      <div className="rounded-md border border-border bg-panel-2/40 p-3">
        <p className="text-[12px] text-muted">
          Every future integration has a slot here, anticipating Phase 1+. In Phase 0 these are stored locally and not yet wired —
          a source flips to <span className="text-signal">LIVE</span> only when its implementation and key are connected. Production
          keys belong in server-side environment variables (see <span className="font-mono text-ink">.env.example</span>), never the browser.
        </p>
      </div>

      {grouped.map(({ src, items }) => (
        <Panel key={src} title={SOURCE_TITLES[src]} source={src}>
          <div className="flex flex-col gap-3">
            {items.map((it: Integration) => {
              const val = keys[it.id] ?? "";
              const connected = it.connected; // Phase 0: always false
              return (
                <div key={it.id} className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-medium text-ink">{it.name}</span>
                      <span className="rounded bg-bg px-1.5 py-0.5 font-mono text-[9px] text-muted">{it.phase}</span>
                      <StatusPill connected={connected} />
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted">{it.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {it.envKey !== "—" && <span className="hidden font-mono text-[10px] text-muted lg:inline">{it.envKey}</span>}
                    <div className="flex items-center rounded-md border border-border bg-bg">
                      <input
                        type={reveal[it.id] ? "text" : "password"}
                        value={val}
                        onChange={(e) => setKey(it.id, e.target.value)}
                        placeholder={it.envKey === "—" ? "No key required" : "Paste API key…"}
                        disabled={it.envKey === "—"}
                        className="w-40 bg-transparent px-2.5 py-1.5 font-mono text-[11px] text-ink outline-none placeholder:text-muted disabled:opacity-50"
                      />
                      {it.envKey !== "—" && (
                        <button onClick={() => setReveal((r) => ({ ...r, [it.id]: !r[it.id] }))} className="px-2 text-muted hover:text-ink" aria-label="Toggle reveal">
                          {reveal[it.id] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      ))}
    </div>
  );
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide", connected ? "border-profit/40 text-profit" : "border-border text-muted")}>
      {connected ? <Check className="size-2.5" /> : <X className="size-2.5" />}
      {connected ? "Connected" : "Disconnected"}
    </span>
  );
}
