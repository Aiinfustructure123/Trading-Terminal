import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { WatchlistProvider } from "@/lib/watchlist";
import { CommandPaletteProvider } from "@/components/command-palette";
import { AppShell } from "@/components/app-shell";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alpha Terminal — Crypto Signals Intelligence",
  description:
    "A retail crypto intelligence terminal aggregating on-chain, market, and trend signals into explainable scores.",
};

export const viewport: Viewport = {
  themeColor: "#07080C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <WatchlistProvider>
            <CommandPaletteProvider>
              <AppShell>{children}</AppShell>
            </CommandPaletteProvider>
          </WatchlistProvider>
        </Providers>
      </body>
    </html>
  );
}
