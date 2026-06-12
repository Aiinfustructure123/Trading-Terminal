"use client";

import * as React from "react";
import { Check, ExternalLink, KeyRound } from "lucide-react";
import { API_KEY_SLOTS, setApiKey, useApiKeys } from "@/lib/store/settings";
import { DATASOURCE_CONFIG } from "@/lib/datasources/config";
import { Panel } from "@/components/terminal/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function KeySlot({ slotId }: { slotId: string }) {
  const slot = API_KEY_SLOTS.find((s) => s.id === slotId)!;
  const keys = useApiKeys();
  const stored = keys[slot.id] ?? "";
  const [draft, setDraft] = React.useState<string | null>(null);
  const connected = stored.length > 0;
  const value = draft ?? stored;

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3.5 sm:flex-row sm:items-center">
      <div className="w-full sm:w-64">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink">{slot.label}</span>
          <span
            className={cn(
              "num inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-px text-[9px] tracking-wider",
              connected
                ? "border-profit/40 text-profit"
                : "border-edge-bright text-muted",
            )}
          >
            {connected ? <Check size={9} /> : null}
            {connected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
        <div className="eyebrow mt-0.5 !text-[9px]">{slot.phase}</div>
        <p className="mt-1 text-2xs leading-4 text-muted">
          {slot.hint}{" "}
          <a
            href={slot.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-signal/80 hover:text-signal"
          >
            docs <ExternalLink size={9} />
          </a>
        </p>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <span className="num hidden w-44 shrink-0 text-[10px] text-muted/70 lg:inline">
          {slot.envVar}
        </span>
        <Input
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={connected ? "••••••••••••" : "Paste key…"}
          aria-label={`${slot.label} API key`}
        />
        <Button
          variant="primary"
          size="sm"
          disabled={draft === null || draft === stored}
          onClick={() => {
            setApiKey(slot.id, draft ?? "");
            setDraft(null);
          }}
        >
          Save
        </Button>
        {connected ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setApiKey(slot.id, "");
              setDraft(null);
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-3 p-3 sm:p-4">
      <Panel title="API Integrations" bodyClassName="divide-y divide-edge/60">
        <div className="flex items-start gap-3 px-4 py-3.5">
          <KeyRound size={14} className="mt-0.5 shrink-0 text-muted" />
          <p className="text-2xs leading-4 text-muted">
            One slot per future integration — visibly anticipating Phase 1+.
            In Phase 0 keys are stored only in this browser&apos;s localStorage and
            nothing is called; live integrations read the corresponding server
            environment variables (see <span className="num text-ink">.env.example</span>).
            Connecting a key here does not flip a panel to LIVE — that happens
            when the real datasource implementation ships.
          </p>
        </div>
        {API_KEY_SLOTS.map((slot) => (
          <KeySlot key={slot.id} slotId={slot.id} />
        ))}
      </Panel>

      <Panel title="Datasource Modes" bodyClassName="divide-y divide-edge/60">
        {Object.entries(DATASOURCE_CONFIG).map(([key, mode]) => (
          <div key={key} className="flex items-center gap-3 px-4 py-2.5">
            <span className="num w-32 text-xs text-ink">{key}</span>
            <span
              className={cn(
                "num rounded-[3px] border px-1.5 py-px text-[9px] tracking-wider",
                mode === "live"
                  ? "border-signal/40 text-signal"
                  : "border-warn/35 text-warn/90",
              )}
            >
              {mode.toUpperCase()}
            </span>
            <span className="ml-auto text-2xs text-muted">
              {mode === "sample"
                ? "Generated data, honest badge on every panel it feeds."
                : "Real upstream data."}
            </span>
          </div>
        ))}
        <p className="px-4 py-3 text-2xs leading-4 text-muted">
          Controlled by <span className="num text-ink">lib/datasources/config.ts</span>.
          Flipping a source to live swaps the implementation behind the same
          typed interface and updates every SAMPLE badge automatically — no
          component changes.
        </p>
      </Panel>
    </div>
  );
}
