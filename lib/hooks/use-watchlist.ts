"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";

export function useWatchlist() {
  const [ids, setIds, hydrated] = useLocalStorage<string[]>("alpha:watchlist", []);

  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setIds]
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, has, hydrated };
}
