"use client";

import Link from "next/link";
import { useOpportunities } from "@/lib/hooks/use-data";
import { Panel, Skeleton } from "@/components/ui/primitives";
import { OpportunityCard } from "@/components/token/opportunity-card";

export function ConvictionOpportunities() {
  const { data, isLoading } = useOpportunities(6);
  return (
    <Panel
      title="AI Conviction Opportunities"
      source="market"
      className="h-full"
      action={<Link href="/discovery" className="font-mono text-[10px] text-signal hover:underline">View all →</Link>}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading || !data
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-md" />)
          : data.map((t) => <OpportunityCard key={t.address} token={t} />)}
      </div>
    </Panel>
  );
}
