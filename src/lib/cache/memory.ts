/**
 * Simple server-side in-memory TTL cache.
 * Used in API routes to avoid hammering external APIs.
 * Upstash Redis replaces this in production when UPSTASH_REDIS_REST_URL is set.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /** Wrap an async fetcher: return cached value or call fetcher and cache result */
  async getOrFetch<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fetcher();
    this.set(key, value, ttlMs);
    return value;
  }
}

// Singleton — survives across requests in the same server process
export const cache = new MemoryCache();

// TTL constants
export const TTL = {
  TOKENS_LIST:   30_000,   // 30 s  — screener list
  TOKEN_DETAIL:  20_000,   // 20 s  — single token
  OHLCV:         60_000,   // 1 min — candles
  SECURITY:     300_000,   // 5 min — GoPlus / RugCheck
  MARKET:       900_000,   // 15 min — CoinGecko global
  NARRATIVES:   120_000,   // 2 min — category flows
  NEW_LAUNCHES:  15_000,   // 15 s  — new token feed
};
