"use client";

import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { AlertsTicker } from "@/components/shell/alerts-ticker";
import { CommandPalette, useCommandPalette } from "@/components/shell/command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useCommandPalette();
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenPalette={() => setOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        <AlertsTicker />
      </div>
      <CommandPalette open={open} setOpen={setOpen} />
    </div>
  );
}
