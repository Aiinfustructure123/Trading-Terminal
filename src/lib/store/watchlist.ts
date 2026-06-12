"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "alpha.watchlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/** Cross-component subscription so every watchlist toggle updates live. */
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function useWatchlist() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(read());
    const l = () => setItems(read());
    listeners.add(l);
    window.addEventListener("storage", l);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", l);
    };
  }, []);

  const toggle = useCallback((address: string) => {
    const cur = read();
    const next = cur.includes(address) ? cur.filter((a) => a !== address) : [...cur, address];
    localStorage.setItem(KEY, JSON.stringify(next));
    emit();
  }, []);

  const has = useCallback((address: string) => items.includes(address), [items]);

  return { items, toggle, has };
}
