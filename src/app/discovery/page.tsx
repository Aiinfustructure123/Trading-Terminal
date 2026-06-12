"use client";

import Link from "next/link";
import { useTokens } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { Eyebrow } from "@/components/panel";
import { SourceBadge } from "@/components/source-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OpportunityCard } from "@/components/discovery/opportunity-card";
import { BUILT_IN_PRESETS, type ScreenerPreset } from "@/components/screener/presets";

function DiscoveryShelf({ preset }: { preset: ScreenerPreset }) {
  const { data, isLoading } = useTokens({ ...preset.query, limit: 4 });

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eyebrow>{preset.name}</Eyebrow>
          <SourceBadge sourceKey="ai" />
        </div>
        <Link href={`/screener?preset=${preset.id}`} className="text-[12px] text-signal hover:underline">
          View all in screener →
        </Link>
      </div>
      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.map((t) => (
            <OpportunityCard key={t.id} token={t} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function DiscoveryPage() {
  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Ranked Opportunities"
        title="Discovery"
        description="Top-ranked tokens from each preset screen, each card showing the score components driving the rank. Relative rankings grounded in observable data — never return predictions."
      />
      <div className="flex flex-col gap-8 p-5">
        {BUILT_IN_PRESETS.map((p) => (
          <DiscoveryShelf key={p.id} preset={p} />
        ))}
      </div>
    </div>
  );
}
