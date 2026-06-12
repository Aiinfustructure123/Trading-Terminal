"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Token } from "@/lib/datasources/types";
import { RiskBadge } from "@/components/ui/badge";
import { ScoreBreakdown } from "./breakdown";

/**
 * Global score-breakdown modal — any Conviction Ring anywhere in the app can
 * open it. Glassmorphism is allowed here: it's an overlay, not a data table.
 */

interface BreakdownModalContextValue {
  open: (token: Token) => void;
}

const BreakdownModalContext = createContext<BreakdownModalContextValue>({ open: () => {} });

export function useBreakdownModal() {
  return useContext(BreakdownModalContext);
}

export function BreakdownModalProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<Token | null>(null);

  const open = useCallback((t: Token) => setToken(t), []);
  const close = useCallback(() => setToken(null), []);

  useEffect(() => {
    if (!token) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [token, close]);

  return (
    <BreakdownModalContext.Provider value={{ open }}>
      {children}
      {token && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Score breakdown for ${token.symbol}`}
        >
          <div
            className="glass animate-panel-in w-full max-w-2xl rounded-lg p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex flex-col">
                <span className="eyebrow">Score breakdown</span>
                <span className="text-lg font-semibold">
                  {token.symbol}
                  <span className="ml-2 text-sm font-normal text-muted">{token.name}</span>
                </span>
              </div>
              <RiskBadge tier={token.riskTier} />
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href={`/token/${token.id}`}
                  onClick={close}
                  className="rounded border border-panel-border px-2.5 py-1 text-xs text-signal hover:bg-signal/10"
                >
                  Open case file
                </Link>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="rounded p-1 text-muted hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <ScoreBreakdown score={token.conviction} ringSize={110} />
            </div>
          </div>
        </div>
      )}
    </BreakdownModalContext.Provider>
  );
}
