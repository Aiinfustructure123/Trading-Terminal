"use client";

import * as React from "react";

/** SSR-safe localStorage state with cross-component sync via a custom event. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(initial);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setHydrated(true);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string } | undefined;
      if (detail?.key === key) {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw != null) setValue(JSON.parse(raw) as T);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("local-storage", handler);
    return () => window.removeEventListener("local-storage", handler);
  }, [key]);

  const update = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
          window.dispatchEvent(new CustomEvent("local-storage", { detail: { key } }));
        } catch {
          /* ignore */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
