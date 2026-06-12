"use client";

import React from "react";
import type { DataMode, RiskTier } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

// ── SAMPLE / LIVE badge ──────────────────────────────────────────────────────

interface DataModeBadgeProps {
  mode: DataMode;
  className?: string;
}

export function DataModeBadge({ mode, className }: DataModeBadgeProps) {
  if (mode === "sample") {
    return (
      <span className={cn("badge-sample", className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-warn inline-block" />
        SAMPLE DATA
      </span>
    );
  }
  if (mode === "live") {
    return (
      <span className={cn("badge-live", className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-signal inline-block animate-pulse" />
        LIVE
      </span>
    );
  }
  return (
    <span className={cn("badge bg-muted/10 text-muted border border-border", className)}>
      DEGRADED
    </span>
  );
}

// ── Risk tier badge ──────────────────────────────────────────────────────────

interface RiskBadgeProps {
  tier: RiskTier;
  className?: string;
}

export function RiskBadge({ tier, className }: RiskBadgeProps) {
  const cls = {
    Low:      "badge-low",
    Moderate: "badge-moderate",
    High:     "badge-high",
    Avoid:    "badge-avoid",
  }[tier];
  return <span className={cn(cls, className)}>{tier}</span>;
}

// ── Score pill ───────────────────────────────────────────────────────────────

export function ScorePill({ score, className }: { score: number; className?: string }) {
  const color =
    score >= 70 ? "bg-profit/10 text-profit border-profit/30" :
    score >= 45 ? "bg-warn/10 text-warn border-warn/30" :
    score >= 20 ? "bg-danger/10 text-danger border-danger/30" :
                  "bg-muted/10 text-muted border-border";
  return (
    <span className={cn("badge border font-mono", color, className)}>
      {score.toFixed(0)}
    </span>
  );
}

// ── Chain pill ───────────────────────────────────────────────────────────────

const CHAIN_COLORS: Record<string, string> = {
  solana:   "bg-[#9945FF]/10 text-[#9945FF] border-[#9945FF]/30",
  ethereum: "bg-[#627EEA]/10 text-[#627EEA] border-[#627EEA]/30",
  base:     "bg-[#0052FF]/10 text-[#0052FF] border-[#0052FF]/30",
};

export function ChainBadge({ chain, className }: { chain: string; className?: string }) {
  const color = CHAIN_COLORS[chain] ?? "bg-muted/10 text-muted border-border";
  return (
    <span className={cn("badge border", color, className)}>
      {chain.toUpperCase()}
    </span>
  );
}

// ── Severity badge (for risk flags / alerts) ─────────────────────────────────

const SEVERITY_CLASSES: Record<string, string> = {
  critical: "badge bg-danger/20 text-danger border border-danger/50",
  high:     "badge bg-danger/10 text-danger border border-danger/30",
  medium:   "badge bg-warn/10 text-warn border border-warn/30",
  low:      "badge bg-signal/10 text-signal border border-signal/30",
  info:     "badge bg-muted/10 text-muted border border-border",
};

export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  return (
    <span className={cn(SEVERITY_CLASSES[severity] ?? SEVERITY_CLASSES.info, className)}>
      {severity}
    </span>
  );
}
