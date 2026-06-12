"use client";

import { useState } from "react";
import { ExternalLink, KeyRound } from "lucide-react";
import { INTEGRATIONS, SOURCE_MODES, type SourceKey } from "@/lib/datasources/config";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { Panel } from "@/components/ui/panel";
import { SourceBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<SourceKey, string> = {
  market: "Market data",
  onchain: "On-chain",
  security: "Security / forensics",
  ai: "AI research",
  smartMoney: "Smart money",
  alerts: "Alerts delivery",
};

function IntegrationRow({ id, name, description, envVar, docsUrl, phase }: (typeof INTEGRATIONS)[number]) {
  const [keys, setKeys] = useLocalStorage<Record<string, string>>("alpha:api-keys", {});
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const connected = !!keys[id];

  return (
    <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{name}</span>
          <span className="rounded-sm border border-panel-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
            Phase {phase}
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider",
              connected ? "text-profit" : "text-muted"
            )}
          >
            <span className={cn("size-1.5 rounded-full", connected ? "bg-profit" : "bg-muted/40")} />
            {connected ? "Key stored" : "Disconnected"}
          </span>
        </div>
        <p className="text-xs text-muted">{description}</p>
        <div className="flex items-center gap-3">
          <code className="font-mono text-[10px] text-muted/70">{envVar}</code>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-signal/80 hover:text-signal"
          >
            Get a key <ExternalLink className="size-2.5" aria-hidden />
          </a>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {editing ? (
          <>
            <input
              type="password"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste key…"
              aria-label={`${name} API key`}
              className="h-8 w-48 rounded border border-panel-border bg-bg px-2 font-mono text-xs outline-none focus:border-signal/60"
            />
            <button
              onClick={() => {
                setKeys((prev) => ({ ...prev, [id]: draft }));
                setDraft("");
                setEditing(false);
              }}
              disabled={!draft}
              className="h-8 rounded border border-signal/50 bg-signal/10 px-3 text-xs text-signal hover:bg-signal/20 disabled:opacity-40"
            >
              Save
            </button>
            <button onClick={() => setEditing(false)} className="h-8 px-2 text-xs text-muted hover:text-ink">
              Cancel
            </button>
          </>
        ) : (
          <>
            {connected && (
              <button
                onClick={() =>
                  setKeys((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                  })
                }
                className="h-8 rounded border border-panel-border px-3 text-xs text-muted hover:border-danger/40 hover:text-danger"
              >
                Remove
              </button>
            )}
            <button
              onClick={() => setEditing(true)}
              className="flex h-8 items-center gap-1.5 rounded border border-panel-border px-3 text-xs text-ink transition-colors hover:border-signal/40"
            >
              <KeyRound className="size-3" aria-hidden />
              {connected ? "Replace key" : "Add key"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-col gap-1">
        <span className="eyebrow">Settings</span>
        <h1 className="text-lg font-semibold leading-tight">Integrations</h1>
        <p className="max-w-xl text-sm text-muted">
          Every future data source has a slot here. Keys are stored locally in Phase 0 and do not
          activate live data yet — when a Phase 1+ implementation ships, connecting a key flips the
          matching panels from SAMPLE to LIVE.
        </p>
      </header>

      <Panel title="Data source status" bodyClassName="grid grid-cols-1 gap-px bg-panel-border sm:grid-cols-2">
        {(Object.keys(SOURCE_MODES) as SourceKey[]).map((key) => (
          <div key={key} className="flex items-center justify-between bg-panel px-3 py-2.5">
            <span className="text-[13px]">{SOURCE_LABELS[key]}</span>
            <SourceBadge source={key} />
          </div>
        ))}
      </Panel>

      <Panel title="API keys" bodyClassName="divide-y divide-panel-border">
        {INTEGRATIONS.map((slot) => (
          <IntegrationRow key={slot.id} {...slot} />
        ))}
      </Panel>
    </div>
  );
}
