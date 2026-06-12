"use client";

import * as React from "react";
import { useLocalStorage } from "@/lib/use-local-storage";

interface WatchlistContextValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  hydrated: boolean;
}

const WatchlistContext = React.createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds, hydrated] = useLocalStorage<string[]>("alpha:watchlist", []);

  const value = React.useMemo<WatchlistContextValue>(
    () => ({
      ids,
      hydrated,
      has: (id) => ids.includes(id),
      toggle: (id) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      add: (id) => setIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
      remove: (id) => setIds((prev) => prev.filter((x) => x !== id)),
    }),
    [ids, hydrated, setIds],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const ctx = React.useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}
