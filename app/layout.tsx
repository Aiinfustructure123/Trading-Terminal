import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Providers } from "@/app/providers";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const data = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap"
});

export const metadata: Metadata = {
  title: "ALPHA Terminal",
  description: "Retail crypto signals-intelligence terminal."
};

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/styleguide", label: "Styleguide" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${data.variable}`}>
      <body>
        <Providers>
          <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-border bg-bg/82 backdrop-blur-xl">
              <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6">
                <Link href="/" className="flex items-center gap-3" aria-label="ALPHA Terminal dashboard">
                  <span className="grid size-8 place-items-center rounded-xl border border-signal/35 bg-signal/10 text-signal shadow-signal">
                    A
                  </span>
                  <span>
                    <span className="block text-sm font-bold uppercase tracking-[0.2em] text-ink">Alpha Terminal</span>
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-muted">Signals intelligence</span>
                  </span>
                </Link>
                <nav className="terminal-scrollbar ml-auto hidden max-w-[980px] items-center gap-1 overflow-x-auto rounded-full border border-border bg-panel/70 p-1 lg:flex">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:bg-white/[0.04] hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
