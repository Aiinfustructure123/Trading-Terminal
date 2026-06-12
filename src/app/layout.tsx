import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/terminal/Providers";

export const metadata: Metadata = {
  title: "AlphaTerminal — Crypto Intelligence",
  description: "On-chain signals intelligence terminal for retail crypto traders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
