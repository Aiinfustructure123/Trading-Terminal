"use client";

import * as React from "react";
import { Save, X } from "lucide-react";
import { Chain, RiskTier, ScreenerFilter } from "@/lib/datasources/types";
import {
  deletePreset,
  savePreset,
  usePresets,
} from "@/lib/store/presets";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const MCAP_BUCKETS = [
  { label: "MCap: any", value: "" },
  { label: "< $500K", value: "500000" },
  { label: "< $1M", value: "1000000" },
  { label: "< $2M", value: "2000000" },
  { label: "< $5M", value: "5000000" },
  { label: "< $25M", value: "25000000" },
];

const MIN_LIQUIDITY = [
  { label: "Liq: any", value: "" },
  { label: "≥ $10K", value: "10000" },
  { label: "≥ $50K", value: "50000" },
  { label: "≥ $100K", value: "100000" },
  { label: "≥ $250K", value: "250000" },
];

const MAX_AGE = [
  { label: "Age: any", value: "" },
  { label: "< 24h", value: "1" },
  { label: "< 7d", value: "7" },
  { label: "< 30d", value: "30" },
  { label: "< 90d", value: "90" },
];

const MIN_VOLUME = [
  { label: "Vol: any", value: "" },
  { label: "≥ $10K", value: "10000" },
  { label: "≥ $100K", value: "100000" },
  { label: "≥ $1M", value: "1000000" },
];

const RISK = [
  { label: "Risk: any", value: "" },
  { label: "Low only", value: "Low" },
  { label: "≤ Moderate", value: "Moderate" },
  { label: "≤ High", value: "High" },
];

const CHAINS = [
  { label: "All chains", value: "" },
  { label: "Solana", value: "solana" },
  { label: "Base", value: "base" },
  { label: "Ethereum", value: "ethereum" },
];

interface FilterBarProps {
  filter: ScreenerFilter;
  onChange: (filter: ScreenerFilter) => void;
  activePresetId: string | null;
  onPresetChange: (id: string | null) => void;
}

export function FilterBar({
  filter,
  onChange,
  activePresetId,
  onPresetChange,
}: FilterBarProps) {
  const presets = usePresets();
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [presetName, setPresetName] = React.useState("");

  function patch(p: Partial<ScreenerFilter>) {
    onPresetChange(null);
    onChange({ ...filter, ...p });
  }

  const activePreset = presets.find((p) => p.id === activePresetId) ?? null;

  return (
    <div className="panel flex flex-wrap items-center gap-1.5 p-2">
      <Input
        value={filter.search ?? ""}
        onChange={(e) => patch({ search: e.target.value || undefined })}
        placeholder="Filter symbol / name / address…"
        className="w-52"
        aria-label="Search tokens"
      />
      <Select
        aria-label="Market cap bucket"
        value={filter.maxMarketCapUsd?.toString() ?? ""}
        onChange={(e) =>
          patch({ maxMarketCapUsd: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        {MCAP_BUCKETS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
      <Select
        aria-label="Minimum liquidity"
        value={filter.minLiquidityUsd?.toString() ?? ""}
        onChange={(e) =>
          patch({ minLiquidityUsd: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        {MIN_LIQUIDITY.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
      <Select
        aria-label="Maximum age"
        value={filter.maxAgeDays?.toString() ?? ""}
        onChange={(e) =>
          patch({ maxAgeDays: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        {MAX_AGE.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
      <Select
        aria-label="Minimum volume"
        value={filter.minVolume24hUsd?.toString() ?? ""}
        onChange={(e) =>
          patch({ minVolume24hUsd: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        {MIN_VOLUME.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
      <Select
        aria-label="Maximum risk tier"
        value={filter.maxRiskTier ?? ""}
        onChange={(e) =>
          patch({ maxRiskTier: (e.target.value || undefined) as RiskTier | undefined })
        }
      >
        {RISK.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
      <Select
        aria-label="Chain"
        value={filter.chains?.[0] ?? ""}
        onChange={(e) =>
          patch({ chains: e.target.value ? [e.target.value as Chain] : undefined })
        }
      >
        {CHAINS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>

      {filter.narrative ? (
        <button
          type="button"
          onClick={() => patch({ narrative: undefined })}
          className="num flex cursor-pointer items-center gap-1 rounded-[3px] border border-signal/40 bg-signal/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-signal hover:bg-signal/20"
        >
          {filter.narrative}
          <X size={10} />
        </button>
      ) : null}

      <div className="mx-1 hidden h-5 w-px bg-edge sm:block" />

      <Select
        aria-label="Filter preset"
        value={activePresetId ?? ""}
        onChange={(e) => {
          const preset = presets.find((p) => p.id === e.target.value);
          if (preset) {
            onPresetChange(preset.id);
            onChange({ ...preset.filter });
          } else {
            onPresetChange(null);
          }
        }}
        className="border-signal/30"
      >
        <option value="">Presets…</option>
        {presets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}{p.builtIn ? " ★" : ""}
          </option>
        ))}
      </Select>
      <Button variant="ghost" size="sm" onClick={() => setSaveOpen(true)} title="Save current filters as preset">
        <Save size={12} />
        Save
      </Button>
      {activePreset && !activePreset.builtIn ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            deletePreset(activePreset.id);
            onPresetChange(null);
          }}
        >
          <X size={12} />
          Delete preset
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        onClick={() => {
          onPresetChange(null);
          onChange({});
        }}
      >
        Reset
      </Button>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="w-[min(92vw,380px)]">
          <DialogTitle className="text-sm font-semibold text-ink">Save filter preset</DialogTitle>
          <DialogDescription className="mt-1 text-2xs text-muted">
            Saves the current filter set to this browser.
          </DialogDescription>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!presetName.trim()) return;
              const preset = savePreset(presetName.trim(), filter);
              onPresetChange(preset.id);
              setPresetName("");
              setSaveOpen(false);
            }}
          >
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name"
              autoFocus
            />
            <Button type="submit" variant="primary">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
