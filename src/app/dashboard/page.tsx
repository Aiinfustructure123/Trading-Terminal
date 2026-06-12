import Link from "next/link";
import { DashboardView } from "@/features/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border/70 bg-panel/85 px-4 py-3">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted">
            <span className="eyebrow">UI-FIRST PHASE 0</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/styleguide"
              className="rounded-md border border-border px-3 py-1.5 text-muted transition hover:border-signal/55 hover:text-signal"
            >
              Styleguide
            </Link>
            <Link
              href="/"
              className="rounded-md border border-border px-3 py-1.5 text-muted transition hover:border-signal/55 hover:text-signal"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>
      <DashboardView />
    </div>
  );
}
