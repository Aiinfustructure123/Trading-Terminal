"use client";

import { createLocalStore } from "./local-store";

const store = createLocalStore<string[]>("watchlist", []);

export function useWatchlist(): string[] {
  return store.useValue();
}

export function isWatched(tokenId: string): boolean {
  return store.get().includes(tokenId);
}

export function toggleWatch(tokenId: string): void {
  store.set((prev) =>
    prev.includes(tokenId) ? prev.filter((id) => id !== tokenId) : [...prev, tokenId],
  );
}

export const watchlistStore = store;
