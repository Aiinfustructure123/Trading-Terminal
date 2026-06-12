"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hydration-safe localStorage state. Returns the default on the server and
 * first client render, then syncs. Writes are broadcast across hook instances
 * via a custom event so e.g. the watchlist count updates everywhere at once.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // corrupted entry — fall back to default
    }
    setHydrated(true);

    const onSync = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string; value: unknown };
      if (detail.key === key) setValue(detail.value as T);
    };
    window.addEventListener("local-storage-sync", onSync);
    return () => window.removeEventListener("local-storage-sync", onSync);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
          window.dispatchEvent(
            new CustomEvent("local-storage-sync", { detail: { key, value: resolved } })
          );
        } catch {
          // storage full / unavailable — keep in-memory state
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, set, hydrated] as const;
}
