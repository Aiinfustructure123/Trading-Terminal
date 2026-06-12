"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import type { Chain, RiskTier, ScreenerQuery } from "@/lib/datasources";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MCAP_BUCKETS: { label: string; value: number | null }[] = [
  { label: "< $500k", value: 500_000 },
  { label: "< $1m", value: 1_000_000 },
  { label: "< $2m", value: 2_000_000 },
  { label: "< $5m", value: 5_000_000 },
  { label: "< $25m", value: 25_000_000 },
  { label: "Any mcap", value: null },
];

const CHAINS: { label: string; value: Chain | "all" }[] = [
  { label: "All chains", value: "all" },
  { label: "Solana", value: "solana" },
  { label: "Base", value: "base" },
  { label: "Ethereum", value: "ethereum" },
];

const RISK_TIERS: { label: string; value: RiskTier }[] = [
  { label: "≤ Low", value: "Low" },
  { label: "≤ Moderate", value: "Moderate" },
  { label: "≤ High", value: "High" },
  { label: "Any risk", value: "Avoid" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}

export function FilterBar({
  value,
  onChange,
  onReset,
}: {
  value: ScreenerQuery;
  onChange: (next: ScreenerQuery) => void;
  onReset: () => void;
}) {
  const set = (patch: Partial<ScreenerQuery>) => onChange({ ...value, ...patch });
  const mcapValue = value.mcapMax == null ? "any" : String(value.mcapMax);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={value.search ?? ""}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search symbol, name, or contract address…"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Field label="Chain">
          <Select value={value.chain ?? "all"} onValueChange={(v) => set({ chain: v as Chain | "all" })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHAINS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Market Cap">
          <Select
            value={mcapValue}
            onValueChange={(v) => set({ mcapMax: v === "any" ? null : Number(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MCAP_BUCKETS.map((b) => (
                <SelectItem key={b.label} value={b.value == null ? "any" : String(b.value)}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Max Risk">
          <Select value={value.maxRiskTier ?? "Avoid"} onValueChange={(v) => set({ maxRiskTier: v as RiskTier })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RISK_TIERS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Min Liquidity ($)">
          <Input
            type="number"
            inputMode="numeric"
            value={value.minLiquidity ?? ""}
            onChange={(e) => set({ minLiquidity: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
          />
        </Field>

        <Field label="Max Age (days)">
          <Input
            type="number"
            inputMode="numeric"
            value={value.maxAgeDays ?? ""}
            onChange={(e) => set({ maxAgeDays: e.target.value ? Number(e.target.value) : null })}
            placeholder="∞"
          />
        </Field>

        <Field label="Min Volume ($)">
          <Input
            type="number"
            inputMode="numeric"
            value={value.minVolume ?? ""}
            onChange={(e) => set({ minVolume: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="xs" onClick={onReset}>
          <X className="h-3 w-3" /> Clear filters
        </Button>
      </div>
    </div>
  );
}
