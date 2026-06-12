"use client";

import { useSyncExternalStore } from "react";

/**
 * Minimal localStorage-backed store with cross-component reactivity via
 * useSyncExternalStore. Server snapshot always returns the initial value so
 * SSR markup is stable; persisted state hydrates on the client.
 */
export interface LocalStore<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(listener: () => void): () => void;
  useValue(): T;
}

export function createLocalStore<T>(key: string, initial: T): LocalStore<T> {
  const storageKey = `alpha-terminal:${key}`;
  let cached: T = initial;
  let hydrated = false;
  const listeners = new Set<() => void>();

  function hydrate(): void {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) cached = JSON.parse(raw) as T;
    } catch {
      // corrupted storage — fall back to initial
    }
  }

  function get(): T {
    hydrate();
    return cached;
  }

  function set(next: T | ((prev: T) => T)): void {
    hydrate();
    cached = typeof next === "function" ? (next as (prev: T) => T)(cached) : next;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(cached));
    } catch {
      // storage full/unavailable — keep in-memory state
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, get, () => initial);
  }

  return { get, set, subscribe, useValue };
}
