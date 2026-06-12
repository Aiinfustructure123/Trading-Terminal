import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <section className="panel glass w-full max-w-xl rounded-xl p-6">
        <p className="eyebrow">ALPHA TERMINAL</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Phase 0 Interface Scaffold</h1>
        <p className="mt-3 text-sm text-muted">
          UI-first build with sample-backed datasource interfaces and modular panels.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/styleguide"
            className="inline-flex items-center justify-center rounded border border-signal/40 bg-signal/10 px-4 py-2 text-sm font-medium text-signal transition hover:bg-signal/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal"
          >
            Open Styleguide
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded border border-border bg-panel px-4 py-2 text-sm font-medium text-ink transition hover:border-signal/40 hover:text-signal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal"
          >
            Open Master Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
