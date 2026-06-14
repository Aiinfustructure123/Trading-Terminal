/**
 * Live TokenDataSource — DexScreener + GeckoTerminal.
 * Called by components via TanStack Query through our own Next.js API routes.
 */

import type {
  TokenDataSource, Token, Chain, OHLCVData, CandleInterval,
  NewLaunchesData, ScreenerParams, SourceMeta, NewLaunch, RiskTier,
} from "../types";
import type { DexPair } from "../schemas/dexscreener";
import { buildConvictionScore } from "@/lib/scoring";
import { SAMPLE_TOKENS } from "../sample/tokens";

const LIVE_META: SourceMeta = {
  mode: "live",
  lastUpdated: new Date().toISOString(),
  provider: "dexscreener",
};

// ── DexPair → Token ──────────────────────────────────────────────────────────

function chainFromId(id: string): Chain {
  if (id === "solana") return "solana";
  if (id === "ethereum" || id === "eth") return "ethereum";
  if (id === "base") return "base";
  return "solana";
}

function pairToToken(pair: DexPair): Token {
  const liquidity   = pair.liquidity?.usd ?? 0;
  const volume24h   = pair.volume?.h24 ?? 0;
  const volume6h    = pair.volume?.h6  ?? 0;
  const volume1h    = pair.volume?.h1  ?? 0;
  const buys24h     = pair.txns?.h24?.buys  ?? 0;
  const sells24h    = pair.txns?.h24?.sells ?? 0;
  const price       = parseFloat(pair.priceUsd ?? pair.priceNative ?? "0") || 0;
  const ageHours    = pair.pairCreatedAt
    ? (Date.now() - pair.pairCreatedAt) / 3600_000
    : 0;
  const ageDays = ageHours / 24;

  const score = buildConvictionScore({
    momentum: {
      priceChange5m:  pair.priceChange?.m5  ?? 0,
      priceChange1h:  pair.priceChange?.h1  ?? 0,
      priceChange6h:  pair.priceChange?.h6  ?? 0,
      priceChange24h: pair.priceChange?.h24 ?? 0,
      volume24h,
      volume6h,
      volume1h,
      buys24h,
      sells24h,
      liquidity,
    },
    security: {
      goplus:   null,
      rugcheck: null,
      liquidity,
      ageHours,
      topHolderConcentrationPct: 0, // updated when Helius data available
    },
  });

  return {
    address:           pair.baseToken.address,
    symbol:            pair.baseToken.symbol,
    name:              pair.baseToken.name,
    chain:             chainFromId(pair.chainId),
    logoUrl:           pair.info?.imageUrl,
    price,
    priceChange5m:     pair.priceChange?.m5  ?? 0,
    priceChange1h:     pair.priceChange?.h1  ?? 0,
    priceChange6h:     pair.priceChange?.h6  ?? 0,
    priceChange24h:    pair.priceChange?.h24 ?? 0,
    volume24h,
    liquidity,
    marketCap:         pair.marketCap ?? (price * 1e9),
    fdv:               pair.fdv ?? undefined,
    txns24h:           { buys: buys24h, sells: sells24h },
    age:               ageDays,
    holderCount:       0,
    topHolderConcentration: 0,
    score,
    launchedAt:        pair.pairCreatedAt
      ? new Date(pair.pairCreatedAt).toISOString()
      : undefined,
    dexUrl:            pair.url,
  };
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchFromAPI<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`API ${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Service implementation ───────────────────────────────────────────────────

export const liveTokenSource: TokenDataSource = {
  async getToken(address: string): Promise<Token> {
    try {
      const data = await fetchFromAPI<{ pairs: DexPair[] }>(
        `/api/dexscreener/tokens?addresses=${encodeURIComponent(address)}`
      );
      const pairs = (data.pairs ?? []).filter(p =>
        p.baseToken.address.toLowerCase() === address.toLowerCase()
      );
      if (!pairs.length) throw new Error("Token not found");
      // Pick the pair with highest liquidity
      const best = pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
      return pairToToken(best);
    } catch {
      // Fallback to sample
      return SAMPLE_TOKENS.find(t => t.address === address) ?? SAMPLE_TOKENS[0];
    }
  },

  async getTokens(params: ScreenerParams) {
    try {
      // Use GeckoTerminal trending as the base pool of tokens
      const network = params.chain === "ethereum" ? "eth"
        : params.chain === "base" ? "base" : "solana";

      const trending = await fetchFromAPI<{ data: Array<{ attributes: Record<string, unknown>; relationships?: Record<string, unknown> }> }>(
        `/api/geckoterminal/trending?network=${network}`
      );

      // Also fetch via search if there's a query
      let searchPairs: DexPair[] = [];
      if (params.search) {
        const searched = await fetchFromAPI<{ pairs: DexPair[] }>(
          `/api/dexscreener/search?q=${encodeURIComponent(params.search)}`
        );
        searchPairs = searched.pairs ?? [];
      }

      // Extract pool addresses from trending, fetch full data from DexScreener
      const poolAddresses = (trending.data ?? [])
        .slice(0, 30)
        .map(p => p.attributes?.address as string)
        .filter(Boolean);

      let dexPairs: DexPair[] = [...searchPairs];

      if (poolAddresses.length) {
        // Batch fetch: DexScreener accepts comma-separated addresses
        const chunks: string[][] = [];
        for (let i = 0; i < poolAddresses.length; i += 30) {
          chunks.push(poolAddresses.slice(i, i + 30));
        }
        const chunkResults = await Promise.allSettled(
          chunks.map(chunk =>
            fetchFromAPI<{ pairs: DexPair[] }>(
              `/api/dexscreener/tokens?addresses=${chunk.join(",")}`
            )
          )
        );
        chunkResults.forEach(r => {
          if (r.status === "fulfilled") {
            dexPairs = [...dexPairs, ...(r.value.pairs ?? [])];
          }
        });
      }

      // Deduplicate by base token address, take highest-liquidity pair per token
      const byAddress = new Map<string, DexPair>();
      dexPairs.forEach(pair => {
        const addr = pair.baseToken.address;
        const existing = byAddress.get(addr);
        if (!existing || (pair.liquidity?.usd ?? 0) > (existing.liquidity?.usd ?? 0)) {
          byAddress.set(addr, pair);
        }
      });

      let tokens = Array.from(byAddress.values())
        .filter(p => p.priceUsd || p.priceNative)
        .map(p => pairToToken(p));

      // Apply filters
      if (params.chain)        tokens = tokens.filter(t => t.chain === params.chain);
      if (params.mcapMax)      tokens = tokens.filter(t => t.marketCap <= params.mcapMax!);
      if (params.mcapMin)      tokens = tokens.filter(t => t.marketCap >= params.mcapMin!);
      if (params.liquidityMin) tokens = tokens.filter(t => t.liquidity >= params.liquidityMin!);
      if (params.ageMaxDays)   tokens = tokens.filter(t => t.age <= params.ageMaxDays!);
      if (params.volumeMin)    tokens = tokens.filter(t => t.volume24h >= params.volumeMin!);
      if (params.riskTiers?.length) {
        tokens = tokens.filter(t => params.riskTiers!.includes(t.score.riskTier));
      }

      // Sort
      const sortBy  = params.sortBy ?? "score";
      const sortDir = params.sortDir === "asc" ? 1 : -1;
      tokens.sort((a, b) => {
        const av = sortBy === "score" ? a.score.composite
          : sortBy === "volume24h" ? a.volume24h
          : sortBy === "mcap" ? a.marketCap
          : sortBy === "liquidity" ? a.liquidity
          : sortBy === "age" ? a.age
          : a.priceChange24h;
        const bv = sortBy === "score" ? b.score.composite
          : sortBy === "volume24h" ? b.volume24h
          : sortBy === "mcap" ? b.marketCap
          : sortBy === "liquidity" ? b.liquidity
          : sortBy === "age" ? b.age
          : b.priceChange24h;
        return (av - bv) * sortDir;
      });

      const total  = tokens.length;
      const offset = params.offset ?? 0;
      const limit  = params.limit  ?? 50;
      const page   = tokens.slice(offset, offset + limit);

      return {
        tokens: page,
        total,
        source: { ...LIVE_META, lastUpdated: new Date().toISOString() },
      };
    } catch (err) {
      console.error("[live/dexscreener] getTokens fallback", err);
      // Graceful degradation to sample
      const { sampleTokenSource } = await import("../sample/tokens");
      return sampleTokenSource.getTokens(params);
    }
  },

  async getNewLaunches(_chain: Chain, limit = 20): Promise<NewLaunchesData> {
    try {
      const boosts = await fetchFromAPI<Array<{ chainId: string; tokenAddress: string; icon?: string }>>("/api/dexscreener/new-launches");

      // Fetch pair data for the boosted tokens
      const solanaBoosts = boosts
        .filter(b => b.chainId === "solana")
        .slice(0, 20);

      if (!solanaBoosts.length) throw new Error("No launches");

      const addresses = solanaBoosts.map(b => b.tokenAddress).join(",");
      const tokenData = await fetchFromAPI<{ pairs: DexPair[] }>(
        `/api/dexscreener/tokens?addresses=${encodeURIComponent(addresses)}`
      );

      const seen = new Set<string>();
      const launches: NewLaunch[] = [];

      for (const pair of tokenData.pairs ?? []) {
        if (seen.has(pair.baseToken.address)) continue;
        seen.add(pair.baseToken.address);

        const token = pairToToken(pair);
        const ageHours = pair.pairCreatedAt
          ? (Date.now() - pair.pairCreatedAt) / 3600_000
          : 0;

        launches.push({
          address:          token.address,
          symbol:           token.symbol,
          name:             token.name,
          chain:            token.chain,
          launchedAt:       token.launchedAt ?? new Date().toISOString(),
          initialLiquidity: token.liquidity * 0.7,
          currentLiquidity: token.liquidity,
          volume1h:         token.volume24h / Math.max(1, ageHours),
          riskTier:         token.score.riskTier as RiskTier,
          score:            token.score.composite,
        });

        if (launches.length >= limit) break;
      }

      return {
        launches,
        source: { ...LIVE_META, lastUpdated: new Date().toISOString() },
      };
    } catch (err) {
      console.error("[live/dexscreener] getNewLaunches fallback", err);
      const { sampleTokenSource } = await import("../sample/tokens");
      return sampleTokenSource.getNewLaunches(_chain, limit);
    }
  },

  async getOHLCV(address: string, _chain: Chain, interval: CandleInterval): Promise<OHLCVData> {
    try {
      // First get the pair address from DexScreener (GeckoTerminal uses pool address)
      const tokenData = await fetchFromAPI<{ pairs: DexPair[] }>(
        `/api/dexscreener/tokens?addresses=${encodeURIComponent(address)}`
      );
      const topPair = (tokenData.pairs ?? [])
        .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

      if (!topPair) throw new Error("No pair found");

      const network = chainFromId(topPair.chainId) === "ethereum" ? "eth"
        : chainFromId(topPair.chainId) === "base" ? "base" : "solana";

      const ohlcvData = await fetchFromAPI<{
        data: { attributes: { ohlcv_list: number[][] } }
      }>(
        `/api/geckoterminal/ohlcv?network=${network}&pool=${topPair.pairAddress}&interval=${interval}`
      );

      const candles = (ohlcvData.data?.attributes?.ohlcv_list ?? [])
        .map(([time, open, high, low, close, volume]) => ({
          time: Math.floor(time),
          open, high, low, close, volume,
        }))
        .sort((a, b) => a.time - b.time);

      return {
        address,
        interval,
        candles,
        source: { mode: "live", lastUpdated: new Date().toISOString(), provider: "geckoterminal" },
      };
    } catch (err) {
      console.error("[live] getOHLCV fallback", err);
      const { sampleTokenSource } = await import("../sample/tokens");
      return sampleTokenSource.getOHLCV(address, _chain, interval);
    }
  },
};
