"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * Hydration-safe localStorage state built on useSyncExternalStore.
 * All hook instances for the same key share one in-memory entry, so a write
 * anywhere (e.g. toggling a watchlist star) updates every subscriber at once.
 */

interface Entry {
  value: unknown;
  listeners: Set<() => void>;
}

const cache = new Map<string, Entry>();

function getEntry(key: string, defaultValue: unknown): Entry {
  let entry = cache.get(key);
  if (!entry) {
    let value = defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) value = JSON.parse(raw);
    } catch {
      // corrupted or unavailable storage — fall back to default
    }
    entry = { value, listeners: new Set() };
    cache.set(key, entry);
  }
  return entry;
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const defaultRef = useRef(defaultValue);

  const subscribe = useCallback(
    (cb: () => void) => {
      const entry = getEntry(key, defaultRef.current);
      entry.listeners.add(cb);
      return () => entry.listeners.delete(cb);
    },
    [key]
  );

  const value = useSyncExternalStore(
    subscribe,
    () => getEntry(key, defaultRef.current).value as T,
    () => defaultRef.current
  );

  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const entry = getEntry(key, defaultRef.current);
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(entry.value as T) : next;
      entry.value = resolved;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // storage full / unavailable — keep in-memory state
      }
      entry.listeners.forEach((l) => l());
    },
    [key]
  );

  return [value, set, hydrated] as const;
}
