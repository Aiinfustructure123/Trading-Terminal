"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { marketSource } from "@/lib/datasources";
import { formatPercent } from "@/lib/format";
import { squarify } from "@/lib/treemap";
import { Skeleton } from "@/components/terminal/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Treemap of the top tokens by mcap, colored by 24h change. */
export function MoversHeatmap() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["heatmap"],
    queryFn: () =>
      marketSource.listTokens({
        sort: { key: "marketCapUsd", dir: "desc" },
        limit: 28,
      }),
    refetchInterval: 12_000,
    placeholderData: (prev) => prev,
  });

  if (!data) {
    return (
      <div className="p-2">
        <Skeleton className="h-[296px]" />
      </div>
    );
  }

  const rects = squarify(
    data.map((t) => ({ id: t.id, value: t.marketCapUsd, token: t })),
  );

  return (
    <div className="relative m-2 h-[296px] overflow-hidden rounded-[4px]">
      {rects.map(({ item, x, y, w, h }) => {
        const t = item.token;
        const mag = Math.min(1, Math.abs(t.change24h) / 30);
        const bg =
          t.change24h >= 0
            ? `rgba(61, 220, 151, ${0.08 + mag * 0.38})`
            : `rgba(255, 77, 94, ${0.08 + mag * 0.38})`;
        const showText = w > 9 && h > 8;
        return (
          <Tooltip key={item.id} delayDuration={60}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => router.push(`/token/${t.id}`)}
                className="absolute flex cursor-pointer flex-col items-center justify-center overflow-hidden border border-bg/80 transition-[filter] hover:brightness-150"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                  background: bg,
                }}
              >
                {showText ? (
                  <>
                    <span className="num text-2xs font-semibold text-ink/90">
                      {t.symbol}
                    </span>
                    <span
                      className="num text-[9px]"
                      style={{ color: t.change24h >= 0 ? "var(--profit)" : "var(--danger)" }}
                    >
                      {formatPercent(t.change24h)}
                    </span>
                  </>
                ) : null}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="num text-xs text-ink">
                ${t.symbol} <span className="text-muted">· {t.name}</span>
              </div>
              <div className="num mt-0.5 text-2xs text-muted">
                24h{" "}
                <span style={{ color: t.change24h >= 0 ? "var(--profit)" : "var(--danger)" }}>
                  {formatPercent(t.change24h)}
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
