"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/terminal/Sidebar";
import { AlertTicker } from "@/components/terminal/AlertTicker";
import { CommandPalette } from "@/components/terminal/CommandPalette";

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCmdOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar onCommandOpen={() => setCmdOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
        <AlertTicker />
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
