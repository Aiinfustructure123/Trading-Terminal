"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { shortAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AddressChip({
  address,
  className,
  chars = 4,
}: {
  address: string;
  className?: string;
  chars?: number;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={address}
      className={cn(
        "num inline-flex items-center gap-1.5 rounded-[4px] border border-edge bg-panel-2 px-2 py-0.5 text-2xs text-muted transition-colors hover:border-edge-bright hover:text-ink cursor-pointer",
        className,
      )}
    >
      {shortAddress(address, chars)}
      {copied ? (
        <Check size={11} className="text-profit" />
      ) : (
        <Copy size={11} className="opacity-60" />
      )}
    </button>
  );
}
