import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";

import "./globals.css";
import { Providers } from "@/app/providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alpha Terminal",
  description: "Explainable crypto intelligence terminal.",
};

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/styleguide", label: "Styleguide" },
  { href: "/screener", label: "Screener" },
  { href: "/discovery", label: "Discovery" },
  { href: "/smart-money", label: "Smart Money" },
  { href: "/alerts", label: "Alerts" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body>
        <Providers>
          <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-line bg-bg/88 backdrop-blur-xl">
              <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <Link href="/" className="group flex items-center gap-3 rounded-sm">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-signal/35 bg-signal/10 text-signal shadow-signal">
                    Α
                  </span>
                  <span>
                    <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-ink">
                      Alpha Terminal
                    </span>
                    <span className="eyebrow mt-1 block">Signals intelligence</span>
                  </span>
                </Link>
                <nav className="terminal-scrollbar flex gap-1 overflow-x-auto md:justify-end">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="shrink-0 rounded-lg border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted transition hover:border-line hover:bg-white/[0.03] hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
