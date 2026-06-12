"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { NAV } from "@/components/shell/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-[212px] shrink-0 flex-col border-r border-border bg-panel md:flex">
      <Link href="/" className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <span className="relative inline-flex size-7 items-center justify-center rounded-md bg-signal/10 text-signal">
          <Activity className="size-4" />
          <span className="absolute inset-0 rounded-md ring-1 ring-signal/40" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm font-semibold tracking-wide text-ink">ALPHA</span>
          <span className="eyebrow" style={{ fontSize: 8 }}>Terminal</span>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                active ? "bg-signal/10 text-signal" : "text-muted hover:bg-panel-2 hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 font-display">{item.label}</span>
              {item.shortcut && <span className="font-mono text-[9px] text-muted/60 group-hover:text-muted">{item.shortcut}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-md border border-warn/20 bg-warn/5 px-2.5 py-2">
          <div className="eyebrow text-warn" style={{ color: "var(--color-warn)" }}>Phase 0</div>
          <p className="mt-1 text-[10px] leading-snug text-muted">Sample data layer active. Panels flip to LIVE as sources connect.</p>
        </div>
      </div>
    </aside>
  );
}
