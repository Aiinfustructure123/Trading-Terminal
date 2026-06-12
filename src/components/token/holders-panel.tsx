"use client";

import type { CreatorStatus } from "@/lib/datasources";
import { useHolders } from "@/lib/queries";
import { Panel, Eyebrow } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact, shortenAddress } from "@/lib/format";

const CREATOR_COPY: Record<CreatorStatus, { label: string; variant: "profit" | "warn" | "danger" | "neutral" }> = {
  sold: { label: "Creator sold out", variant: "danger" },
  partial: { label: "Creator partially sold", variant: "warn" },
  holding: { label: "Creator still holding", variant: "profit" },
  unknown: { label: "Creator status unknown", variant: "neutral" },
};

const BUCKET_COLORS = ["bg-danger", "bg-warn", "bg-signal", "bg-profit"];

export function HoldersPanel({ tokenId }: { tokenId: string }) {
  const { data, isLoading } = useHolders(tokenId);

  return (
    <Panel title="Holders" sourceKey="onchain">
      {isLoading || !data ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Eyebrow>Holders</Eyebrow>
              <p className="tabular mt-1 text-metric font-semibold text-ink">{formatCompact(data.totalHolders)}</p>
            </div>
            <div>
              <Eyebrow>Top 10 hold</Eyebrow>
              <p className="tabular mt-1 text-metric font-semibold text-ink">{data.top10Pct}%</p>
            </div>
            <div>
              <Eyebrow>Creator</Eyebrow>
              <p className="tabular mt-1 text-metric font-semibold text-ink">{data.creatorPct}%</p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Eyebrow>Distribution</Eyebrow>
              <Badge variant={CREATOR_COPY[data.creatorStatus].variant}>{CREATOR_COPY[data.creatorStatus].label}</Badge>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-bg">
              {data.buckets.map((b, i) => (
                <div
                  key={b.label}
                  className={BUCKET_COLORS[i % BUCKET_COLORS.length]}
                  style={{ width: `${b.pct}%` }}
                  title={`${b.label}: ${b.pct}%`}
                />
              ))}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {data.buckets.map((b, i) => (
                <span key={b.label} className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className={`h-2 w-2 rounded-sm ${BUCKET_COLORS[i % BUCKET_COLORS.length]}`} />
                  {b.label} <span className="tabular text-ink">{b.pct}%</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>Top holders</Eyebrow>
            <ul className="mt-1.5 flex flex-col divide-y divide-edge/60">
              {data.topHolders.slice(0, 6).map((h) => (
                <li key={h.rank} className="flex items-center justify-between py-1.5 text-[12px]">
                  <span className="flex items-center gap-2">
                    <span className="tabular w-5 text-muted">#{h.rank}</span>
                    <span className="tabular text-ink">{shortenAddress(h.address)}</span>
                    {h.label && <Badge variant="neutral">{h.label}</Badge>}
                  </span>
                  <span className="tabular text-ink">{h.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Panel>
  );
}
