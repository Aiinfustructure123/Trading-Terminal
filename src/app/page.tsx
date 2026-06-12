import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6 px-4 py-8 md:px-8">
      <section className="panel-surface p-6 md:p-8">
        <p className="eyebrow">ALPHA TERMINAL</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Crypto Intelligence Interface / Phase 0
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          UI-first terminal foundation with typed datasource abstractions, explainable conviction visuals, and a
          Bloomberg-density dashboard powered by explicitly labeled sample data.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/styleguide"
            className="rounded-md border border-signal/55 bg-signal/10 px-4 py-2 text-sm font-medium text-signal transition hover:bg-signal/15"
          >
            Open /styleguide
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-signal/60 hover:text-signal"
          >
            Open Master Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
